document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.date = function(col, format) {
    if(!col) return;
    var format = format || 'YYYY/MM/DD';

    // set coldefs
    col.valueGetter = function(params) {
      if(typeof params.data == 'undefined') return;
      var val = params.data[col.field];
      var date = moment(val);

      if(!date.isValid()) return '';
      return date.format(format);
    }
  
    return RockGrid.colDefs.fixedWidth(col, 100);
  }
});