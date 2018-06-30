document.addEventListener('RockGridReady', function(e) {
  RockGrid.coldefs.number = function(colDef, params) {
    var params = params || {};

    // set coldefs
    colDef.valueGetter = function(params) {
      if(typeof params.data == 'undefined') return;
      var val = params.data[colDef.field];
      return val*1; // make sure the value is a number and not a string
    }

    // if a custom valuegetter was set, use it instead of the default one
    if(params.valueGetter) colDef.valueGetter = params.valueGetter;

    colDef.type = 'numericColumn';
    colDef.filter = 'agNumberColumnFilter';
  };
});