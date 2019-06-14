# RockGridActions Docs

TODO

* proper multilang support
* pw forum post
* neue tags "undefined" -> rockfinder update

Every action must implement an execute function that is called from AJAX requests
```php
/**
 * Execute this action
 *
 * @param object $data
  * @return object
  */
public function execute($data) {
  $cnt = count($data->chunk);
  $result = (object)[
    'type' => $cnt < 1000 ? 'warning' : 'success',
    'msg' => 'AJAX DONE :))) ' . $cnt,
    'data' => $data,
  ];
  return $result;
}
```

How to get the grid instance from within an action file: `action.grid`

```js
$(document).on('RockGridActionAdded', function(e, action) {
  if(action.name != 'recurringInvoice') return;

  action.execute = function() {
    action.getForm().submit();
  }

  // listeners
  $(document).on('change', '.showRecurring', function(e) {
    // get grid
    var grid = action.grid;

    // get checkbox value
    var val = $(this).is(':checked');
  
    // set filter
    var filter = grid.api().getFilterInstance('datenext');
    filter.setModel({
      type: 'smart',
      value: val ? '.' : '',
    });
    grid.api().onFilterChanged();
  });
});
```

![img](https://i.imgur.com/YcfUnC0.png)
