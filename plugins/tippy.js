// show tippy on hover
$(document).on('hover', '.rg-tippy', function(e) {
  var $el = $(e.target).closest('.rg-tippy');
  var $pop = $el.next('.rg-tippy-hidden');
  tippy($el[0], {
    theme: 'light-border',
    content: $pop.html(),
    interactive: true,
    arrow: true,
    placement: $el.data('placement'),
    zIndex: 999, // pw-panels have 1000
  });
});
