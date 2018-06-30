document.addEventListener('RockGridItemAfterInit', function(e) {
  console.log('after init');
  
  // return if we are not in the backend
  if(typeof ProcessWire == 'undefined') return;

  // add event listener to initialize all new pw-panel links
  var grid = RockGrid.getGrid(e.target);
  grid.api().addEventListener('viewportChanged', function(e) {
    console.log('viewport has changed!');
  });
});