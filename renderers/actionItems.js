document.addEventListener('RockGridReady', function(e) {
  RockGrid.renderers.actionItems = function(params, actions, tpl) {
    // prepare markup
    tpl = tpl || '<a href="{href}" title="{str}" {target} {class}><i class="{icon}"></i></a>';

    if(!actions) return;
    if(!actions.length) return;

    // replace tags
    var out = '';
    for(var i=0; i<actions.length; i++) {
      out += '<span class="RockGridActionItem">';
      var action = actions[i];
      var str = tpl;

      // replace tags
      for(param in action) {
        str = str.replace('{'+param+'}', action[param]);
      }

      // remove empty tags
      var regex = /{.*?}/g;
      str = str.replace(regex, '');
      
      out += str + '</span>';
    }

    return out;
  };
});
