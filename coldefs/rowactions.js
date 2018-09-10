document.addEventListener('RockGridReady', function(e) {
  RockGrid.coldefs.rowactions = function(colDef, options) {
    var options = options || {};

    colDef.width = options.width || 60;
    colDef.suppressSizeToFit = true;
    colDef.suppressMenu = true;
    colDef.headerName = '';
    colDef.suppressFilter = true;
    colDef.cellStyle = {'text-align': 'center'};

    colDef.cellRenderer = function(params) {
      if(!params.data || !params.data.id) return;

      var items = [];

      if(!options.noShow) items.push({
        icon: 'fa fa-search',
        href: ProcessWire.config.urls.admin + 'page/edit/?id=' + params.data[colDef.field],
        str: options.strShow || RockGrid.str.show,
        class: 'class="pw-panel"',
        target: 'target="_blank"',
      });
      if(!options.noTrash) items.push({
        icon: 'fa fa-trash',
        href: '#',
        str: options.strTrash || RockGrid.str.trash,
        class: 'class="trashRockGridRow" data-pageid="' + params.data['id'] + '"',
      });

      return RockGrid.renderers.actionItems(params, items);
    };
  };
});

$(document).on('click', 'a.trashRockGridRow', function(e) {
  var $i = $(e.target);
  var $a = $i.closest('a');
  var pageid = $a.data('pageid')*1;
  var grid = RockGrid.getGrid(e.target);

  // select clicked row
  grid.api().deselectAll();
  grid.api().forEachNode(function(node) {
    if(node.data.id == pageid) { node.setSelected(true); }
  });

  // show confirm dialog
  ProcessWire.confirm('Are you sure you want to delete this item?', function() {
    $i.removeClass('fa-trash').addClass('fa-spin fa-spinner');

    // send ajax request to this grid
    grid.ajax({
      action: 'trash',
      data: [pageid],
    }).done(function(params) {
      $a.closest('.RockGridWrapper').find('.rockgridbutton.refresh').click();
    });
  }, function() {
    grid.api().deselectAll();
  });

  return false;
});