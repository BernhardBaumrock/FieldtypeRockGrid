document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.toFixed = function(colDef, params) {
    var params = params || {};

    // if a custom valuegetter was set, use it instead of the default one
    if(params.valueGetter) colDef.valueGetter = params.valueGetter;
    else {
      colDef.valueGetter = function(params) {
        if(typeof params.data == 'undefined') return;
        var val = params.data[colDef.field];
        // if the value is set to false we return false
        // this is important for the colstats plugin to work
        if(val === false) return false;
        
        // otherwise make sure the value is a number and not a string
        return val*1;
      }
    }

    colDef.type = 'numericColumn';
    var digits = 2;
    if(typeof params.digits != 'undefined') digits = params.digits;
    colDef.cellRenderer = function(params) {
      if(params.value === false) return '';
      return params.value.toFixed(digits);
    }

    return colDef;
  };
});
