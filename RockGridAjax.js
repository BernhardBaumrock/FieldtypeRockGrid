/**
 * RockGrid AJAX class
 * todo: make plugin instead of single js file
 */
function RockGridAJAX(grid, params) {
  this.grid = grid;
  this.params = params;
  this.doneCallback = function(params) {};

  /**
   * get url for ajax request
   */
  this.getUrl = function() {
    var url = location.href.split('#')[0]; // make sure url has no hashtag
    if(url.indexOf('?') === -1) url += '?RockGrid=1';
    else url += '&RockGrid=1';
    url += '&field=' + this.grid.id;
    return url;
  }

  this.getParams = function() {
    if(this.params.length) return this.params.join();
    else return this.params;
  }

  // execute this request
  var AJAX = this;
  $.post(
    this.getUrl(),
    params,
    function(params) {
      AJAX.doneCallback(params);
    }
  );
};

/**
 * callback when done
 */
RockGridAJAX.prototype.done = function(func) {
  this.doneCallback = func;
}
