jQuery(function(){
  $('#tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

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
  var getPrefix = function(line) {
    if (!line || !line.toString().match(/^#[^#]+#/g)) {
      return {
        isPrefix: false,
      };
    }

    var prefix = line.toString().replace(/^#([^#]+)#.*$/g, '$1');
    var prefix_parts = prefix.split('::');
    var tag = prefix_parts.shift();
    var params = prefix_parts.shift();
    var strippedLine = line.toString().replace(/^#[^#]+#(.*)$/g, '$1');

    var shortcuts = {
      'js':  {tag: 'pre', params: 'class="brush:js"'},
      'php': {tag: 'pre', params: 'class="brush:php"'},
      'ps': {tag: 'pre', params: 'class="brush:ps"'},
      'xml': {tag: 'pre', params: 'class="brush:xml"'}
    };

    if (shortcuts.hasOwnProperty(tag)) {
      params = shortcuts[tag].params;
      tag = shortcuts[tag].tag;
    }

    return {
      isPrefix: true,
      tag: tag,
      params: params,
      line: strippedLine
    };
  };

  var hasCloseTag = function(line) {
    if (!line) {
      return {
        isClosed: false
      };
    }

    return {
      isClosed: line.toString().match(/\/$/g) != null,
      line: line.toString().replace(/^(.*)\/$/g, '$1')
    };
  };

  var addTags = function(line_info, openTags) {
    if (!line_info.line) {
      return line_info.line;
    }

    if (line_info.prefix.isPrefix) {
      openTags.push(line_info.prefix.tag);
      line_info.line = '<' + line_info.prefix.tag + ' ' + (line_info.prefix.params || '') + '>' + line_info.line;
    }

    if (line_info.hasCloseTag) {
      line_info.line = line_info.line + '</' + openTags.pop() + '>';
    }

    return line_info.line;
  };

  var analyzeLine = function(line) {
    var prefix = getPrefix(line);
    if (prefix.isPrefix) {
      // Removed prefix.
      line = prefix.line;
    }

    var closeTag = hasCloseTag(line);
    if (closeTag.isClosed) {
      // Remove close tag.
      line = closeTag.line;
    }

    return {
      prefix: prefix,
      hasCloseTag: closeTag.isClosed,
      line: line
    };
  };

  return {
    refreshPreview: function() {
      localStorage.post = jQuery(options.sourceElement).val();

      var rawValue = jQuery(options.sourceElement).val();
      var processedValue = '';
      var openTags = [];

      var lines = rawValue.toString().split("\n");
      for (var lineIdx in lines) {
        var line = lines[lineIdx].toString();

        // Convert gt and lt signs.
        line = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Process prefix directives.
        var line_info = analyzeLine(line);

        line = addTags(line_info, openTags);

        if (openTags.indexOf('pre') == -1) {
          line = line + '<br />';
        }

        line = line.replace(/(https?:\/\/[^\s]+)\[([^\]]+)\]/gi, '<a target="_blank" href="$1">$2</a>');

        processedValue = processedValue + line + "\n";
      }

      // Do stats.
      jQuery('#stat_words').text(rawValue.toString().match(/\S+/g).length);
      jQuery('#stat_chars').text(rawValue.toString().length);

      jQuery(options.targetElement).html(processedValue);
      jQuery(options.codeElement).val(processedValue);

      jQuery(options.sourceElement).css('height', jQuery(options.targetElement).css('height'));
    }
  };
}
