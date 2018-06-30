# Column Definitions Plugins

For some column types like dates or currencies you need to define multiple aspects. For numbers for example you need to make sure the value is a number (not a string) and you need to set the proper filter for that column. All those things can be placed in a coldef-plugin and then be reused across your grids or projects.

## Usage

coldef-plugins are placed in the `/site/[assets|modules]/RockGrid/coldefs` folder. To add a new coldef-type see the existing files like `date.js` or `number.js`.

To use those plugins add them like so:

```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_yourgridid') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  grid.addColDefPlugins({
    answercount: 'number',
  });
});
```

This will use the `number` coldef-plugin for the column `answercount` making it text-align: right and using the number-filter. If the colStats plugin is enabled this will also make it show the sum() of the column.

## Advanced

```js
answers: {name: 'number', valueGetter: function(params) {
  var val = params.data[answercol.field];
  if(!val) return 0;
  return val.split(',').length;
}},
```