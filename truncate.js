/**
 * HTML-Truncate Utility
 * This utility truncates html text and keep tag safe(close properly)
 *
 * @public
 * @method truncate
 * @param {String} string string needs to be truncated
 * @param {Number} maxLength length of truncated string
 * @param {Object} options (optional)
 * @param {Boolean} [options.keepImageTag] flag to specify if keep image tag, false by default
 * @param {Boolean|String} [options.ellipsis] omission symbol for truncated string, '...' by default
 * @return {String} truncated string
 */
module.exports.truncate = function (string, maxLength, options) {
    var EMPTY_OBJECT = {}
      , EMPTY_STRING = ''
      , EXCLUDE_TAGS = ['img']          // non-closed tags
      , items = []                      // stack for saving tags
      , total = 0                       // record how many characters we traced so far
      , content = EMPTY_STRING          // truncated text storage
      , matches = true
      , result, index, tail, tag;

    /**
     * @private
     * helper to dump all close tags and append to truncated content while reaching upperbound
     */
    var _removeImageTag = function (string) {
        var match = /<img\s*(\w+\s*=\s*"[^"]*"\s*)*>/g.exec(string),
            index, len;

        if ( ! match) {
            return string;
        }

        index = match.index,
        len = match[0].length;
        return [string.substring(0, index), string.substring(index + len)].join(EMPTY_STRING);
    }

    /**
     * @private
     * helper to dump all close tags and append to truncated content while reaching upperbound
     */
    var _dumpCloseTag = function (items) {
        var excludeTags = EXCLUDE_TAGS.toString(),
            html = '';

        items.reverse().forEach(function (tag, index) {
            // dump non-excluded tags only
            if (-1 === tag.indexOf(excludeTags)) {
                html += '</' + tag + '>';
            }
        });
        
        return html;
    }

    /**
     * @private
     * processed tag string to get pure tag name
     */
    var _getTag = function (string) {
        var tail = string.indexOf(' ');

        if (-1 === tail) {
            tail = string.indexOf('>');
        }

        return string.substring(1, tail);
    }

    options = options || EMPTY_OBJECT;
    options.ellipsis = options.ellipsis || '...';

    while(matches) {
        matches = /<\/?\w+\s*(\w+\s*=\s*"[^"]*"\s*)*>/g.exec(string);

        if ( ! matches) {
            if (total < maxLength) {
                content += string.substring(0, maxLength - total);
            }
            break;
        }

        result = matches[0];
        index = matches.index;

        if (total + index > maxLength) {
            // overceed, dump everything to clear stack
            content += (string.substring(0, maxLength - total));
            break;
        } else {
            total += index;
            content += string.substring(0, index);
        }

        if ('/' === result[1]) {
            // move out open tag
            items.pop();
        } else {
            tag = _getTag(result);

            items.push(tag);
        }

        content += result;
        string = string.substring(index + result.length);
    }

    if (options.ellipsis) {
        content += options.ellipsis;
    }
    content += _dumpCloseTag(items);

    if ( ! options.keepImageTag) {
        content = _removeImageTag(content);
    }

    return content;
}
