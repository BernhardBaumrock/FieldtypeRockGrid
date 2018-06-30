document.addEventListener('RockGridItemBeforeInit', function(e) {
  // early exit to bind this event only to one field
  if(e.target.id != 'RockGridItem_yourfieldname') return;

  // set custom columns
  RockGrid.getGrid(e.target.id).addOptions({
    columnDefs: [
      {headerName: "title", field: "title"},
      {headerName: "templates_id", field: "templates_id"},
      {headerName: "status", field: "status"},
      {headerName: "created", field: "created"},
    ],
  });

  // set grid to autoheight
  RockGrid.getGrid(e.target.id).addOptions({
    domLayout: 'autoHeight',
    pagination: false,
  });

  // change coldef before init
  var colDef = RockGrid.getGrid(e.target.id).getColDef('id');
  colDef.headerName = 'blaaaa';

  // make multiple columns numeric
  var numeric = ['id','status','templates_id'];
  for(var i=0; i<numeric.length; i++) {
    var colDef = RockGrid.getGrid(e.target.id).getColDef(numeric[i]);
    colDef.type = 'numericColumn';
    colDef.filter = 'agNumberColumnFilter';
    colDef.valueGetter = function(params) {
      // make sure the data is a number and not a string
      return params.data[params.column.colId]*1;
    };
  }

  console.log('Before init event called on ' + e.target.id);
});

document.addEventListener('RockGridItemAfterInit', function(e) {
  // this event will fire on all grids on the page
  console.log('After init event called on ' + e.target.id);
});

// example of changing a column label and making one column hidden
// see https://www.ag-grid.com/javascript-grid-column-api/ for all available options
document.addEventListener('RockGridItemAfterInit', function(e) {
  if(e.target.id != 'RockGridItem_rg1') return;

  var grid = RockGrid.getGrid(e.target.id);
  
  // change coldef after init
  var col = grid.columnApi().getColumn('id');
  var colDef = col.getColDef();
  colDef.headerName = 'test';
  grid.api().refreshHeader();
  
  grid.columnApi().setColumnVisible('title', false);
});