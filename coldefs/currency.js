document.addEventListener('RockGridReady', function(e) {
  RockGrid.coldefs.currency = function(colDef, params) {
    var params = params || {};

    // set coldefs
    colDef.valueGetter = function(params) {
      if(typeof params.data == 'undefined') return;
      var val = params.data[colDef.field];
      return val*1; // make sure the value is a number and not a string
    }
    colDef.type = 'numericColumn';
    colDef.filter = 'agNumberColumnFilter';
    colDef.cellRenderer = RockGrid.renderers.currency;
    colDef.cellRendererParams = {
      format: params.format,
      append: ' €',
      prepend: '',
      preset: 'euro',
    }
  };
});