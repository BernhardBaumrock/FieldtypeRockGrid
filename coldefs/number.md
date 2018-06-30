# `number` coldef-Plugin

Coldef `number` makes sure the cell value is a number (not a string showing a number) and sets the filter to a numeric filter (less than, greater than, ...). When using the colStats plugin, this makes sure that the colStats show the sum() of the column.

## simple

```js
grid.addColDefPlugins({
  answers: 'number',
});
```

## advanced

```js
grid.addColDefPlugins({
  answers: {
    name: 'number',
    valueGetter: function(params) {
      var val = params.data[answercol.field];
      if(!val) return 0;
      return val.split(',').length;
    }
  },
});
```