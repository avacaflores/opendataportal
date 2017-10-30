$(document).ready(function() {

  var util_fn = {};

  var today = new Date(),
    current_year = today.getFullYear(),
    monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

  util_fn.fmtnumber = function(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  Array.prototype.getUnique = function() {
    var u = {},
      a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
      if (u.hasOwnProperty(this[i])) {
        continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
    }
    return a;
  }

  $('.read_more').on('click', function() {
    var $this = $(this),
      $unfold = $('.unfold');

    var txt = $unfold.is(':visible') ? 'Read more' : 'Read less';

    $this.text(txt);
    $unfold.slideToggle();
  });

  $('#main-nav').stop().animate({
    'left': '0px',
  }, 1000);

  var fn = {
    load: function(dataset, action) {
      d3.json(TEMPLATE_PATH+'/json/summary/' + dataset, function(error, data) {
        return action(data);
      });
    }
  };

  // Load data for the line graphs and the lists
  fn.load('summary_total.json', function(data) {
    var current_year_dataset = data.years[data.current_year_index],
      subset_values = current_year_dataset.value;

    $('.summary_and_line_charts').find('h2').text('Summary as of ' + data.last_updated);

    //populate summary total for current year
    var $categories = $('.summary_and_line_charts .category');

    $categories.eq(0).find('h3').text('Total programme funds available in ' + current_year);
    $categories.eq(0).find('span').text('$' + util_fn.fmtnumber(subset_values.C.toFixed(0)));
    line_graph.ini(data, 'C', '.graph_c');

    $categories.eq(1).find('h3').text('Total spent for programmes in ' + current_year);
    $categories.eq(1).find('span').text('$' + util_fn.fmtnumber(subset_values.E.toFixed(0)));
    line_graph.ini(data, 'E', '.graph_e');

    populate_lists('summary_donors.json', '.list_a', '.details_a', '.count_a', current_year_dataset.num_donors, 'resource partners');
    populate_lists('summary_countries.json', '.list_b', '.details_b', '.count_b', current_year_dataset.num_countries, 'countries and regions');
    populate_lists('summary_sectors.json', '.list_c', '.details_c', '.count_c', null, 'sub-sectors');
  });

  function populate_lists(set, container, container_details, container_count, total, keyword) {
    fn.load(set, function(data) {

      var content = '',
        other = '';

      var total_money = 0;

      data.forEach(function(d, i) {
        if (d.year == current_year) {

          if (total === null) {
            total = d.top_10.length + d.other.length;
          }

          if (d.top_10) {
            d.top_10.forEach(function(t, i) {
              total_money += t.value;
            });
          }

          if (d.other) {
            var sorted = d.other.sort(function(a, b) {
              return b.value - a.value
            });
            sorted.forEach(function(t, i) {
              total_money += t.value;
            });
          }
        }
      });

      data.forEach(function(d, i) {
        if (d.year == current_year) {

          if (total === null) {
            total = d.top_10.length + d.other.length;
          }

          if (d.top_10) {
            d.top_10.forEach(function(t, i) {
              content += '<li style="border-left: 4px solid ' + t.color + '">' + t.name.replace(/-/g, ' ') + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
            });
          }

          if (d.other) {
            var sorted = d.other.sort(function(a, b) {
              return b.value - a.value
            });
            sorted.forEach(function(t, i) {
              other += '<li style="border-left: 4px solid ' + t.color + '">' + t.name.replace(/-/g, ' ') + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
            });
          }
        }
      });

      $(container).append('<ul>' + content + '<ul>');
      $(container_details).append('<ul>' + other + '<ul>');
      $(container_count).append('<span class="bold">' + total + '</span> ' + keyword + ' in ' + current_year);
    });
  }

  $('.view_full_list').on('click', function() {
    var $this = $(this),
      $text = $this.text()
    $list = $('.details');

    $text == 'expand full list' ? $this.text('collapse list') : $this.text('expand full list');
    $this.parent().find('.details').slideToggle();
  });

  var pie_chart = {

    ini: function(set, dataset, container) {

      var width = 150,
        height = 150,
        radius = Math.min(width, height) / 2;

      var rgn = ['rgb(255,255,204)', 'rgb(255,255,164)', 'rgb(255,237,160)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(252,78,42)', 'rgb(227,26,28)', 'rgb(189,0,38)', 'rgb(128,0,38)'].reverse();
      var dnr = ['rgb(211,245,222)', 'rgb(188,245,222)', 'rgb(199,234,229)', 'rgb(237,248,177)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(37,52,148)', 'rgb(8,29,88)'].reverse();

      var color = d3.scale.ordinal()
        .range(set == 'donors' ? dnr : rgn);

      var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

      var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
          return d.value;
        });

      var svg = d3.select(container).select('.pie').append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var interactivity = {
        tooltip: d3.select('.my_tooltip'),

        mouseenter: function(d, total) {

          var this_html = '';
          var date = new Date();
          var month = date.getMonth();

          this_html = '$' + util_fn.fmtnumber(d.value) + ' (' + ((d.value / total) * 100).toFixed(1) + '%)' + ' in ' + d.data.name;

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

      d3.json(TEMPLATE_PATH+'/json/summary/regions.json', function(error, regions) {

        d3.json(dataset, function(error, data) {

          var full_set = [];
          var total = 0;

          if (set == 'regions') {
            data.forEach(function(d, i) {

              d.years.forEach(function(t) {
                if (t.info.year == current_year) {

                  for (var r in regions) {
                    if (d.name == r) {
                      full_set.push({
                        name: regions[r],
                        value: t.info.value.C
                      });
                    }
                  }

                  total += t.info.value.C;
                }

              });

            });

          } else if (set == 'donors') {
            var types = [];
            //flatten the data structure + group in categories
            data.forEach(function(d, i) {
              if (d.year == current_year) {
                d.top_10.forEach(function(t) {
                  full_set.push(t);
                  types.push(t.type);
                });
                d.other.forEach(function(t) {
                  full_set.push(t);
                  types.push(t.type);
                });
              }
            });

            types = types.getUnique();

            var new_set = [];

            types.forEach(function(t) {

              var total_set = 0;

              full_set.forEach(function(d) {
                if (t == d.type) {
                  total_set += d.value;
                }
              });

              new_set.push({
                name: t,
                value: total_set
              });

              total += total_set;
            });

            full_set = new_set;
          }


          var data = full_set;

          data = data.sort(function(a, b) {
            return b.value - a.value;
          });

          var g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

          g.append("path")
            .attr("d", arc)
            .style("fill", function(d) {
              return color(d.data.name);
            })
            .on('mouseover', function(d) {
              interactivity.mouseenter(d, total);
            }).on('mouseout', function() {
              interactivity.mouseout();
            });


          var this_legend = '';

          data.forEach(function(d, i) {
            this_legend += '<div class="row"><div class="square" style="background-color:' + color(d.name) + '"></div><div class="name">' + d.name + '</div></div>'
          });


          $(container).find('.legend').append(this_legend);


        }); //datset
      }); //region name mapping

    }
  };

  pie_chart.ini('donors', TEMPLATE_PATH+"/json/summary/summary_donors.json", '.pie_chart_a');
  pie_chart.ini('regions', TEMPLATE_PATH+"/json/summary/summary_regions.json", '.pie_chart_b');

  var line_graph = {

    ini: function(dataset, measure, container) {
      var config = {
        w: 380,
        h: 150,
        margin: {
          t: 20,
          r: 10,
          b: 30,
          l: 20
        },
        axis_offset: 23,
        r: 4
      };

      config.padded = {
        w: config.w - config.margin.l - config.margin.r,
        h: config.h - config.margin.t - config.margin.b
      }

      var format_value = d3.format("s");

      var x = d3.time.scale()
        .range([config.margin.l, config.w]);

      var y = d3.scale.linear()
        .range([config.h, config.margin.t]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(6)
        .tickSize(10)
        .tickFormat(d3.format("d"));

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(3)
        .tickSize(-10)
        .tickFormat(d3.format("d"))
        .tickFormat(function(d) {
          return format_value(d).replace('G', 'B');
        });

      var line = d3.svg.line()
        .x(function(d) {
          return x(d.year);
        })
        .y(function(d) {
          return y(d.value);
        });

      var interactivity = {
        tooltip: d3.select('.my_tooltip'),

        mouseenter: function(d) {

          var this_html = '';
          var date = new Date();
          var month = date.getMonth();

          this_html = '$' + util_fn.fmtnumber(d.value.toFixed(0)) + ' <b>in ' + d.year + '</b>'; //d.year == '2014' ? '$' + util_fn.fmtnumber(d.value) + ' <b>in ' + monthNames[month] + ' ' + d.year +'</b>' :

          this.tooltip
            .style('display', 'block');

          this.tooltip
            .html(this_html)
            .style("left", (d3.event.pageX - 10) + 'px')
            .style("top", (d3.event.pageY - 50) + 'px');


        },

        mouseout: function() {

          this.tooltip
            .style('display', 'none');
        }

      };


      function data_model(dataset, measure) {
        var modified = [];
        var base = dataset.years;

        if (base) {
          base.forEach(function(d, i) {

            for (var this_value in d.value) {
              if (this_value == measure) {
                modified.push({
                  num_countries: d.num_countries,
                  num_donors: d.num_donors,
                  year: d.year,
                  value: d.value[this_value]
                });
              }
            }
          });

        }

        return modified.sort(function(a, b) {
          return a.year - b.year;
        });
      }

      var svg = d3.select(container)
        .append('svg')
        .attr({
          width: config.w + config.margin.l + config.margin.r,
          height: config.h + config.margin.t + config.margin.b
        })
        .attr('translate', 'transform(' + config.margin.l + ',' + config.margin.t + ')');

      //**************************** data ***********************************//

      var sanitized_data = data_model(dataset, measure);

      x.domain(d3.extent(sanitized_data, function(d) {
        return d.year;
      }));
      //y.domain( d3.extent(base_data, function(d) { return d.val; }) );
      //y.domain([ 0, d3.max(sanitized_data, function(d) { return d.value + config.axis_offset; }) ])
      y.domain([0, 6000000000]);

      // //**************************** draw ***********************************//

      //AXIS
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + 0 + ',' + (config.h) + ')')
        .call(xAxis)
        .selectAll("text")
        .attr("x", 8)
        .attr("dy", 10)
        .attr("text-anchor", null);

      svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + config.margin.l + ', 0)')
        .call(yAxis);



      //LINE CHART
      var line_chart = svg.append('g')
        .attr('class', 'lineChart_pod1');

      line_chart
        .append('path')
        .attr('class', 'indicator_1 prop_light_gray')
        .datum(sanitized_data)
        .attr('d', line)
        .transition()
        .duration(500)
        .ease('easeOutCubic')
        .style({
          'stroke-width': 2,
          fill: 'none',
          stroke: '#333'
        });

      //LINE CHART CIRCLES
      var dots = line_chart.append('g')
        .attr('class', 'dots')
        .selectAll('circle')
        .data(sanitized_data)
        .enter()
        .append('circle')
        .attr({
          r: 0,
          cx: function(d) {
            return x(d.year);
          },
          cy: function(d) {
            return y(d.value);
          }
        }).style({
          fill: function(d) {
            return d.year == '2014' ? '#fff' : '#222';
          },
          'stroke': '#333'
        });

      //INTERACTIONS AND ANIMATIONS
      dots
        .on('mouseenter', function(d) {

          d3.select(this).transition().duration(350).attr({
            r: 6
          });
          interactivity.mouseenter(d);

        }).on('mouseout', function() {

          d3.select(this).transition().duration(350).attr({
            r: config.r
          });
          interactivity.mouseout();

        });

      dots.transition()
        .ease('easeOutCubic')
        .duration(1000)
        .attr({
          r: function(d) {
            return config.r;
          }
        });

    }
  };
});
