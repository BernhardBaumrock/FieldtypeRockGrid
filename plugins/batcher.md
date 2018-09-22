# Usage of Batcher

Batcher helps you to execute actions for any amount of items. The amount of items
per batch can be defined. Every batch is sent to the server via an AJAX call.

The basic principle is to have a JS file that iterates over all items and sends
AJAX requests to the server and a PHP file that executes the action on the server.

See `trash.js` and `trash.php` as an example!

```js
var Batcher = RockGrid.batcher;

// how many items do we send to the server with each batch?
Batcher.batchSize = 3;

// which items do we want to select for the execution
// in this case we select all ids of the selected rows
// other options would be to take all ids or all ids of filtered rows
Batcher.items = grid.pluck('id', {selected:true});

// define the action and callback functions
Batcher.action = function(items) {
  console.log('starting batch ' + Batcher.index);
  console.log(items);

  // send the AJAX call
  // this is a simple jquery get() request
  // rockgrid comes with a custom ajax helper function, see trash.js as example
  $.get('./?timer=' + Math.random(), function(data) {
    // show result
    console.log(data);
  }).done(function() {
    console.log('done!');
    Batcher.nextBatch()
  });
}
Batcher.nextBatch();
```