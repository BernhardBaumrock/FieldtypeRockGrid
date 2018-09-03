document.addEventListener('RockGridItemLoadButtons', function(e) {
  var buttonsPlugin = e.detail;
  var grid = RockGrid.getGrid(e.target);

  // only show button on ajax-grids
  if(grid.data != 'ajax') return;

  // register plugin
  RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'buttonRefresh';
  
    this.onLoad = function() {
      buttonsPlugin.add({
        name: 'refresh',
        icon: 'fa-refresh',
        onClick: function(node) {
          grid.reload({overlay: true});
    
          // show spinner
          node.querySelector('i').classList.add('fa-spin');
        },
      });
    }
  });
});

/**
 * remove loading overlay on ajax done
 */
document.addEventListener('RockGridAjaxDone', function(e) {
  var grid = RockGrid.getGrid(e.target);
  grid.getWrapperDOM().querySelector('a.rockgridbutton.refresh i').classList.remove('fa-spin');
});