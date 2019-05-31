document.addEventListener('RockGridReady', function(e) {
  RockGrid.colDefs.tippyIcon = function(col, icon, options) {
    var options = options || {};
    col.headerName = RockGrid.hoverSpan(options.headerName);
    col = RockGrid.colDefs.fixedWidth(col, 50);
    col.cellClass = 'rg-text-center';

    col.cellRenderer = function(params) {
      if(params.data.colStatsRow) return;
      var popup = params.value;
      if(!popup) return;

      var out = "<span class='fa fa-" + icon + "'></span>";
      popup = "<div style='text-align:left !important;'>"+popup+"</div>";
      return RockGrid.tippy(out, popup, options);
    }

    return col;
  };
});
