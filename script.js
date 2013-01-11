jQuery(function(){

  jQuery('#post').keyup(function(event){
    blogWriter.refreshPreview();
  });

});

/**
 * @param options
 *  - sourceElement
 *  - targetElement
 */
var BlogWriter = function(options) {
  return {
    refreshPreview: function() {
      jQuery(options.targetElement).html(jQuery(options.sourceElement).val());
    }
  };
}

var blogWriter = new BlogWriter({
  sourceElement: '#post',
  targetElement: '#result'
});
