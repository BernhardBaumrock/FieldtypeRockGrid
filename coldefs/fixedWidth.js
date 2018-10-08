document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.fixedWidth = function(col, width) {
    col.width = width || 100;
    col.suppressSizeToFit = true;
    return col;
  };
});