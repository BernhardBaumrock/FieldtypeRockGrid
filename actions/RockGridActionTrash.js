$(document).on('RockGridActionLoad', function(e, grid) {
  var action = new RockGridAction('trash');

  action.execute = function() {
    var batcher = this.batcher;
    batcher.batchSize = 50;
    batcher.minBatchDuration = 500;
    batcher.items = this.getIds();
    batcher.executeBatch = function(chunk) {
      action.getJSON(null,{
        abortOnError: true,
        logResult: true,
      });
    }
    action.confirmStart();
  }

  grid.addAction(action);
});
