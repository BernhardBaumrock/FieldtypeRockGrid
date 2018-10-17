```js
  col = grid.getColDef('title');
  col = RockGrid.colDefs.fixedWidth(col, 100);
  col = RockGrid.colDefs.addIcons(col, [{
    icon: 'file-pdf-o',
    cls: 'pw-panel',
    dataHref: function(params) {
      if(!params.data.pdfs) return;
      var pdfs = params.data.pdfs.split(',');
      if(!pdfs.length) return;
      return '/site/assets/files/' + params.data.id + '/' + pdfs[pdfs.length-1];
    },
    label: function(params) {
      return 'show invoice PDF ' + params.data.id;
    },
  }]);
```