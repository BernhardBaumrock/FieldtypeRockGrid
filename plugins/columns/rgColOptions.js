/**
 * replace integer values by icons, colors and backgrounds
 * @param {object} col
 * @param {object} options
 * 
 * example usage:
 * col = rgColOptions(col, {
 *   icons: {1: 'female', 2: 'male', 3: 'home'},
 *   hover: {1: 'weiblich', 2: 'männlich', 3: 'Firma/Abteilung'},
 *   cls: {1: 'grid-bg-female', 2: 'grid-bg-male'},
 *   cellClass: 'grid-text-center',
 * });
 */
var rgColOptions = function(col, options) {
  
  /**
   * icons + hover text
   */
  var icons = options['icons'];
  if(typeof icons != 'undefined') {
    var hovers = options['hover'];
    col.cellRenderer = function(params) {
      if(typeof params.data.colStatsRowType != 'undefined') return;
      var icon = icons[params.value];
      var hover = (typeof hovers != 'undefined' && typeof hovers[params.value] != 'undefined') ? hovers[params.value] : '';
      return typeof icon != 'undefined'
        ? '<span class="fa fa-' + icon + '" title="' + hover + '"></span>'
        : ''
        ;
    };
  }

  /**
   * cell class
   * if you need more control just don't define a cellclass and setup your
   * own cellClass function directly on the column definition object
   */
  var classes = options['cls'];
  var cellClass = options['cellClass'] || '';
  if(typeof classes != 'undefined') {
    // classes where set
    col.cellClass = function(params) {
      if(typeof params.data.colStatsRowType != 'undefined') return;
      var cls = classes[params.value];
      return typeof cls != 'undefined'
        ? cellClass + ' ' + cls
        : cellClass
        ;
    };
  }
  else if(cellClass) {
    // no classes object was set but a global cellClass was set and needs to be applied
    col.cellClass = cellClass;
  }

  return col;
}