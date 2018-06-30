document.addEventListener('RockGridItemLoadButtons', function(e) {
  var buttonsPlugin = e.detail;

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
