/**
 * example:
 * col = RockGrid.colDefs.currency(col, {
      hideEmpty: true,
    });
 */
document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.currency = function(col, options) {
    var options = options || {};

    // old valuegetter
    var valueGetter = col.valueGetter || false;

    col.valueGetter = function(params) {
      // if a valuegetter is already set we take this one
      if(valueGetter) return valueGetter(params); // dont convert to number here!

      if(typeof params.data == 'undefined') return;
      var val = params.data[col.field];
      return val*1; // make sure the value is a number and not a string
    }

    col.type = 'numericColumn';
    col.cellRenderer = RockGrid.renderers.currency;
    col.cellRendererParams = {
      append: ' €',
      prepend: '',
      preset: 'euro',
      hideEmpty: options.hideEmpty || null,
      hideNull: options.hideNull || null,
    }

    // fixed width?
    if(options.width) col = RockGrid.colDefs.fixedWidth(col, options.width);

    return col;
  };
});