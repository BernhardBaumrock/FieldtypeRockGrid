# Usage of Batcher

```js
var Batcher = RockGrid.batcher;
Batcher.batchSize = 3;
Batcher.items = grid.pluck('id', {selected:true});
Batcher.action = function(items) {
  console.log('starting batch ' + Batcher.index);
  console.log(items);
  $.get('./?timer=' + Math.random(), function(data) {
    // console.log(data);
  }).done(function() {
    console.log('done!');
    Batcher.nextBatch()
  });
}
Batcher.nextBatch();
```