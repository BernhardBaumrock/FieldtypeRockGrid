# Docs

## Create a cellRenderer

You can either create a custom function that takes params passed by aggrid and returns a string that will be rendered in the cell or - and that is the preferred option - you can define such a function and attach it to RockGrid's global Object:

```js
/* /site/assets/RockGrid/renderers/demoRenderer.js */
document.addEventListener('RockGridReady', function(e) {
  RockGrid.renderers.demoRenderer = function(params) {
    return 'This is a demo renderer! Original value: ' + params.value;
  };
});
```

And then add this renderer to the colDef of your column:
```js
/* /site/assets/RockGrid/fields/yourfield.js */
colDef = grid.getColDef('yourcolumn');
colDef.cellRenderer = RockGrid.renderers.demoRenderer;
```

If you need additional parameters for your renderer you can define them like this:
```js
colDef.cellRendererParams = {
  foo: 'bar'
};
```

Then you can use them in your renderer like this:
```js
if(params.foo == 'bar') return 'this: ' + params.value;
else return 'that: ' + params.value;
```