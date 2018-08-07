# Docs

## Add global RockGrid settings (colors, styles, values)

```js
// /site/assets/RockGrid/fields/global.js
document.addEventListener('RockGridReady', function(e) {
  RockGrid.settings = {
    foo: 'bar',
  };
});
```

## Disable floating filter

```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_yourgridid') return;
  var grid = RockGrid.getGrid(e.target.id);
  grid.gridOptions.floatingFilter = false;
});
```

## Example how to trigger refresh after panel was closed

```js
// /site/assets/RockGrid/fields/global.js
$(document).on('pw-panel-closed', function(event, $panel) {
  console.log(event);
  console.log($panel);
  $.each($('.RockGridItem:visible'), function(i, $el) {
    $wrapper = $(RockGrid.getGrid($el).getWrapperDOM());
    $wrapper.find('.rockgridbutton.refresh').click();
  });
});
```

## Example of a RockGrid in a ProcessModule

```php
$form = $this->modules->get('InputfieldForm');

$f = $this->modules->get('InputfieldRockGrid');
$f->name = 'myRockGridField';
$f->themeBorder = 'none';
$f->setData(new RockFinder("id>0, limit=10", [
  'title',
  'templates_id',
  'created',
  'status',
]));
$form->add($f);

return $form->render();
```
Then you can modify your grid via a javascript file: `/site/assets/RockGrid/fields/myRockGridField.js`

---

## Example of a multilanguage setup:

You can define language strings either locally for a grid in `/site/assets/RockGrid/fields/yourfield.php`:

```php
$this->x('pl_name', __('Projektleiter'));
$this->x('title', __('Bezeichnung'));
```

Access these strings in the grid's js file:

```js
var grid = RockGrid.getGrid('yourgridname');
console.log(grid.str.pl_name);
console.log(grid.str.title);
```

Or you can define global strings in any globally loaded file, but recommended in `site/assets/RockGrid/lang.php` (note I'm using `->rg->x` instead of `->x`):

```php
$this->rg->x('pl_name', __('Projektleiter'));
$this->rg->x('title', __('Bezeichnung'));
```

Access these strings in the grid's js file:

```js
console.log(RockGrid.str.pl_name);
console.log(RockGrid.str.title);
```

## Set visible columns
```js
document.addEventListener('RockGridItemAfterInit', function(e) {
  if(e.target.id != 'RockGridItem_architecture') return;
  var grid = RockGrid.getGrid(e.target.id);

  grid.setColumns(['id', 'fbdone', 'answers', 'fgcount', 'fg:title', 'fncount', 'fn:title', 'fbrole:title']);
});
```

```js

document.addEventListener('RockGridItemAfterInit', function(e) {
  if(e.target.id != 'RockGridItem_mygridid') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  // hide one column
  grid.columnApi().setColumnVisible('myhiddencolumn', false);
});
```

## Manual initialisation

Sometimes you need to load a grid after other actions where performed. To make that possible add
a function called onLoad_yourgrid needs to be defined in the js file. Example for a field called
`responserates`:

```js
// responserates.js
var onLoad_responserates = function(js) {
  // show init message
  $('#RockGridItem_responserates').closest('.RockGridWrapper').find('.init').html(js.textBeforeInit);

  // if grid2 is already loaded init this field
  var grid2 = RockGrid.getGrid('architecture');
  if(grid2) {
    initGrid_responserates();
  }
}
// init grid when other grid had loaded it's data
$(document).on('RockGridAjaxDone', function(event) {
  if($(event.target).attr('id') != 'RockGridItem_architecture') return;
  initGrid_responserates();
});
```

```php
// responserates.php
$this->x('textBeforeInit', __('Please do this or that to show this grid!'));
```

## Add dynamic columns

```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_mygridid') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  // add reports column
  grid.gridOptions.columnDefs.push({
    valueGetter: function() { return 'x'; },
  });
});
```

## Listening for events

See https://www.ag-grid.com/javascript-grid-reference-overview/#listening-to-events for more information and https://www.ag-grid.com/javascript-grid-events/ for all available events.

Example:

```js
document.addEventListener('RockGridItemAfterInit', function(e) {
  if(e.target.id != 'RockGridItem_projects') return;
  var grid = RockGrid.getGrid(e.target.id);
  
  grid.api().addEventListener('rowSelected', function(e) {
    console.log('row was (un)selected!');

    // show array of selected ids
    console.log(grid.pluck('id', {selected:true}));
  })
});
```

## AJAX callbacks

In your php data-file:

```php
$this->ajax('send', function($data) {
  foreach($data as $item) {
    // do something
  }
});
```

You can also set options on the server-side so you do not need to put sensitive data in the AJAX request:

```php
$this->ajax('send', function($data, $options) {
  $project = $options['projectid'];
  foreach($data as $person) {
    // do something
  }
}, ['projectid' => $project]);
```

Setup the GUI on the client-side:

```js
$(document).on('click', 'button[name=send]', function() {
  var grid = RockGrid.getGrid('recipients');

  // get recipients type
  var mails = $('input[name=mails]:checked', '#sendmailform').val();
  var recipient = $('input[name=recipient]:checked', '#sendmailform').val();
    
  // show confirm dialog
  var Batcher = RockGrid.batcher;
  Batcher.items = grid.pluck('id', {selected: (mails=='selected')});
  Batcher.batchSize = 10;
  Batcher.action = function(items) {
    // send ajax request to this grid
    var ajax = grid.ajax({
      action: 'send',
      data: items,
    }).done(function(params) {
      Batcher.nextBatch();
    });
  };
  Batcher.confirmStart({
    msg: grid.js.confirmsend,
    onYes: function() {
      Batcher.nextBatch();
    },
    onLoad: function() {
      if(!Batcher.items.length) {
        ProcessWire.alert(grid.js.noItems);
        return false;
      }
    },
  });
});
```

---
---
---
