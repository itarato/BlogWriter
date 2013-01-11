jQuery(function(){
  var blogWriter = new BlogWriter({
    sourceElement: '#post',
    targetElement: '#result'
  });

  if (localStorage.post) {
    jQuery('#post').val(localStorage.post);
  }

  jQuery('#post').keyup(function(event){
    blogWriter.refreshPreview();
  });

  blogWriter.refreshPreview();
});

/**
 * @param options
 *  - sourceElement
 *  - targetElement
 */
var BlogWriter = function(options) {
  return {
    refreshPreview: function() {
      localStorage.post = jQuery(options.sourceElement).val();

      jQuery(options.targetElement).html(jQuery(options.sourceElement).val());
    }
  };
}
