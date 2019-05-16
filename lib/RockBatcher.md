# RockBatcher Docs

```js
var batcher = this.batcher;
batcher.batchSize = 1000;
batcher.minBatchDuration = 500;
batcher.items = [1, 2, 3, ...];
batcher.executeBatch = function(chunk) {
  var items = chunk.join(', ');
  return {type:'success', msg:"Executed items "+items};
}
```

AJAX

```js
// todo
```