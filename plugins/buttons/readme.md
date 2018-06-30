# Buttons Plugin

## Create a new button

See all the other buttons as example.

## Modify buttons for one grid

```js
document.addEventListener('RockGridItemAfterInit', function(e) {
  if(e.target.id != 'RockGridItem_yourgrid') return;
  var grid = RockGrid.getGrid(e.target.id);

  grid.plugins.buttons.remove('resetfilter');
});

```

See https://www.ag-grid.com/javascript-grid-export/ for all options.