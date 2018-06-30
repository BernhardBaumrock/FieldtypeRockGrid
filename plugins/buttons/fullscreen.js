document.addEventListener('RockGridItemLoadButtons', function(e) {
  var buttonsPlugin = e.detail;

  var fullscreenPlugin = RockGrid.getGrid(e.target).registerPlugin(function() {
    var button = this;

    this.name = 'buttonFullscreen';
  
    this.onLoad = function() {
      buttonsPlugin.add({
        name: 'fullscreen',
        icon: 'fa-expand',
        hover: 'Toggle Fullscreen',
        onClick: function(node) {
          var grid = button.grid;
          var wrapper = grid.getWrapperDOM();

          wrapper.classList.toggle('fullscreen');
          node.querySelector('i').classList.toggle('fa-compress');
    
          // todo: make non-jquery version
          $el = $(grid.getDOM());
          if($(wrapper).hasClass('fullscreen')) {
            // save current height to dom element
            $el.data('height', $el.height());
    
            button.setGridFullscreen(wrapper);
          }
          else {
            // restore initial height
            // but only if it is not an autoheight grid
            if(grid.js.settings.height > 0) {
              $el.height($el.data('height'));
            }
            else {
              $el.height('auto');
              $(wrapper).height('auto');
            }
          }
    
          window.dispatchEvent(new Event('resize'));
        },
      });
    }


    this.setGridFullscreen = function(wrapper) {
      var $el = $(wrapper).find('.RockGridItem');
      var wrapperHeight = $(wrapper).outerHeight();
      var gridHeight = $el.outerHeight();
      $el.height($(window).height() - (wrapperHeight-gridHeight));
    }

  });

  /**
   * ##################### backend event listeners #####################
   */
  if(!RockGrid.backend) return;

  /**
   * adjust columns when window is resized
   * todo: make non-jquery version, add frontend support
   */
  var resizeTimer;
  $(window).on('resize', function(e) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      $('.RockGridWrapper.fullscreen').each(function(i,el) {
        var $el = $(el).find('.RockGridItem');
        fullscreenPlugin.setGridFullscreen($el.closest('.RockGridWrapper'));
      });
    }, 500);
  });
});
