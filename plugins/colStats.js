/**
 * this plugin adds statistics to each column of the grid
 * custom column data can be defined easily via callbacks
 * when enabled, it additionally shows statistics only for selected rows
 */
document.addEventListener('RockGridItemLoadPlugins', function(e) {
  RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'colStats';
    this.enabled = false;
    var plugin = this;

    // flag set when we retrieve data only for selected rows
    this.selected = false;
  
    /**
     * render stats and attach eventlisteners
     */
    this.onLoad = function() {
      var Plugin = this;
      this.grid.api().addEventListener('viewportChanged', function() { Plugin.render() });
      this.grid.api().addEventListener('selectionChanged', function() { Plugin.render() });
      this.grid.api().addEventListener('filterChanged', function() { Plugin.render() });
      this.grid.api().addEventListener('rowDataChanged', function() { Plugin.render() });
      Plugin.render();
    }
  
    /**
     * render statistics rows
     */
    this.render = function() {
      var grid = this.grid;
      var rows = [];

      rows.push(this.getRowData('stats'));
      if(grid.api().getSelectedRows().length) rows.push(this.getRowData('statsSelected'));

      // modify rowclass
      var originalCallback = grid.gridOptions.getRowClass;
      grid.gridOptions.getRowClass = function(params) {
        return plugin.getRowClass(originalCallback, params);
      };
  
      grid.api().setPinnedBottomRowData(rows);
    }

    /**
     * get row data
     */
    this.getRowData = function(type) {
      var rowData = {colStatsRowType: type, colStatsRow: true};
      var grid = this.grid;

      var columns = grid.columnApi().getAllColumns();
      for(var i=0; i<columns.length; i++) {
        var col = columns[i].colId;
        rowData[col] = this.getValue(col, type);
      }

      return rowData;
    }

    /**
     * get row class
     */
    this.getRowClass = function(originalCallback, params) {
      originalCallback = originalCallback || function() { return ''; }
      var cls = originalCallback(params) + ' ';
  
      if(typeof params.data == 'undefined') return;
  
      if(params.data.colStatsRowType == 'statsSelected') cls += 'ag-row-selected colStatsRow colStatsRow-statsSelected';
      if(params.data.colStatsRowType == 'stats') cls += 'colStatsRow colStatsRow-stats';
      return cls;
    }

    /**
     * get stats value of column
     * by default this returns the sum of the column
     */
    this.getValue = function(col, type) {
      // never show stats for the id column
      if(col == 'id') return;

      var onlySelected = type == 'stats' ? false : true;

      // if a valueGetter is defined for this column we return that value
      var settings = this.getSettings();
      if(settings) {
        var valueGetter = settings.values[col];
        if(typeof valueGetter == 'function') return valueGetter();
      }
      
      return this.grid.sum(col, {selected: onlySelected, filter: true}) || null;
    }
  });
});
