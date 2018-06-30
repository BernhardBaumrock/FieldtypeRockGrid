# Docs

This plugin is turned on by default. See readme.md how to turn it off globally or for a special grid.

If this plugin is activated the columns will be resized automatically. To define fixed with columns do the following:

```js
var col = grid.getColDef('date');
col.headerName = 'Datum';
col.width = 90;
col.suppressSizeToFit = true;

var col = grid.getColDef('referenceline');
col.headerName = 'Buchungszeile';
col.minWidth = 300;

var col = grid.getColDef('account:title');
col.headerName = 'Konto';
col.width = 200;
col.suppressSizeToFit = true;
```

This will make the column `referenceline` fill up all the free space of the grid.