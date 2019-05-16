# RockGridActions Docs

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

![img](https://i.imgur.com/YcfUnC0.png)
