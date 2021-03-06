document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.yesNo = function(col, options) {
    var yes = '1';
    var no = '0';
    var options = options || {};

    if(options.headerName) col.headerName = RockGrid.hoverSpan(options.headerName);

    // default function to check wheter to return yes or no
    var isYes = options.isYes || function(params) {
      var val = params.data[params.column.colId];
      return parseInt(val);
    }

    col = RockGrid.colDefs.fixedWidth(col, 70);
    col.valueGetter = function(params) {
      return isYes(params) ? '1' : '0';
    }
    col.cellRenderer = function(params) {
      if(typeof params.data.colStatsRowType != 'undefined') return '';
      return params.value == '1'
        ? '<i class="fa fa-check"></i>'
        : '<i class="fa fa-times"></i>'
        ;
    }
    col.cellClass = function(params) {
      if(typeof params.data.colStatsRowType != 'undefined') return;

      var cls = 'rg-text-center';
      if(params.value == '1') cls += ' rg-bg-green';
      else cls += ' rg-bg-red';
      return cls;
    }

    return col;
  };
});