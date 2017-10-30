/* global d3 */

'use strict';

define(function (require) {

  require('text!template/tooltip/sectorLink.html');
  require('text!template/tooltip/donorLink.html');
  require('text!template/tooltip/countryLink.html');
  require('text!template/tooltip/sankey.html');

  var defineComponent = require('flight/lib/component');

  var _ = require('lodash');

  var withYear = require('mixin/withYear');

  var flowModel = require('data/flow');
  var details = require('data/flowDetails');

  var wrap = require('component/svg-wrap');

  var defaults = {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    nodeWidth: 15,
    //nodePadding: 28
    	nodePadding: 45 //Changed by AY @27.04.2016
  };

  function SankeyComponent() {
    this.attributes(_.defaults({
      width: null,
      fill: null,
      linkOpacity: '0.3'
    }, defaults));

    this.after('initialize', function () {
      var self = this,
        timer = null;

      // Allow partial definition of margins in attributes
      _.defaults(this.attr.margin, defaults.margin);

      var width = this.attr.width - this.attr.margin.left - this.attr.margin.right;

      var svgCanvas = d3.select(this.node).append('svg')
          .attr('width', this.attr.width);

      var svg = svgCanvas.append('g')
          .attr('transform', 'translate(' + this.attr.margin.left + ',' + this.attr.margin.top + ')');

      svg.append('g').attr('class', 'links');
      svg.append('g').attr('class', 'nodes');

      flowModel(this.attr.year).done(update);

      this.after('yearChanged', function () {
        flowModel(this.attr.year).done(update);
      });

      function update(data) {
        // Make sure that we use a function for fill. If our fill attribute is
        // not a function, wrap it in one that just returns the value so that
        // it's easy to specify constant fills as strings.
        var fill = (typeof self.attr.fill === 'function') ? self.attr.fill :
            function () { return self.attr.fill; };

        // Calculate the height so that it can accommodate all the nodes.

        // Calculate the desired scaling factor for the node heights to ensure
        // that the required height for the Sankey doesn't exceed the canvas
        // height and result in overlapping nodes. The constant 25 was found
        // through experimentation
        var scallingFactor = 25    ;
        var ky = scallingFactor / d3.max(data.nodes, function (node) {
          return node.total_node_value;
        });

        // Break nodes up into their respective columns by type
        var columns = _(data.nodes)
          .groupBy('type')
          .values()
          .value();

        // Calculate the total height of the padding based on the tallest column
        var totalPadding = self.attr.nodePadding * d3.max(columns,
          function (c) {
            return c.length;
          });

        // Calculate the height of the tallest column by finding the maximum
        // sum of the node values
        var total = _(columns)
          .map(function (col) {
            // Return the sum of the node values
            return _.reduce(col, function (sum, node) {
              return sum + node.total_node_value;
            }, 0);
          })
          .max()
          .value();

        // Calculate the height of the content area based on the tallest column,
        // desired scaling factor, and the amount of padding required
        var height = total * ky + totalPadding;

        // Set the height of the SVG, including margins.
        svgCanvas.attr('height', height + self.attr.margin.top + self.attr.margin.bottom);

        var sankey = d3.sankey()
          .nodeWidth(self.attr.nodeWidth)
          .nodePadding(self.attr.nodePadding)
          .size([width, height])
          .nodes(data.nodes)
          .links(data.links)
          .layout(0);

        var links = svg.select('.links').selectAll('.link')
            .data(data.links, function (d) { return d.id; });

        // Update existing link paths
        links.attr('d', sankey.link());

        // Shrink stroke width to 0 before removing links.
        links.exit()
          .transition().duration(1000)
            .attr('stroke-width', 0)
          .remove();

        // Initialize new links.
        links.enter().append('path')
            .attr('class', 'link')
            .attr('d', sankey.link())
            .attr('stroke-width', 1)
            .style('stroke-opacity', self.attr.linkOpacity)
            .on('mouseover', highlightLink)
            .on('mousemove', updateLink)
            .on('mouseout', clearLink);

        // Animate all links' stroke widths. For new links, they will grow from
        // 1px, existing links will animate smoothly to their new value.
        links.transition().duration(1000)
            .attr('stroke-width', function (d) {
              return Math.max(1, Math.abs(d.dy));
            });

        var nodes = svg.select('.nodes').selectAll('.node')
            .data(data.nodes, function (d) { return d.id; });

        // Update existing nodes' positions
        nodes.transition().duration(1000)
            .attr('transform', function (d) {
              return 'translate(' + d.x + ',' + d.y + ')';
            });

        // Fade out existing nodes.
        nodes.exit()
          .transition().duration(1000)
            .style('opacity', '0')
          .remove();

        // Initialize new nodes
        var enter = nodes.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) {
              return 'translate(' + d.x + ',' + d.y + ')';
            });

        // Initialize dimensions and event handlers of the rectangles
        // representing nodes.
        enter.append('rect')
            .attr('fill', fill)
            .attr('stroke', '#999999')
            .attr('stroke-width', '0.5px')
            .attr('height', 0)
            .attr('width', sankey.nodeWidth())
            .on('mouseover', highlightNode)
            .on('mouseout', clearNode)
            .on('click', pinNode);

        // Animate resizing of all rectangle heights. For new nodes, they will
        // grow from 0, existing nodes will animate smoothly to their new height.
        nodes.select('rect')
            .attr('fill', fill)
          .transition().duration(1000)
            .attr('height', function (d) { return Math.max(1, Math.abs(d.dy)); });

        // Initialize the label
        enter.append('text')
            .attr('dy', '.35em')
            .style('opacity', '0')
            .style('font-size', '9pt')
          .transition().duration(1000)
            .style('opacity', '1');

        nodes.select('text')
            .attr('text-anchor', 'start')
            .attr('x', function (d) { return d.dx + 3; })
            .attr('y', function (d) { return d.dy / 2; })
            .text(function (d) { return d.name; })
          .filter(function (d) { return d.x < (width / 2); })
            .attr('x', -3)
            .attr('text-anchor', 'end');

        // Wrap the labels manually. Countries (the two sets of inner nodes)
        // require a narrower wrap than the outer nodes.
        nodes.select('text')
          .filter(function (d) { return d.type === 'country'; })
            .call(wrapSVGLabel, 160);

        nodes.select('text')
          .filter(function (d) { return d.type !== 'country'; })
            .call(wrap().width(240).lines(2).lineHeight(1.4));
      }

      function highlightNode(data) {
        svg.selectAll('.link')
          .filter(linkShouldHighlightForNode(data))
          .transition().duration(300)
            .style('stroke-opacity', '0.9');

        svg.selectAll('.link')
          .filter(linkShouldFadeForNode(data))
          .transition().duration(300)
            .style('stroke-opacity', '0.1');

        svg.selectAll('.node text')
          .filter(labelShouldFadeForNode(data))
          .transition().duration(300)
            .style('opacity', '0.1');

        showTooltip(this, self.attr.year, data);
      }

      function nodeType(nodeInfo) {
          return (/\(E\)$/.test(nodeInfo)) ? 'amt_spent' : 'amt_goes';
      }

      function showTooltip(target, year, data, force, pinned) {
        var bbox = target.getBoundingClientRect(),
          x = bbox.left + window.pageXOffset,
          y = bbox.top + window.pageYOffset;

        details(year, data).done(function (deets) {
          // These are used in the tooltips for counters.
          var units;
          var area_m = data.type;
          if (data.type=='country')
              var area_m = nodeType(deets.name);
          if (area_m=='donor' || area_m=='amt_goes')
              x = 0;
          if (area_m=='amt_spent' || area_m=='sector')
              x = screen.width - 15.5;

          switch (data.type) {
          case 'country':
            units = ['country', 'countries'];
            break;
          case 'donor':
            units = ['resource partner', 'resource partners'];
            break;

          default:
            units = [data.type, data.type + 's'];
            break;
          }

          self.trigger('uiTooltipShow', {
            id: data.id,
            replace: true,
            force: force || false,
            template: require('text!template/tooltip/sankey.html'),
            units: units,
            type: data.type,
            data: _.extend({}, deets, {
              pinned: pinned || false,
              x: x,
              y: y,
              offsetX: bbox.width,
              offsetY: 0,
            })
          });
        });
      }

      function clearNode(data) {
        clearLink(data);
        self.trigger('uiTooltipHide', { id: data.id, delay: 300 });
      }

      function pinNode(data) {
        showTooltip(this, self.attr.year, data, true, true);
      }

      function highlightLink(data) {

        svg.selectAll('.link')
          .filter(linkShouldHighlight(data))
          .transition().duration(300)
            .style('stroke-opacity', '1');

        svg.selectAll('.link')
          .filter(linkShouldFade(data))
          .transition().duration(300)
            .style('stroke-opacity', '0.1');

        svg.selectAll('.node text')
          .filter(labelShouldFade(data))
          .transition().duration(300)
            .style('opacity', '0.1');

        var template = data.source.type === ('donor') ? 'donorLink.html' :
            data.target.type === ('sector') ? 'sectorLink.html' :
            'countryLink.html';

        self.trigger('uiTooltipShow', {
          id: data.id,
          replace: true,
          template: require('text!template/tooltip/' + template),
          data: _.extend({}, data, {
            x: d3.event.pageX,
            y: d3.event.pageY,
            offsetX: 5,
            offsetY: 0
          })
        });
      }

      function updateLink(data) {
        self.trigger('uiTooltipUpdate', {
          id: data.id,
          x: d3.event.pageX,
          y: d3.event.pageY,
        });
      }

      function clearLink(data) {
        svg.selectAll('.link')
          .transition().duration(300)
            .style('stroke-opacity', self.attr.linkOpacity);

        svg.selectAll('.node text')
          .transition().duration(300)
            .style('opacity', '1');

        self.trigger('uiTooltipHide', { id: data.id });
      }

      function linkShouldHighlightForNode(data) {
        var linkIds = data.sourceLinks.concat(data.targetLinks)
            .map(function (d) { return d.id; });

        return function (d) {
          return linkIds.indexOf(d.id) > -1;
        };
      }

      function linkShouldFadeForNode(data) {
        var linkIds = data.sourceLinks.concat(data.targetLinks)
            .map(function (d) { return d.id; });

        return function (d) {
          return linkIds.indexOf(d.id) < 0;
        };
      }

      function labelShouldFadeForNode(data) {
        function connects(l) {
          return l.source.id === data.id || l.target.id === data.id;
        }

        return function (d) {
          return d.id !== data.id &&
            !d.sourceLinks.some(connects) &&
            !d.targetLinks.some(connects);
        };
      }

      function linkShouldHighlight(data) {
        return function (d) {
          return d.id === data.id ||
            (d.source.type === 'donor' && d.target.id === data.source.id) ||
            (d.target.type === 'sector' && d.source.id === data.target.id);
        };
      }

      function linkShouldFade(data) {
        return function (d) {
          return !(d.id === data.id ||
              (d.source.type === 'donor' && d.target.id === data.source.id) ||
              (d.target.type === 'sector' && d.source.id === data.target.id));
        };
      }

      function labelShouldFade(data) {
        return function (d) {
          return d.id !== data.source.id &&
            d.id !== data.target.id &&
            !d.sourceLinks.some(linkShouldHighlight(data)) &&
            !d.targetLinks.some(linkShouldHighlight(data));
        };
      }
    /**
		Function : wrapSVGLabel
		Purpose : Wrap up SVG Label
		Created By : Rahul D.
		Added Date : 01-07-15
	*/
	function wrapSVGLabel(text, width) {
		text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1, // ems
			y = text.attr("y"),
			x = text.attr('x'),
			dy = parseFloat(text.attr("dy")),
			fontsize = text.style('font-size'),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em").style('font-size', fontsize);
			
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
		});
	}
    });
  }

  return defineComponent(SankeyComponent, withYear);
});
