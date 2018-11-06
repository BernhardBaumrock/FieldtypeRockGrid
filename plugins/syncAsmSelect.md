# Example Setup

Adding the asm in a processmodule. `$fs` is a fieldset where we add our InputField to. `$gridname` is the name of the grid that is connected.

```php
    // which lists to show
    $this->wire->config->scripts->append($this->wire->urls($this) . "scripts/manageLists.js");
    $fs->add([
      'type' => 'InputfieldAsmSelect',
      'name' => 'listsToShow',
      'label' => __('Show list membership for...'),
      'attr' => ['data-grid' => $gridname],
      'asmOptions' => ['sortable'=>false],
    ]);
    $f = $fs->getChildByName('listsToShow');
    $f->setAsmSelectOption('sortable', false);
    foreach($pages->get('template=rockmailer_lists')->children as $item) {
      $f->addOption($item->id, $item->title);
    }
```

And the portion of the javascript file:

```js
// sync ASM field with displayed lists in grid
// attach event listener when document is ready
$(document).ready(function() {
  var $select = $('#Inputfield_listsToShow');
  var colPrefix = 'rockmailer_list_';
  
  RockGrid.plugins.syncAsmSelect({
    asm: $('#Inputfield_listsToShow'),
    grid: RockGrid.getGrid($select.data('grid')),
    colName: function(pageId) { return colPrefix + pageId; },
    colDef: function(col) {
      col = RockGrid.colDefs.yesNo(col, {
        isYes: function(params) {
          var pageId = String(params.column.colId).replace(colPrefix, '');
          var lists = String(params.data.rockmailer_lists).split(',');
          return lists.indexOf(pageId) > -1 ? true : false;
        }
      });
      col.pinned = 'left';
      return col;
    }
  });
});
```

In this case we set a custom callback to modify the colDef for the column. It uses the yesNo plugin to show icons instead of true/false values:

![screenshot](https://i.imgur.com/54ehmWH.png)
