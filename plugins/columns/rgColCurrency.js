/**
 * set column as currency
 * @param {object} col 
 */
var rgColCurrency = function(col, options) {
  // make sure it is a numeric column
  if(col.type != 'numericColumn') col = rgColNumber(col);
  var options = options || {};

  // set currency renderer
  col.cellRenderer = RockGrid.renderers.currency;
  col.cellRendererParams = {
    append: typeof options.append == 'undefined' ? ' €' : options.append,
    prepend: typeof options.prepend == 'undefined' ? '' : options.prepend,
    preset: typeof options.preset == 'undefined' ? 'euro' : options.preset,
  }

  // return column object
  return col;
}