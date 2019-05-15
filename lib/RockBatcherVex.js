RockBatcher.prototype.onYes = function() {
  console.log('YES!!!', this);
}
RockBatcher.prototype.onNo = function() {
  console.log('NO!!!', this);
}

RockBatcher.prototype.confirmStart = function(options) {
  var batcher = this;
  var options = options || {};
  var action = options.action;
  var onYes = options.onYes || this.onYes;
  var onNo = options.onNo || this.onNo;
  
  // prepare html template for the confirm dialog
  var html = $('#RockBatcherVexConfirm').html() ||
    "<div class='RockBatcherVexConfirm'>"+
      "<div class='label uk-text-bold'>{label}</div>"+
      "<div class='progress'></div>"+
      "<div class='uk-text-small'>"+
        "<span class='donecount'>{donecount}</span>"+
        "<strong class='errorcount uk-margin-small-left'>{errorcount} <i class='fa fa-exclamation-triangle uk-text-danger uk-marginall'></i></strong>"+
        "<span class='percent uk-float-right'>{percent}</span>"+
      "</div>"+
      "<div class='status uk-text-small uk-margin-small-bottom'>{status}</div>"+
      "<div class='log'>{log}</div>"+
    "</div>";

  // replace tags
  var getHtml = function() {
    var out = html;
    out = out.replace('{label}', options.label || action.getLabel());
    return out;
  }

  // show modal
  var modal = vex.dialog.confirm({
    unsafeMessage: getHtml(),
    escapeButtonCloses: function() {
      return this.started ? false : true;
    },
    callback: function() {},
    afterOpen: function() {
      var bar = new ProgressBar.Line(".RockBatcherVexConfirm .progress", {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1400,
        color: '#1b9d67',
        trailColor: '#d6d6d6',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'}
      });
      
      bar.animate(0.5);
    },
    buttons: [
      {
        text: vex.dialog.buttons.YES.text,
        type: 'button',
        className: vex.dialog.buttons.YES.className,
        click: function(e) { onYes(); },
      },{
        text: vex.dialog.buttons.NO.text,
        type: 'button',
        className: vex.dialog.buttons.NO.className,
        click: function(e) { onNo(); },
      },
    ],
  });
}
