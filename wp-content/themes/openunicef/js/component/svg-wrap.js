/* global d3 */
'use strict';

define(function (require) {

  function svgWrap() {

    // Cribbed from Mike Bostock: http://bl.ocks.org/mbostock/7555321
    function wrap(selection) {
      selection.each(function () {
        var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word = words.pop(),
          line = [],
          lineNumber = 0,
          y = text.attr('y'),
          x = text.attr('x'),
          dy = parseFloat(text.attr('dy')),
          fontsize = text.style('font-size'),
          tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).style('font-size', fontsize);

        while (word) {
          line.push(word);
          tspan.text(line.join(' '));

          if (tspan.node().getComputedTextLength() > _width) {
            line.pop();
            ++lineNumber;

            if (lineNumber < _lines) {
              tspan.text(line.join(' '));
              line = [word];
              tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', _lineHeight + 'em').style('font-size', fontsize).text(word);
            } else {
              tspan.text(line.join(' ') + '…');
            }
          }

          if (lineNumber < _lines) {
            word = words.pop();
          } else {
            word = null;
          }
        }
      });
    }

    wrap.width = function (value) {
      if (arguments.length < 1) {
        return wrap;
      }

      _width = value;

      return wrap;
    };

    wrap.lines = function (value) {
      if (arguments.length < 1) {
        return wrap;
      }

      _lines = value;

      return wrap;
    };

    wrap.lineHeight = function (value) {
      if (arguments.length < 1) {
        return wrap;
      }

      _lineHeight = value;

      return wrap;
    };
    var _width = 100,
      _lines = 1,
      _lineHeight = 1.1;

    return wrap;
  }

  return svgWrap;
});
