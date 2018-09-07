# Example usage

```js
colDef = grid.getColDef('date');
colDef.cellRenderer = RockGrid.renderers.date;
colDef.cellRendererParams = { format: 'DDMM' };
```

Or the shortcut:

```js
grid.addColDefPlugins({
  deadline: {name: 'date', format: 'DD.MM.YYYY HH:mm:ss'},
});
```

You need to include `moment.js` to your assets. In your field's php file do this:
```php
// eg site/assets/RockGrid/fields/yourfield.php
$this->rg->assets->add($this->config->paths->siteModules . 'FieldtypeRockGrid/lib/moment.min.js');
```