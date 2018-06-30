/**
 * this plugin makes columns fit to the current grid's width
 */
document.addEventListener('RockGridItemLoadPlugins', function(e) {
  RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'sizeColumnsToFit';
  
    document.addEventListener('RockGridItemAfterInit', function(e) {
      var grid = RockGrid.getGrid(e.target);
      grid.api().sizeColumnsToFit();
    });
  });
  
  /**
   * ##################### backend event listeners #####################
   */
  if(!RockGrid.backend) return;

  /**
   * adjust columns when field is opened
   */
  $(document).on('opened', 'li', function(e) {
    var $li = $(e.target);
    if(!$li.find('.RockGridItem').length) return;
    RockGrid.getGrid($li.find('.RockGridItem').data('id')).api().sizeColumnsToFit();
  });

  /**
   * adjust columns when window is resized
   */
  var resizeTimer;
  $(window).on('resize', function(e) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      $('.RockGridItem').each(function(i,el) {
        var grid = RockGrid.getGrid($(el).data('id'));
        if(grid) grid.api().sizeColumnsToFit();
      });
    }, 500);
  });
});
