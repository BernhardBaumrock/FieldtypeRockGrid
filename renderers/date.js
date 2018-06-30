document.addEventListener('RockGridReady', function(e) {
  // this is the date renderer function
  // valueFormatters are more performant but you cannot pass custom parameters
  // that's why it needs to be a renderer (see date.md for docs)
  RockGrid.renderers.date = function(params) {
    if(!params.value) return;
    var format = params.format || 'DD.MM.YYYY';
    var time = moment(params.value);
    if(!time.isValid()) return 'invalid date';
    return time.format(format);
  };
});