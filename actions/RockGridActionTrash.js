$(document).on('RockGridActionLoad', function(e, grid) {
  var action = new RockGridAction('trash');
  grid.addAction(action);
});
