document.addEventListener('RockGridBeforeReady', function(e) {
  var Batcher = function() {
    // default batch size
    // 1 means it executes the callback for every single item
    // 10 means it executes the callback for each 10 items
    this.batchSize = 1;

    // items to batch process
    this.items = [];

    this.index = 0;
    this.numBatches = 0;
    this.numTotal = 0;

    // reload grid when batcher was finished?
    // todo: implement
    this.reloadWhenDone = true;

    // save vex confirm instance
    // this is necessary to close the dialog when done
    this.vex = null;

    /**
     * callback to execute for each item
     */
    this.action = function(items) {
      console.log("executing action... " + items.join(', '));
    }

    /**
     * execute this batch
     */
    this.isAborted = false;
    this.nextBatch = function() {
      this.index++;
      var numItems = this.items.length;
      var numBatches = this.numBatches || Math.ceil(numItems / this.batchSize);
      var numTotal = this.numTotal || numItems;

      if(this.index === 1) {
        this.numBatches = numBatches;
        this.numTotal = numTotal;
        this.onStart();
      }
      else {
        // update progressbar
        this.progresBar.animate((this.index-1)/numBatches);
      }

      // early exit
      if(!numItems) {
        this.onEnd();
        this.reset();
        return;
      }

      var items = this.items.splice(0, this.batchSize);
      
      if(this.isAborted) {
        console.log('Aborted Batcher, skipped ' + items.join(', '));
        return this.nextBatch();
      }

      // update text for current item
      var str = this.index + '/' + numBatches;
      if(this.batchSize > 1) {
        var from = (1+(this.index-1)*this.batchSize*1);
        var to = from+this.batchSize-1;
        if(to>this.numTotal) to = this.numTotal;
        str = '[' + from + '-' + to + ']';
        str += '/' + this.numTotal;
      }
      $('#batcherProgress span.count').html(str);
      this.setCurrent(this.getCurrentText(items));

      // execute callback for this batch
      this.action(items);
    }

    /**
     * text shown for every batch above the progressbar
     */
    this.getCurrentText = function(items) {
      return " (" + items.join(', ') + ")";
    }
    this.setCurrent = function(str) { $('#batcherProgress span.text').html(str); }
    this.setAbove = function(str) { $('#batcherAbove').html(str); }
    this.setBelow = function(str) { $('#batcherBelow').html(str); }

    /**
     * get html of progressbar
     */
    this.getProgressBar = function(opt) {
      return "<div id='batcherAbove'></div>"+
        "<div id='batcherProgress'>"+
          "<div class='current'><span class='count'>0/" + opt.total + "</span> <span class='text'></span></div>"+
          "<div class='bar'></div>"+
        "</div>"+
        "<div id='batcherBelow'></div>"
        ;
    }

    /**
     * show confirm dialog and start batch
     */
    this.confirmStart = function(options) {
      var Batcher = this;
      if(typeof options.onLoad != 'undefined') var onLoad = options.onLoad();
      if(onLoad === false) return;

      var html = options.msg || '';
      html += this.getProgressBar({total: this.items.length});

      this.vex = vex.dialog.confirm({
        unsafeMessage: html,
        callback: function() {},
        escapeButtonCloses: false,
        overlayClosesOnClick: false,
        afterOpen: function() {
          var bar = new ProgressBar.Line('#batcherProgress .bar', {
            duration: 500,
            easing: 'easeInOut',
            color: '#2fa500',
            trailColor: '#dfdfdf',
            trailWidth: 5,
            text: {
              style: {
                color: '#999',
                position: 'absolute',
                right: '0',
                top: '3px',
                padding: 0,
                margin: 0,
                transform: null
              },
              autoStyleContainer: false,
            },
            step: (state, bar) => {
              bar.setText(Math.round(bar.value() * 100) + ' %');
              if(bar.value() == 1) {
                // batcher done, remove ok button
                $('.vex-dialog-buttons .clicked').fadeOut();
              }
            },
          });

          bar.animate(0);
          Batcher.progresBar = bar;

          if(typeof options.afterOpen != 'undefined') options.afterOpen();
        },
        buttons: [
          {
            text: vex.dialog.buttons.YES.text,
            type: 'button',
            className: vex.dialog.buttons.YES.className,
            click: function(e) {
              $button = $(e.target).closest('button');
              if(!$button.hasClass('clicked')) {
                options.onYes();
                $button.addClass('clicked').html('<i class="fa fa-spin fa-spinner"></i>');
              }
            },
          },{
            text: vex.dialog.buttons.NO.text,
            type: 'button',
            className: vex.dialog.buttons.NO.className,
            click: function(e) {
              $button = $(e.target).closest('button');
              if(typeof options.onNo != 'undefined') options.onNo();
              Batcher.abort();
            },
          },
        ],
      });
    }

    /**
     * reset batcher, create new instance
     */
    this.reset = function() {
      RockGrid.batcher = new Batcher();
    }

    /**
     * abort current batch
     */
    this.abort = function() {
      this.vex.close();
      this.isAborted = true;
      this.nextBatch();
    }

    // callback on end of batch
    this.onEnd = function() {
      console.log('--- Batcher done ---');
    }

    // callback on start of batch
    this.onStart = function() {
      console.log('--- Batcher started ---');
    }
  }
  
  // method to return a new batcher instance
  RockGrid.prototype.getBatcher = function() { return new Batcher(); }
  
  /**
   * Add one batcher instance to the RockGrid global object
   * 
   * This is for backwards compatibility! Better use .getBatcher()
   */
  document.addEventListener('RockGridReady', function(e) {
    RockGrid.batcher = new Batcher();
  });
});