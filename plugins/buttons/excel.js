document.addEventListener('RockGridItemLoadButtons', function(e) {
  var buttonsPlugin = e.detail;

  var excelPlugin = RockGrid.getGrid(e.target).registerPlugin(function() {
    var button = this;
    this.name = 'buttonExcel';

    this.defaults = {
      columnSeparator: ';',
      processHeaderCallback: function(params) {
        return RockGrid.stripTags(params.column.getColDef().headerName);
      },
      processCellCallback: function(params) {
        return params.value;
      },
    },
  
    this.onLoad = function() {
      buttonsPlugin.add({
        name: 'excel',
        icon: 'fa-file-excel-o',
        onClick: function(node) {
          var grid = RockGrid.getGrid(node);
          grid.api().exportDataAsCsv(button.getMergedSettings());
        },
      });
    }

    this.getMergedSettings = function() {
      var obj = {};

      // merge default settings
      for (var attrname in this.defaults) { obj[attrname] = this.defaults[attrname]; }

      // merge user defined settings
      for (var attrname in this.settings) { obj[attrname] = this.settings[attrname]; }
      
      return obj;
    }
  });
});
