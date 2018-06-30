document.addEventListener('RockGridReady', function(e) {
  RockGrid.coldefs.date = function(colDef, params) {
    var params = params || {};
    colDef.cellRenderer = RockGrid.renderers.date;
    colDef.cellRendererParams = {
      format: params.format
    }
    colDef.filter = 'agDateColumnFilter';
  };
});