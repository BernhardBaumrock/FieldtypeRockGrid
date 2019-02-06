## How to trigger filters on button click

![screenshot](https://i.imgur.com/WSTzEzo.png)

```php
/** @var InputfieldButton $b */
$b = $this->modules->get('InputfieldButton');
$b->id = 'showToday';
$b->value = 'Heute';
echo $b->render();

$b = $this->modules->get('InputfieldButton');
$b->id = 'byMe';
$b->value = 'von mir';
$b->attr('data-coach', $this->user->fullname);
$b->addClass('ui-priority-secondary');
echo $b->render();
```

```js
document.addEventListener('RockGridItemBeforeInit', function(e) {
  if(e.target.id != 'RockGridItem_trainings_physio') return;
  var grid = RockGrid.getGrid(e.target.id);
  var col;
  
  // ##### handle button clicks #####

  $(document).on('click', '#showToday', function() {
    var filter = grid.api().getFilterInstance('from');
    filter.setModel({
      type: 'smart',
      value: moment().format("Y-MM-DD"),
    });
    grid.api().onFilterChanged();
  });

  $(document).on('click', '#byMe', function(e) {
    var $button = $(e.target).closest('button');
    var filter = grid.api().getFilterInstance('coach:title');
    filter.setModel({
      type: 'smart',
      value: $button.data('coach'),
    });
    grid.api().onFilterChanged();
  });
});
```