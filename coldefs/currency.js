document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.currency = function(colDef, params) {
    var params = params || {};

    // old valuegetter
    var valueGetter = colDef.valueGetter || false;

    colDef.valueGetter = function(params) {
      // if a valuegetter is already set we take this one
      if(valueGetter) return valueGetter(params)*1;

      if(typeof params.data == 'undefined') return;
      var val = params.data[colDef.field];
      return val*1; // make sure the value is a number and not a string
    }

    colDef.type = 'numericColumn';
    colDef.cellRenderer = RockGrid.renderers.currency;
    colDef.cellRendererParams = {
      append: ' €',
      prepend: '',
      preset: 'euro',
    }

    return colDef;
  };
});