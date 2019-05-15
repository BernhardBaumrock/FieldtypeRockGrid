/**
 * Batch execution in vanilla javascript
 * 
 * Version 1.0
 */
function RockBatcher() {
  /**
   * Current indices
   */
  this.itemIndex;
  this.batchIndex;

  /**
   * Array of all items to execute
   */
  this.items = [];

  /**
   * Number of total items
   */
  this.numTotal;

  /**
   * How many items to execute in each batch
   */
  this.batchSize = 1;

  /**
   * Minimum time in ms that each batch takes to execute
   * 
   * This can be helpful for throttling a batch execution. For example to make
   * a smooth progressbar possible that has some easing applied.
   */
  this.minBatchDuration = 0;

  /**
   * Timestamp of last done batch
   */
  this.lastDone;

  /**
   * Current progress in percent
   */
  this.progress;

  /**
   * Number of decimals for progress
   */
  this.progressDecimals = 2;

  /**
   * Number of batches to execute
   */
  this.numBatches;

  /**
   * Flag if current execution was aborted
   */
  this.aborted = false;

  /**
   * Flag if current batcher is running
   */
  this.running = false;

  /**
   * Array holding all logged events
   */
  this.eventLog = [];
}

/** ########## callback functions ########## */

RockBatcher.prototype.onChange = function(event, data) {
  console.log(event, data);
}

RockBatcher.prototype.executeBatch = function(chunk) {
  console.log('executing batch', chunk);
}

/** ########## helper methods ########## */

RockBatcher.prototype.event = function(event, data) {
  this.progress = this.getProgress();

  // we set the last done timestamp
  if(event == 'batchDone' || event == 'start') this.lastDone = Date.now();
  
  this.onChange(event, data || {});
}

RockBatcher.prototype.reset = function() {
  this.eventLog = [];
  this.itemIndex = 0;
  this.progress = 0;
  this.batchIndex = 0;
  this.aborted = false;
  this.running = false;
  this.numTotal = this.items.length;
  this.numBatches = Math.ceil(this.numTotal/this.batchSize);
  this.event('reset');
}

RockBatcher.prototype.start = function() {
  this.reset();
  this.running = true;
  this.event('start');
  this.nextBatch();
}

RockBatcher.prototype.abort = function() {
  this.aborted = true;
  this.event('abort');
}

RockBatcher.prototype.end = function() {
  this.itemIndex = this.numTotal;
  this.batchIndex = this.numBatches;
  this.running = false;
  this.event('end');
}

RockBatcher.prototype.nextBatch = function() {
  var batchEnd = this.itemIndex+this.batchSize;
  var chunk = this.items.slice(this.itemIndex, batchEnd);

  // handle user abort
  if(this.aborted) {
    // we set running to false here
    // this must be inside nextBatch because AJAX batches can finish
    // AFTER the user aborted the batch and until then the batcher is not
    // done and we must prevent the gui from being closed!
    this.running = false;
    return;
  }

  // execute batch
  this.event('nextBatch', {chunk});
  var result = this.executeBatch(chunk);

  // on ajax batches we dont get any return value
  // triggerBatchDone gets called when the ajax request was completed
  // so executeBatch must at least return true to call the next batch
  if(result) this.triggerBatchDone(result);
}

RockBatcher.prototype.triggerBatchDone = function(result) {
  var next = Date.now();
  var last = this.lastDone;
  var delay = (last*1 + this.minBatchDuration*1) - next*1;
  if(delay < 0) delay = 0;
  setTimeout(function() {
    this.batchDone(result);
  }.bind(this), delay);
}

RockBatcher.prototype.batchDone = function(result) {
  var batchEnd = this.itemIndex+this.batchSize;
  this.batchIndex++;
  
  if(batchEnd >= this.numTotal) {
    // end reached
    this.itemIndex = this.numTotal;
    this.event('batchDone', result);
    this.end();
  }
  else {
    // regular batch step completion
    this.itemIndex = batchEnd;
    this.event('batchDone', result);
    this.nextBatch();
  }
}

/**
 * Get the current progress in percent
 */
RockBatcher.prototype.getProgress = function() {
  var percent = !this.numTotal ? 0 : this.itemIndex/this.numTotal*100;
  return percent.toFixed(this.progressDecimals);
}

RockBatcher.prototype.getJSON = function(url, options) {
  var batcher = this;
  var options = options || {};
  var xhr = new XMLHttpRequest();
  var method = options.method || 'POST';
  var abortOnError = options.abortOnError === false ? false : true;

  // prepare payload
  var data = {
    chunk: this.items.slice(this.itemIndex, this.itemIndex+this.batchSize)
  };
  var json = JSON.stringify(data);

  // prepare request
  xhr.open(method, url, true); // async get request
  xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.onreadystatechange = function() {
    var result = {type:'error', msg:null};
    if(xhr.readyState !== 4) return;
    if(xhr.status === 200) {
      try {
        result = JSON.parse(xhr.responseText);
      } catch (error) {
        result.msg = error;
      }
    }
    else {
      result.msg = "AJAX Status Error " + xhr.status;
    }

    if(abortOnError && result.type == 'error') batcher.abort();
    if(options.logResult) console.log(result);
    batcher.triggerBatchDone(result);
  };

  // send request
  xhr.send(json);
}

/**
 * Execute a callback for each item of an array
 */
RockBatcher.prototype.forEach = function(array, fn) {
  for(var i=0; i<array.length; i++) fn(array[i]);
}
