document.addEventListener('RockGridItemLoadButtons', function(e) {
  var buttonsPlugin = e.detail;

  var trashPlugin = RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'buttonTrash';
  
    this.onLoad = function() {
      buttonsPlugin.add({
        name: 'trash',
        icon: 'fa-trash',
        
        // show button only when rows are selected
        showWhenSelected: true,
        
        onClick: function(node) {
          var grid = RockGrid.getGrid(node);
    
          // show confirm dialog
          var Batcher = RockGrid.batcher;
          Batcher.items = grid.pluck('id', {selected:true});
          Batcher.action = function(items) {
            // send ajax request to this grid
            var ajax = grid.ajax({
              action: 'trash',
              data: items,
            }).done(function(params) {
              Batcher.nextBatch();
            });
          };
          Batcher.confirmStart({
            msg: 'Are you sure you want to delete the selected rows?',
            onYes: function() {
              Batcher.nextBatch();
            },
            onNo: function() {
              $(grid.getWrapperDOM()).find('.rockgridbutton.trash i').removeClass('fa-spin fa-spinner').addClass('fa-trash');
              Batcher.abort();
            }
          });
          Batcher.onStart = function() {
            $(grid.getWrapperDOM()).find('.rockgridbutton.trash i').removeClass('fa-trash').addClass('fa-spin fa-spinner');
          };
          Batcher.onEnd = function() {
            $(grid.getWrapperDOM()).find('.rockgridbutton.refresh').click();
            $(grid.getWrapperDOM()).find('.rockgridbutton.trash i').removeClass('fa-spin fa-spinner').addClass('fa-trash');
            setTimeout(function() { Batcher.vex.close(); }, 500);
          };
        },
      });
    }
  });
});
