function applyDefaults(defaults, overrides) {
  if (_.isPlainObject(defaults) && _.isPlainObject(overrides)) {
    return _.extend({}, defaults, overrides, applyDefaults);
  }

  return overrides;
}

function convertToMillion(num) {
    if (num!="") {
        var number=parseFloat(num);
        var prettyNumber = "";
        number = number / (1000000);
        prettyNumber = Math.round(number);
        return prettyNumber;
    }      
  }

function barChartOutcome(options) {
  
  var util_fn_for_bar = {};

  util_fn_for_bar.fmtnumber = function(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  var interactivity = {
    tooltip: d3.select('.my_tooltip'),

    mouseenter: function(d, indx) {
      var this_html = '';
      this_html ='$' + util_fn_for_bar.fmtnumber(d.amount) + ' in ' + d.measure;
      this.tooltip
        .style('display', 'block');
      this.tooltip
        .html(this_html)
        .style("left", (d3.event.pageX - 10) + 'px')
        .style("top", (d3.event.pageY - 70) + 'px');
    },

    mouseout: function() {
      this.tooltip
        .style('display', 'none');
    }
  };  
  
  function bar(g) {
      
    g.each(function (ocd, ocd_indx) {
      var g = d3.select(this);

      g.attr('transform', function (d) {
        return 'translate(0,' + y(d.measure) + ')';
      });

      var bar = g.selectAll('rect').data([g.datum().amount]);
      
      bar.enter().append('rect')
          .attr('height', y.rangeBand());
           
      //bar.attr('class', 'measure-' + ocd_indx)
      bar.attr('class', 'measure-0' )
      .transition().duration(300)
      .attr('width', x);

      if (settings.label) {
        var label = g.selectAll('text').data([convertToMillion(g.datum().amount)]),
        usd = d3.format('$,d');
        
        label.enter().append('text');
        label.attr('text-anchor', 'end')
            .attr('y', y.rangeBand() / 2)
            .attr('dy', '0.32em')
            .attr('dx', '-0.3em')
            .attr('cursor', 'default') 
            .text(function(d) { return usd(d) + 'M'; })
            ;
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
      y: {tickSize: 0}
    },
    ydomain: [],
    margin: { top: 0, right: 15, bottom: 15, left: 10 },
    colors: {},
    label: true,
    width: 200,
    height: 15,
  }, options);
  //console.log(settings);
  var width = settings.width - settings.margin.right - settings.margin.left,
    height = settings.height * settings.outcome_data.length,
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

  //console.log(settings.outcome_data)      ;

  var bars = svg.selectAll('.bar').data(settings.outcome_data);
  bars.exit().remove();
  bars.enter().append('g').attr('class', 'bar');
  bars.call(bar)
 .on('mouseover', function(d, i) { interactivity.mouseenter(d, i) })
 .on('mouseout', function() { interactivity.mouseout() })          
  ;
  if (settings.axis.x) {
    svg.append('g')
        .attr('class', 'axis-home x')
        .attr('transform', 'translate(0,'+ height + ')')
        .call(axis(_.extend({ orient: 'bottom', scale: x }, settings.axis.x)))
        ;
  }
  
  if (settings.axis.y) {
	setTimeout( function(){
		svg.append('g')
			.attr('class', 'axis-home y')
			.attr('transform', 'translate(' + (-settings.margin.left) + ',0)')
			.call(axis(_.extend({ orient: 'right', scale: y }, settings.axis.y)))
			.selectAll(".tick text")
			.call(wrap, 200);
	}, 500);
  }

  
    //.on('mouseover', function(d, i) { interactivity.mouseenter('test data') })
    //.on('mouseout', function() { interactivity.mouseout() })
    
    /*$("#outcome_details .y .tick text").on('mouseover', function(d, i) {
      //interactivity.mouseenter($(this).html());
    });
    $("#outcome_details .y .tick text").on('mouseout', function() {
        //interactivity.mouseout();
    });*/
  
    return barChartOutcome;
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, // ems
        y = text.attr("y"),
		x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");		
		
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