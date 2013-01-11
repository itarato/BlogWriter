jQuery(function(){
  var blogWriter = new BlogWriter({
    sourceElement: '#post',
    targetElement: '#result',
    codeElement: '#code'
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
  var ST_NORMAL = 1 << 0;
  var ST_CODE   = 1 << 1;

  var wrappables = [
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6'
  ];

  var starters = [
    'CODE'
  ];

  var closers = [
    '/CODE'
  ];

  var getPrefix = function(line) {
    if (!line.toString().match(/^\/{0,1}[A-Z]{1,}[A-Z0-9:]*\./gi)) {
      return null;
    }

    var prefix = line.toString().replace(/^(\/{0,1}[A-Z]{1,}[A-Z0-9:]*)\..*$/g, '$1');
    var prefix_parts = prefix.split(':');

    return prefix_parts;
  };

  var removePrefix = function(line) {
    return line.toString().replace(/^\/{0,1}[A-Z]{1,}[A-Z0-9:]*\.(.*)$/g, '$1');
  };

  var wrap = function(line, prefix) {
    var tag = prefix.toString().toLowerCase();
    return '<' + tag + '>' + line + '</' + tag + '>';
  };

  return {
    refreshPreview: function() {
      localStorage.post = jQuery(options.sourceElement).val();

      var rawValue = jQuery(options.sourceElement).val();
      var processedValue = '';
      var state = ST_NORMAL;

      var lines = rawValue.toString().split("\n");
      for (var lineIdx in lines) {
        var line = lines[lineIdx].toString();

        line = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Process prefix directives.
        var prefix = getPrefix(line);
        var mainPrefix = prefix ? prefix[0] : null;
        line = removePrefix(line);

        if (mainPrefix) {
          if (wrappables.indexOf(mainPrefix) >= 0) {
            line = wrap(line, prefix[0]);
          }

          if (starters.indexOf(mainPrefix) >= 0) {
            if (mainPrefix == 'CODE') {
              state = state | ST_CODE;
              line = '<pre class="brush:js">' + line;
            }
          }

          if (closers.indexOf(mainPrefix) >= 0) {
            if (mainPrefix == '/CODE') {
              state = state ^ ST_CODE;
              line = line + '</pre>';
            }
          }
        }

        if (!(state & ST_CODE)) {
          line = line + '<br />';
        }

        processedValue = processedValue + line + "\n";
      }

      jQuery(options.targetElement).html(processedValue);
      jQuery(options.codeElement).val(processedValue);
    }
  };
}
