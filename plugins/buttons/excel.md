Example usage:

```js
document.addEventListener('RockGridItemAfterInit', function(e) {
  if(e.target.id != 'RockGridItem_ratings') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  // grid.plugins.buttons.remove('resetfilter');
  grid.plugins.buttonExcel.setSettings({
    processCellCallback: function(params) {
      if(params.column.colId.indexOf('comp_') === 0) {
        if(params.value>0) return params.value;
        if(params.value===0) return 'x';
        return '';
      }
      return params.value;
    },
  });
});
```