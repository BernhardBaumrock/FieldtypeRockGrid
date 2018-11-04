document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.datetime = function(col) {
    if(!col) return;

    // set coldefs
    col.valueGetter = function(params) {
      if(typeof params.data == 'undefined') return;
      var val = params.data[col.field];
      var date = moment(val);

      if(!date.isValid()) return '';
      return date.format('YYYY/MM/DD HH-mm-ss');
    }
  
    return RockGrid.colDefs.fixedWidth(col, 150);
  }
});