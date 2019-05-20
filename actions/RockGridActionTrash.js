$(document).on('RockGridActionAdded', function(e, action) {
  if(action.name != 'trash') return;
  action.execute = function() {
    var batcher = this.batcher;
    batcher.batchSize = 1000;
    batcher.items = this.getIds();
    batcher.executeBatch = function(chunk) {
      action.getJSON(null,{
        abortOnError: true,
        logResult: true,
      });
    }
    action.confirmStart();
  }
});
