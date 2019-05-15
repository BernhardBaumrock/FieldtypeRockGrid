var act; // todo: remove

/**
 * RockGridAction class
 */
function RockGridAction(name) {
  /**
   * Action name
   */
  this.name = name;

  /**
   * Connected grid for this action
   */
  this.grid = null;

  /**
   * VEX modal instance
   */
  this.modal = null;

  /**
   * Batcher instance for this action
   */
  this.batcher = new RockBatcher();

  /**
   * Timestamp of the last progressbar update
   */
  this.progressBarLast = null;

  /**
   * Delay in ms for updating the progressbar
   * 
   * This is necessary for the progressbar.js script to work because it is debounced
   * and does not update the bar if it is called too often without any delay
   */
  this.progressBarDelay = 100;
};

/**
 * Get rows that get executed for this action (selected, filtered...)
 */
RockGridAction.prototype.getIds = function() {
  return this.grid.getIds(this.getRowSelectionType());
}

/**
 * Get label of this action via GUI
 */
RockGridAction.prototype.getLabel = function() {
  var $gui = this.grid.getActionsGui();
  return $gui.find('.RockGridActionSelect option[value=' + this.name + ']').text();
}

/**
 * Get row selection type
 */
RockGridAction.prototype.getRowSelectionType = function() {
  var $gui = this.grid.getActionsGui();
  if(!$gui) return 'none'; // we fallback to the "none" type
  return $gui.find('input.RockGridActionRows:checked').val();
}

/**
 * Execute this action
 */
RockGridAction.prototype.execute = function() {
  vex.dialog.alert('This action cannot be executed!');
}

/**
 * Get GUI of this single action (not the fieldset of all actions)
 */
RockGridAction.prototype.getGui = function() {
  return this.grid.getActionsGui().find('[data-action='+this.name+']');
}



RockGridAction.prototype.onYes = function(e) {
  $button = $(e.target).closest('button');
  if(!$button.hasClass('clicked')) {
    $button.addClass('clicked actionYes').html('<i class="fa fa-spin fa-spinner"></i>');
    this.batcher.start();
  }
}
RockGridAction.prototype.onNo = function(e) {
  var batcher = this.batcher;
  if(batcher.running) batcher.abort();
  else this.modal.close();
}

/**
 * Function to properly and efficiently update the progressbar
 */
RockGridAction.prototype.updateProgressbar = function(event, data) {
  // force update to run?
  var force = false;
  if(event == 'end') force = true;
  else if(event == 'abort') force = true;
  else if(event == 'batchDone') {} // do nothing
  else return;

  // execute update?
  var last = this.progressBarLast;
  var now = Date.now();
  var next = last + this.progressBarDelay;
  if(!force && now < next) return;

  this.progressBarLast = now;
  this.progressbar.animate(this.batcher.progress*1/100);
}

/**
 * Log events to the action's log array
 */
RockGridAction.prototype.addLog = function(event, result) {
  var obj = {type:event,msg:event};
  switch(event) {
    case 'reset':
      obj = null;
      break;
    case 'start':
    case 'end':
      // do nothing
      break;
    case 'abort':
      obj.type = 'warning';
      break;
    case 'batchDone':
      obj.type = result.type || event;
      obj.msg = event + " " + this.batcher.batchIndex + "/" + this.batcher.numBatches + ": " + (result.msg||'---');
      break;
    default:
      return;
  }

  // call callback to do something with the last log
  var $modal = $('.RockBatcherVexConfirm').closest('.vex-content');
  this.logChanged(obj, $modal);
}

RockGridAction.prototype.logChanged = function(last, $modal) {
  if(!last) return;

  var $log = $modal.find('.log');
  var $table = $log.find('table');
  if(!$table.length) {
    $table = $("<table></table>");
    $log.append($table);
  }

  // show output
  $log.fadeIn('slow');
  $table.prepend("<tr><td>"+this.icon(last.type)+"</td><td>" + last.msg + "</td></tr>");

  // update error and warning counts
  if(last.type == 'warning' || last.type == 'error') {
    var $el = $modal.find('.'+last.type);
    var cnt = $el.find('.num').text();
    $el.fadeIn().find('.num').text(cnt*1+1);
  }
}

/**
 * Get icon markup for different types of messages/events
 */
RockGridAction.prototype.icon = function(type) {
  if(type == 'warning') return "<i class='fa fa-exclamation-triangle uk-text-warning'></i>";
  else if(type == 'error') return "<i class='fa fa-exclamation-triangle uk-text-danger'></i>";
  else if(type == 'success') return "<i class='fa fa-check uk-text-success'></i>";
  else if(type == 'start') return "<i class='fa fa-play-circle-o'></i>";
  else if(type == 'end') return "<i class='fa fa-stop-circle-o'></i>";
  return '';
}


/**
 * Show VEX confirm dialog and progressbar
 */
RockGridAction.prototype.confirmStart = function(options) {
  var options = options || {};
  var action = this;
  var onYes = options.onYes || this.onYes;
  var onNo = options.onNo || this.onNo;
  var primaryColor;

  act = action; // todo: remove
  
  // prepare batcher
  var batcher = this.batcher;
  batcher.reset();
  batcher.onChange = function(event, params) {
    // log this event
    action.addLog(event, params);

    // update progressbar
    action.updateProgressbar(event, params);

    // update gui
    var $modal = $('.RockBatcherVexConfirm').closest('.vex-content');
    $modal.find('.done').text(batcher.itemIndex + "/" + batcher.numTotal);
    // if(warnings.length) $modal.find('.warning').fadeIn().find('.num').text(warnings.length);
    // if(errors.length) $modal.find('.danger').fadeIn().find('.num').text(errors.length);
    $modal.find('.percent').text((batcher.progress*1).toFixed(0)+"%");
    
    // remove ok button when batcher is aborted
    if(batcher.aborted || event == 'end') {
      $modal.find('button.vex-dialog-button-primary').fadeOut(function() {
        $modal.find('button.vex-dialog-button-secondary').text('Close'); // todo: translate
      });
    }
  }
  
  // prepare html template for the confirm dialog
  var html = $('#RockBatcherVexConfirm').html() ||
    "<div class='RockBatcherVexConfirm'>"+
      "<div class='label uk-text-bold'>{label}</div>"+
      "<div class='progress'></div>"+
      "<div class='uk-text-small'>"+
        action.icon('success')+" <span class='done'>0/{items}</span>"+
        "<span class='warning uk-margin-left'>"+action.icon('warning')+" <span class='num'>0</span></span>"+
        "<span class='error uk-margin-left'>"+action.icon('error')+" <span class='num'>0</span></span>"+
        "<span class='percent uk-float-right'>0%</span>"+
      "</div>"+
      "<div class='status uk-text-small uk-margin-small-bottom'></div>"+
      "<div class='log'></div>"+
    "</div>";
  action.vex = $(html);

  // replace tags
  var getHtml = function() {
    var out = html;
    out = out.replace('{label}', options.label || action.getLabel());
    out = out.replace('{items}', batcher.numTotal);
    return out;
  }

  // get color of current theme's primary button for the progressbar
  var getColor = function() {
    if(primaryColor) return primaryColor;
    primaryColor = $('.vex-dialog-button-primary').css('background-color');
    return primaryColor;
  }
  
  // calc progressbar smoothing based on the minBatchDuration
  var progressbarDuration = batcher.minBatchDuration-10;
  if(progressbarDuration<0) progressbarDuration = 0;

  // show modal
  action.modal = vex.dialog.confirm({
    unsafeMessage: getHtml(),
    escapeButtonCloses: true,
    beforeClose: function() {
      // prevent closing of dialog when batcher is running
      return batcher.running ? false : true;
    },
    callback: function() {},
    afterOpen: function() {
      action.progressbar = new ProgressBar.Line(".RockBatcherVexConfirm .progress", {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1400,
        color: '#00f',
        trailColor: '#d6d6d6',
        duration: progressbarDuration,
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        step: (state, bar) => {
          bar.path.setAttribute('stroke', primaryColor || getColor());
        }
      });
    },
    buttons: [
      {
        text: vex.dialog.buttons.YES.text,
        type: 'button',
        className: vex.dialog.buttons.YES.className,
        click: function(e) { onYes.bind(action)(e); },
      },{
        text: vex.dialog.buttons.NO.text,
        type: 'button',
        className: vex.dialog.buttons.NO.className,
        click: function(e) { onNo.bind(action)(e); },
      },
    ],
  });
}