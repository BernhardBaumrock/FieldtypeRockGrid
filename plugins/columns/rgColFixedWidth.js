/**
 * set fixed column width
 * @param {object} col
 * @param {integer} width
 */
var rgColFixedWidth = function(col, width) {
  col.width = width;
  col.suppressSizeToFit = true;
  return col;
}