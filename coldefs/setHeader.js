document.addEventListener('RockGridItemReady', function(e) {
  RockGridItem.prototype.setHeader = function(name, header) {
    var col = this.getColDef(name);
    if(!col) return;
    
    // set header
    if(typeof header == "function") col.headerName = header();
    else if(typeof header == "string") col.headerName = RockGrid.hoverSpan(header);
    else if(typeof header == "object") {
      col.headerName = RockGrid.hoverSpan(
        header[0],
        header[1] || header[0],
        header[2] || false
      );
    }

    return col;
  }
});
