'use strict';

define(function (require) {
  var _ = require('lodash');
  var d3 = require('d3');

  function applyDefaults(defaults, overrides) {
    if (_.isPlainObject(defaults) && _.isPlainObject(overrides)) {
      return _.extend({}, defaults, overrides, applyDefaults);
    }

    return overrides;
  }

  function barChart(options) {

    function bar(g) {
      g.each(function () {
        var g = d3.select(this);

        g.attr('transform', function (d) {
          return 'translate(0,' + y(d.measure) + ')';
        });

        var bar = g.selectAll('rect').data([g.datum().amount]);

        bar.enter().append('rect')
            .attr('height', y.rangeBand());

        bar.attr('class', 'measure-' + g.datum().measure)
          .transition().duration(300)
            .attr('width', x);

        if (settings.label) {
          var label = g.selectAll('text').data([g.datum().amount]),
            usd = d3.format('$,d');

          label.enter().append('text');

          label.attr('text-anchor', 'end')
              .attr('y', y.rangeBand() / 2)
              .attr('dy', '0.32em')
              .attr('dx', '-0.3em')
              .text(usd);
        } else {
          g.selectAll('text').remove();
        }
      });
    }

    function axis(options) {
      var ax = d3.svg.axis().scale(options.scale);

      if (options.hasOwnProperty('orient')) {
        ax.orient(options.orient);
      }

      if (options.hasOwnProperty('ticks')) {
        ax.ticks(options.ticks);

        if (options.hasOwnProperty('formatStr')) {
          ax.tickFormat(options.scale.tickFormat(options.ticks, options.formatStr));
        }
      }

      if (options.hasOwnProperty('tickFormat')) {
        ax.tickFormat(options.tickFormat);
      }

      if (options.hasOwnProperty('tickValues')) {
        ax.tickValues(options.tickValues);
      }

      if (options.hasOwnProperty('tickSize')) {
        ax.tickSize(options.tickSize);
      }

      return ax;
    }

    var settings = applyDefaults({
      axis: {
        x: { ticks: 3, formatStr: '$s', tickSize: 2 },
        y: true
      },
      ydomain: ['b', 'c', 'e'],
      margin: { top: 0, right: 15, bottom: 15, left: 10 },
      colors: { 'b': '#E6BD80', 'c': '#9ACD32', 'e': '#88A61B' },
      label: true,
      width: 200,
      height: 15,
    }, options);

    var width = settings.width - settings.margin.right - settings.margin.left,
      height = settings.height * settings.data.length,
      svg = d3.select(settings.el).append('svg')
          .attr('width', settings.width)
          .attr('height', height + settings.margin.top + settings.margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + settings.margin.left + ',' + settings.margin.top + ')'),
      x = d3.scale.linear()
          .domain(settings.domain)
          .range([0, width]),
      y = d3.scale.ordinal()
          .domain(settings.ydomain)
          .rangeRoundBands([0, height], 0.1);

    var bars = svg.selectAll('.bar').data(settings.data);
    bars.exit().remove();
    bars.enter().append('g').attr('class', 'bar');
    bars.call(bar);

    if (settings.axis.x) {
      svg.append('g')
          .attr('class', 'axis x')
          .attr('transform', 'translate(0,'+ height + ')')
          .call(axis(_.extend({ orient: 'bottom', scale: x }, settings.axis.x)));
    }

    if (settings.axis.y) {
      svg.append('g')
          .attr('class', 'axis y')
          .attr('transform', 'translate(' + (-settings.margin.left) + ',0)')
          .call(axis(_.extend({ orient: 'right', scale: y }, settings.axis.y)));
    }
  }

  return barChart;
});
