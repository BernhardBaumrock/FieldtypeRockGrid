/**
 * set column as number
 * @param {object} col 
 */
var rgColNumber = function(col) {

  // set coldefs
  col.valueGetter = function(params) {
    if(typeof params.data == 'undefined') return;
    var val = params.data[col.field];
    return val*1; // make sure the value is a number and not a string
  }

  col.type = 'numericColumn';
  
  return col;
}