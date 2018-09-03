document.addEventListener('RockGridItemLoadButtons', function(e) {
  var buttonsPlugin = e.detail;
  var grid = RockGrid.getGrid(e.target);

  // only show button when filtering is enabled
  if(grid.gridOptions.enableFilter === false) return;

  RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'buttonResetfilter';
  
    this.onLoad = function() {
      buttonsPlugin.add({
        name: 'resetfilter',
        label: '<i class="fa fa-filter"></i><i class="fa fa-times"></i>',
        hover: 'Reset all filters',
        onClick: function(node) {
          var grid = RockGrid.getGrid(node);
          grid.api().setFilterModel(null);
        },
      });
    }
  });
});
