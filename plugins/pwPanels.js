/**
 * intercept pw panel links
 */
if(typeof pwPanels !== 'undefined') {
  // when pwPanels is available also JQuery is available
  $(document).on('click', '.RockGridItem a.pw-panel:not(.init)', function(e) {
    $el = $(this);
    $el.addClass('init'); // add init class to prevent double initialisation of panels
    $.when(pwPanels.addPanel($el)).then(function() { $el.click(); }); // init panel and click on the link when done
    return false; // prevent initial click on the old link
  });
};