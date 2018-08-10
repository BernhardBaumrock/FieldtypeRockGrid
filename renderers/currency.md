example usage:
```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_leistungen') return;
  var grid = RockGrid.getGrid(e.target.id);

  grid.addColDefPlugins({
    id: 'rowactions',
    
    rockprojecteffort_price: 'currency',
    rockprojecteffort_net: 'currency',
    rockprojecteffort_gross: 'currency',
  });
});
```
