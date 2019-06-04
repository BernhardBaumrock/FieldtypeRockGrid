document.addEventListener('RockGridItemReady', function(e) {
  
  /**
   * Shortcut to set currency column
   * 
   * @param {string} name 
   * @param {object} options
   */
  RockGridItem.prototype.setDate = function(name, options) {
    var col = this.getColDef(name);
    if(!col) return;
    var options = options || {};

    this.setHeader(name, options.headerName);
    var format = options.format || 'YYYY-MM-DD';

    // set coldefs
    col.valueGetter = function(params) {
      if(typeof params.data == 'undefined') return;
      var val = params.data[col.field];
      var date = moment(val);

      if(!date.isValid()) return '';
      return date.format(format);
    }
    col = RockGrid.colDefs.fixedWidth(col, options.width || 100);
  }
});
