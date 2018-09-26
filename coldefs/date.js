document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.date = function(colDef, params) {
    var params = params || {};
    colDef.cellRenderer = RockGrid.renderers.date;
    colDef.cellRendererParams = {
      format: params.format
    }
    colDef.filter = 'agDateColumnFilter';

    return colDef;
  };
});