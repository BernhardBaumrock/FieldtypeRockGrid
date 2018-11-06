/**
 * display columns based on a asm select field
 * @param {object} col 
 * @param {array} items, array of icon-configs
 */
document.addEventListener('RockGridReady', function(e) {
  RockGrid.plugins.syncAsmSelect = function(options) {
    $asm = options.asm;
    grid = options.grid;

    // callback to format the column name
    this.colName = options.colName || function(pageId) {
      return 'syncAsmSelect_' + pageId;
    }
    // callback to format the column header
    this.colHeader = options.colHeader || function(pageId, pageLabel) {
      return pageLabel;
    }
    // callback to modify the colDef to your needs
    this.colDef = options.colDef || function(col) {
      return col;
    }

    // get all asm items as id-title pairs
    var asmItems = {};
    $.each($asm.find('option'), function() {
      asmItems[$(this).val()] = $(this).text();
    });

    // sync columns to asm field
    var plugin = this;
    var syncColumns = function(items) {

      // remove all list columns that are not selected
      $.each(asmItems, function(pageId, pageLabel) {
        // dont remove this column if it is still selected
        if($.inArray(pageId, items) > -1) return;
        grid.removeColumn(plugin.colName(pageId), false);
      });

      if(!items) return;
      for(var i=0; i<items.length; i++) {
        var pageId = items[i];
        var pageLabel = asmItems[pageId];
        var colName = plugin.colName(pageId);
        
        var col = grid.getColDef(colName);
        if(!col) {
          col = RockGrid.getDefaultColumn({
            headerName: plugin.colHeader(pageId, pageLabel),
            field: colName,
            asmPageId: pageId,
          });
          col.valueGetter = function() { return pageId; }

          // modify the column with the callback of the options (if set)
          col = plugin.colDef(col);

          grid.gridOptions.columnDefs.push(col);
          grid.api().setColumnDefs(grid.gridOptions.columnDefs);
          grid.api().sizeColumnsToFit();
        }
      }
    }

    // add event listener to the asm field
    $asm.change(function(e) {
      syncColumns($asm.val());
    });
  }
});
