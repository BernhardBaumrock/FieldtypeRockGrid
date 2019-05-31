document.addEventListener('RockGridItemReady', function(e) {
  
  /**
   * Shortcut to set column to fixed number
   * 
   * @param {string} name 
   * @param {object} options
   */
  RockGridItem.prototype.setFixed = function(name, options) {
    var col = this.getColDef(name);
    var options = options || {};
    
    this.setHeader(name, options.headerName);
    col = RockGrid.colDefs.toFixed(col);
    col = RockGrid.colDefs.fixedWidth(col, options.width || 120);
  }
});
