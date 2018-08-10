/**
 * set column as currency
 * @param {object} col 
 */
var rgColCurrency = function(col, options) {
  // make sure it is a numeric column
  if(col.type != 'numericColumn') col = rgColNumber(col);

  // set currency renderer
  col.cellRenderer = RockGrid.renderers.currency;
  col.cellRendererParams = {
    append: ' €',
    prepend: '',
    preset: 'euro',
  }

  // return column object
  return col;
}