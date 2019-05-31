document.addEventListener('RockGridItemReady', function(e) {
  
  /**
   * Shortcut to set currency column
   * 
   * @param {string} name 
   * @param {object} options
   */
  RockGridItem.prototype.setCurr = function(name, options) {
    var col = this.getColDef(name);
    var options = options || {};

    this.setHeader(name, options.headerName);
    col = RockGrid.colDefs.currency(col);
    col = RockGrid.colDefs.fixedWidth(col, options.width || 120);
  }
});
