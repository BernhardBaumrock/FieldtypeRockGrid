# Library of useful column-definitions

ColDefs can be used to change columns to repeating needs. For example you can
use a coldef plugin to make the ID column not show the plain id as number but
to show clickable icons:

```js
col = grid.getColDef('id');
col = RockGrid.colDefs.rowactions(col);
```

![rowactions](https://i.imgur.com/Ml0ipqq.png)

Some colDefs can also be defined with an extra options object:

```js
col = grid.getColDef('id');
col = RockGrid.colDefs.rowactions(col, {
  strShow: 'Open this page in a PW-Panel',
  noTrash: true,
});
```

![custom-options](https://i.imgur.com/xMjK1nG.png)
