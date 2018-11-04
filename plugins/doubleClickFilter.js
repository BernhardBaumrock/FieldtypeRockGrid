/**
 * filter grid to current cell value on doubleclick
 * caution: will not work with integer cell values of ZERO
 * set a string value instead (yes = '1', no = '0')
 */
document.addEventListener('RockGridItemLoadPlugins', function(e) {
  RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'doubleClickFilter';
  
    this.onLoad = function() {
      var grid = this.grid;
      
      var clicks = 0;
      var timer, timeout = 350; // max time between each click

      var doubleClick = function(e) {
        var colId = e.column.colId;
        var filter = grid.api().getFilterInstance(colId);
        
        // only apply this filter to smartFilter instances
        if(filter.name == 'smartFilter') {
          filter.setModel({
            type: 'exact',
            value: e.value,
          });
        }
        else {
          // regular aggrid filter, either num or text filter
          filter.setModel({
            type: 'equals',
            filter: e.value,
          });
        }

        // update grid
        grid.api().onFilterChanged();
        grid.api().deselectAll();
      }

      var tripleClick = function(e) {
        var colId = e.column.colId;
        var filter = grid.api().getFilterInstance(colId);
        filter.setModel({});

        grid.api().onFilterChanged();
        grid.api().deselectAll();
      }

      // click timer
      grid.api().addEventListener('cellClicked', function(e) {
        clearTimeout(timer);
        clicks++;
        var evt = e;
        timer = setTimeout(function() {
          if(clicks==2) doubleClick(evt);
          if(clicks==3) tripleClick(evt);
          clicks = 0;
        }, timeout);
      });
    }
  });
});


