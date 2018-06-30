# colStats Plugin

```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_ratings') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  grid.enablePlugin('colStats');
  grid.pluginSettings('colStats', {
    values: {
      col1: function(column) {
        return grid.sum(column);
      },
      col2: function(column) {
        return null;
      },
      col3: function(column) {
        return grid.api().getSelectedRows().length;
      },
    },
    render: {
      col3: function(value) {
        return "<strong>Selected rows:</strong> " + value;
      },
    },
  });
});
```
