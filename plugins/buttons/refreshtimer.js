document.addEventListener('RockGridItemLoadButtons', function(e) {
  if(!RockGrid.backend) {
    console.warn('currently works only in backend');
    return;
  }

  var buttonsPlugin = e.detail;
  var grid = RockGrid.getGrid(e.target);
  var $wrapper = $(grid.getWrapperDOM());

  RockGrid.getGrid(e.target).registerPlugin(function() {
    this.name = 'refreshTimer';
    this.enabled = false;

    if(settings = grid.getPlugin(this.name)) var settings = settings.settings;
    else var settings = {};

    this.bar;
    this.timeout = settings.timeout || 60; // default reload timeout
  
    var plugin = this;
    this.onLoad = function() {
      $wrapper.find('.rockgridbuttons').prepend(
        '<span class="refreshtimer">'+
          '<span class="spinner">&nbsp;</span>'+
          '<input type="text" value="' + plugin.timeout + '" title="' + RockGrid.str.refreshTimer + '">'+
        '</span>'
      );

      this.bar = new ProgressBar.Line($wrapper.find('.refreshtimer .spinner')[0], {
        strokeWidth: 6,
        duration: plugin.timeout*1000,
        color: '#afafaf',
      });

      this.start();
    }

    this.onAjaxDone = function() {
      plugin.bar.set(0);
      plugin.start();
    }

    this.start = function() {
      plugin.bar.animate(
        1,
        {duration: $wrapper.find('.refreshtimer input').val()*1000},
        plugin.reload
      );
    }

    this.reload = function() {
      grid.reload({overlay: false});
    }
  });
});
