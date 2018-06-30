```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_ratings') return;
  var grid = RockGrid.getGrid(e.target.id);

  grid.enablePlugin('refreshTimer');
  grid.pluginSettings('refreshTimer', {timeout: 5});
});
```