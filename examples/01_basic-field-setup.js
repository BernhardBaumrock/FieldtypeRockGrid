// example for fieldname "projects"
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_projects') return;
  var grid = RockGrid.getGrid(e.target.id);

  var col = grid.getColDef('pl_name');
  col.headerName = 'MyHeaderName'; // set header manually

  var col = grid.getColDef('title');
  col.headerName = grid.js.title; // set multilang header

  // set fixed column width
  var col = grid.getColDef('deadline');
  col.headerName = grid.js.deadline;
  col.width = 150;
  col.suppressSizeToFit = true;

  // add coldef plugins (shortcuts for dates, numbers, etc)
  grid.addColDefPlugins({
    deadline: {name: 'date', format: 'DD.MM.YYYY HH:mm:ss'},
  });
});

document.addEventListener('RockGridItemAfterInit', function(e) {
  if(e.target.id != 'RockGridItem_transactions') return;
  var col;
  var colDef;
  var grid = RockGrid.getGrid(e.target.id);
  
  // hide one column
  grid.columnApi().setColumnVisible('myhiddencolumn', false);
});
