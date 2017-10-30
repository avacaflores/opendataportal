var fn = {
    load: function (dataset, action) {
        d3.json(TEMPLATE_PATH + '/json/summary/' + dataset, function (error, data) {
            return action(data);
        });
    }
};
var today = new Date(),
        current_year = today.getFullYear(),
        monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
var util_fn = {};
var pieChart1, pieChart2, pieChart3;
function highchartNoData() {
    /*
     Highcharts JS v4.2.1 (2015-12-21)
     Plugin for displaying a message when there is no data visible in chart.
     
     (c) 2010-2014 Highsoft AS
     Author: Oystein Moseng
     
     License: www.highcharts.com/license
     */
    (function (a) {
        typeof module === "object" && module.exports ? module.exports = a : a(Highcharts)
    })(function (a) {
        function h() {
            return!!this.points.length
        }
        function d() {
            this.hasData() ? this.hideNoData() : this.showNoData()
        }
        var e = a.seriesTypes, c = a.Chart.prototype, f = a.getOptions(), g = a.extend, i = a.each;
        g(f.lang, {noData: "No data to display"});
        f.noData = {position: {x: 0, y: 0, align: "center", verticalAlign: "middle"}, attr: {}, style: {fontWeight: "bold", fontSize: "12px", color: "#60606a"}};
        i(["pie", "gauge", "waterfall", "bubble"], function (b) {
            if (e[b])
                e[b].prototype.hasData =
                        h
        });
        a.Series.prototype.hasData = function () {
            return this.visible && this.dataMax !== void 0 && this.dataMin !== void 0
        };
        c.showNoData = function (b) {
            var a = this.options, b = b || a.lang.noData, a = a.noData;
            if (!this.noDataLabel)
                this.noDataLabel = this.renderer.label(b, 0, 0, null, null, null, a.useHTML, null, "no-data").attr(a.attr).css(a.style).add(), this.noDataLabel.align(g(this.noDataLabel.getBBox(), a.position), !1, "plotBox")
        };
        c.hideNoData = function () {
            if (this.noDataLabel)
                this.noDataLabel = this.noDataLabel.destroy()
        };
        c.hasData = function () {
            for (var a =
                    this.series, c = a.length; c--; )
                if (a[c].hasData() && !a[c].options.isInternal)
                    return!0;
            return!1
        };
        c.callbacks.push(function (b) {
            a.addEvent(b, "load", d);
            a.addEvent(b, "redraw", d)
        })
    });
}
$(document).ready(function () {

    highchartNoData();

 

    // Added by Rahul D. @13Jan16, to set default year as per client request
    if (typeof (DEFAULT_SELECTED_YEAR) != "undefined" && DEFAULT_SELECTED_YEAR != "") {
        current_year = DEFAULT_SELECTED_YEAR;
    }

    util_fn.fmtnumber = function (val) {

        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    util_fn.convertToMillion = function (num) {

        if (num != "") {
            var number = parseFloat(num);
            var prettyNumber = "";
            number = number / (1000000);
            prettyNumber = Math.round(number);

            return prettyNumber;
        }
    };


    Array.prototype.getUnique = function () {
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

    $('.read_more').on('click', function () {
        var $this = $(this),
                $unfold = $('.unfold');

        var txt = $unfold.is(':visible') ? 'Read more' : 'Read less';

        $this.text(txt);
        $unfold.slideToggle();
    });

    $('#main-nav').stop().animate({
        'left': '0px',
    }, 1000);



    // Load data for the line graphs and the lists
    fn.load('summary_total.json', function (data) {
        summaryTotalJson = data;
        // Added by Rahul D. @13Jan16, to set default year as per client request
        if (typeof (data.current_year_index) != "undefined") {
            data.current_year_index = 5;
        }

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
        //$categories.eq(2).find('h3').text('Total spent per Outcome Area in  ' + current_year); // by rahul to comment the title in twitter feed 

        line_graph.ini(data, 'E', '.graph_e');

        populate_lists('summary_donors.json', '.list_a', '.details_a', '.count_a', current_year_dataset.num_donors, 'resource partners');
        populate_lists('summary_countries.json', '.list_b', '.details_b', '.count_b', current_year_dataset.num_countries, 'countries and regions');
        populate_lists('summary_sectors.json', '.list_c', '.details_c', '.count_c', null, 'programme areas');
    });





    $('.view_full_list').on('click', function () {
        var $this = $(this),
                $text = $this.text()
        $list = $('.details');

        $text == 'expand full list' ? $this.text('collapse list') : $this.text('expand full list');
        $this.parent().find('.details').slideToggle();
    });

    var pie_chart = {
        ini: function (set, dataset, container) {

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
                    .value(function (d) {
                        return d.value;
                    });

            var svg = d3.select(container).select('.pie').append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var interactivity = {
                tooltip: d3.select('.my_tooltip'),
                mouseenter: function (d, total) {

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
                mouseout: function () {

                    this.tooltip
                            .style('display', 'none');
                }

            };

            d3.json(TEMPLATE_PATH + '/json/summary/regions.json', function (error, regions) {

                d3.json(dataset, function (error, data) {

                    var full_set = [];
                    var total = 0;

                    if (set == 'regions') {
                        data.forEach(function (d, i) {

                            d.years.forEach(function (t) {
                                if (t.info.year == current_year) {

                                    for (var r in regions) {
                                        if (d.name == r) {
                                            full_set.push({
                                                region_code: r,
                                                name: regions[r],
                                                y: t.info.value.C
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
                        //console.log(data);
                        data.forEach(function (d, i) {
                            if (d.year == current_year) {
                                d.top_10.forEach(function (t) {
                                    full_set.push(t);
                                    types.push(t.type);
                                });
                                d.other.forEach(function (t) {
                                    full_set.push(t);
                                    types.push(t.type);
                                });
                            }
                        });
                        types = types.getUnique();
                        var new_set = [];

                        types.forEach(function (t) {
                            var total_set = 0;
                            full_set.forEach(function (d) {
                                if (t == d.type) {
                                    total_set += d.value;
                                }
                            });
                            new_set.push({
                                name: t,
                                y: total_set
                            });

                            total += total_set;
                        });
                        full_set = new_set;
                    }


                    var data = full_set;
                    //console.log(data);
                    data = data.sort(function (a, b) {
                        return b.value - a.value;
                    });
                    //console.log(types);
                    //console.log(dataset);
                    //console.log(set);
                    //console.log(container);

                    if (set == 'donors')
                    {
                        //renderchart('VO2', data, 'pie', '465');
                        // 540 chrome , 520 moz 
                        var brswr = detectBrowser();
                        if (brswr == "Firefox") {
                            //renderchart('VO2', data, 'pie', '625');
                            renderchart('VO2', data, 'pie', '450');
                        } else if (brswr == "Chrome") {
                            //renderchart('VO2', data, 'pie', '650');
                            renderchart('VO2', data, 'pie', '450');
                        } else if (brswr == "Internet Explorer") {
                            //renderchart('VO2', data, 'pie', '650');
                            renderchart('VO2', data, 'pie', '450');
                        }else {
                            //renderchart('VO2', data, 'pie', '530');
                            renderchart('VO2', data, 'pie', '450');
                        }
                        

                    }
                    if (set == 'regions')
                    {
                        renderchart('VO3', data, 'pie', '465');
                    }
                    /* var g = svg.selectAll(".arc")
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
                     
                     
                     $(container).find('.legend').append(this_legend);*/


                }); //datset
            }); //region name mapping

        }
    };

    pie_chart.ini('donors', TEMPLATE_PATH + "/json/summary/summary_donors.json", '.pie_chart_a');
    pie_chart.ini('regions', TEMPLATE_PATH + "/json/summary/summary_regions.json", '.pie_chart_b');

    var line_graph = {
        ini: function (dataset, measure, container) {

            var config = {
                //w: 320,
                w: 475,
                //h: 150,
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
                    .tickFormat(function (d) {
                        return format_value(d).replace('G', 'B');
                    });

            var line = d3.svg.line()
                    .x(function (d) {
                        return x(d.year);
                    })
                    .y(function (d) {
                        return y(d.value);
                    });

            var interactivity = {
                tooltip: d3.select('.my_tooltip'),
                mouseenter: function (d) {

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
                mouseout: function () {

                    this.tooltip
                            .style('display', 'none');
                }

            };


            function data_model(dataset, measure) {

                var modified = [];
                var base = dataset.years;

                if (base) {
                    base.forEach(function (d, i) {
                        // Added by Rahul D. @13Jan16, to set default year as per client request            
                        //if (d.year != '2016') {
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
                        //}

                    });

                }

                return modified.sort(function (a, b) {
                    return a.year - b.year;
                });
            }

            //alert (config.w + config.margin.l + config.margin.r);
            var svg = d3.select(container)
                    .append('svg')
                    .attr({
                        width: config.w + config.margin.l + config.margin.r,
                        height: config.h + config.margin.t + config.margin.b
                    })
                    .attr('translate', 'transform(' + config.margin.l + ',' + config.margin.t + ')');

            /*var svg = d3.select(container)
             .append('svg')
             .attr({
             width: '320',
             height: '200'
             })
             .attr('translate', 'transform(' + config.margin.l + ',' + config.margin.t + ')');*/

            //**************************** data ***********************************//

            var sanitized_data = data_model(dataset, measure);

            x.domain(d3.extent(sanitized_data, function (d) {
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
                        cx: function (d) {
                            return x(d.year);
                        },
                        cy: function (d) {
                            return y(d.value);
                        }
                    }).style({
                fill: function (d) {
                    return d.year == current_year ? '#fff' : '#222'; // Changed By Rahul D. @15jun15, from 2014 to 2015
                },
                'stroke': '#333'
            });

            //INTERACTIONS AND ANIMATIONS
            dots
                    .on('mouseenter', function (d) {

                        d3.select(this).transition().duration(350).attr({
                            r: 6
                        });
                        interactivity.mouseenter(d);

                    }).on('mouseout', function () {

                d3.select(this).transition().duration(350).attr({
                    r: config.r
                });
                interactivity.mouseout();

            });

            dots.transition()
                    .ease('easeOutCubic')
                    .duration(1000)
                    .attr({
                        r: function (d) {
                            return config.r;
                        }
                    });

        }
    };


    /*var programme_areas_colors = {'01':'rgb(0, 106, 0)', '02':'rgb(0, 134, 0)', '03':'rgb(77, 127, 23)', '04':'rgb(107, 177, 32)', '05':'rgb(138, 228, 41)', '06':'rgb(144, 238, 144)', '07':'rgb(220, 246, 191)'};*/

    /** Method : outcome graph
     Added On : 26May15
     Added By : Rahul D.
     */
    var pie_chart_outcome = {
        ini: function (set, dataset, container) {

            var width = 150,
                    height = 150,
                    radius = Math.min(width, height) / 2;
            var otcm = ['rgb(220, 246, 191)', 'rgb(144, 238, 144)', 'rgb(138, 228, 41)', 'rgb(107, 177, 32)', 'rgb(77, 127, 23)', 'rgb(0, 134, 0)', 'rgb(0, 106, 0)'].reverse();
            var color = d3.scale.ordinal()
                    .range(otcm);
            var arc = d3.svg.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(0);

            var pie = d3.layout.pie()
                    .sort(null)
                    .value(function (d) {
                        return d.value;
                    });

            var svg = d3.select(container).select('.pie').append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var interactivity = {
                tooltip: d3.select('.my_tooltip'),
                mouseenter: function (d, total) {

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
                mouseout: function () {

                    this.tooltip
                            .style('display', 'none');
                }

            };

            d3.json(TEMPLATE_PATH + '/json/summary/outcome_area.json', function (error, outcome_areas) {

                d3.json(dataset, function (error, data) {
                    // console.log(error);
                    //console.log(data);
                    var full_set_outcome = [];
                    var total = 0;
                    var sub_set_outcome = [];
                    if (set == 'outcome_areas') {

                        data.forEach(function (d, i) {
                            if (d.year == current_year) {
                                if (typeof (d.top_10) != 'undefined' && d.top_10.length > 0) {
                                    d.top_10.forEach(function (colect, itr) {
                                        sub_set_outcome.push({
                                            code: colect.outcome_code,
                                            name: outcome_areas[colect.outcome_code],
                                            value: colect.value
                                        });
                                        total += parseFloat(colect.value);

                                    });
                                    if (typeof (d.other) != 'undefined' && d.other.length > 0) {
                                        d.other.forEach(function (colect_other, itr_other) {
                                            sub_set_outcome.push({
                                                code: colect_other.outcome_code,
                                                name: outcome_areas[colect_other.outcome_code],
                                                value: colect_other.value
                                            });
                                            total += parseFloat(colect_other.value);

                                        });
                                    }
                                }
                            }
                        });
                    }
                    if (typeof (sub_set_outcome) != 'undefined' && sub_set_outcome != "") {
                        full_set_outcome = sub_set_outcome.groupBy(function (o) {
                            return JSON.stringify({a: o.code});
                        })
                                .map(function (el) {

                                    var sum = el.group.reduce(
                                            function (l, c) {
                                                return l + parseFloat(c.value);
                                            },
                                            0
                                            );
                                    el.key.value = sum.toFixed(2);
                                    return el.key;
                                });

                        var data = full_set_outcome;
                        data = data.sort(function (a, b) {
                            return b.value - a.value;
                        });

                        //console.log(data);
                        renderchart('VO1', data, 'column', '230');
                        renderchart('VO4', data, 'pie', '465');
                        /* var g = svg.selectAll(".arc")
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
                         })
                         .on('mouseout', function() {
                         interactivity.mouseout();
                         })
                         .on('click', function(cur_sec) {
                         outComePopUp(cur_sec);
                         })
                         .attr('cursor', 'pointer') 
                         ;
                         var this_legend_outcome = '';
                         data.forEach(function(d, i) {
                         this_legend_outcome += '<div class="row-outcome"><div class="square-outcome" style="background-color:' + color(d.name) + '"></div><div class="name">' + d.name + '</div></div>'
                         });
                         $(container).find('.legend').append(this_legend_outcome);*/
                    } else {
                        var img_path = TEMPLATE_PATH + '/assets/pie-nodata.png';
                        $(container).html("<img src='" + img_path + "' style='margin-top: 25%;' alt='No outcome available' />");
                    }
                }); //datset
            }); //region name mapping
        }
    };   // outcome graph end
    pie_chart_outcome.ini('outcome_areas', TEMPLATE_PATH + "/json/summary/summary_sectors.json", '.pie_chart_outcome_a');



    /**
     Function :showDonorProgInfo
     Purpose : showDonorProgInfo
     Added By : Rahul D.
     Added Date : 13Jul15
     */
    function showDonorProgInfo(target, flag) {
        $.get(TEMPLATE_PATH + '/js/template/' + target, function (res_data) {
            if (flag == 'donor') {
                $('.donor.info').append(res_data);
            }
            if (flag == 'expense') {
                $('.sector.info').append($(res_data).data('placement', 'left'));
            }
            $('.info a').popover();
        });
    }
    showDonorProgInfo('donor-info.html', 'donor');
    showDonorProgInfo('expense-info.html', 'expense');

    /**
     Function :groupBy
     Purpose : group by an array
     Added By : Rahul D.
     Added Date : 29May15
     */
    Array.prototype.groupBy = function (hash) {
        var _hash = hash ? hash : function (o) {
            return o;
        };
        var _map = {};
        var put = function (map, key, value) {
            if (!map[_hash(key)]) {
                map[_hash(key)] = {};
                map[_hash(key)].group = [];
                map[_hash(key)].key = key;
            }
            map[_hash(key)].group.push(value);
        }
        this.map(function (obj) {
            put(_map, obj, obj);
        });
        return Object.keys(_map).map(function (key) {
            return {key: _map[key].key, group: _map[key].group};
        });
    }

});

/**
 Function :jumpToMapping
 Purpose : jump to map page with refine results
 Added By : Rahul D.
 Added Date : 16July15
 */
function jumpToMapping(target, currObj) {
    //console.log(target);
    if (typeof (SITE_BASE_URL) != 'undefined') {
        // added code by rahul to go fund page  on click of resource partners
        if (target == 3) {
            var title = currObj.getAttribute('dname') != 'undefined' ? currObj.getAttribute('dname') : "";
            //var counval = $('#country_search_id').val();
            var jump = SITE_BASE_URL + '/map?k=donor&q=' + urlEncoder(title);
            window.open(jump, '_blank');
        }
        if (target == 2) {
            var title = currObj.getAttribute('pname') != 'undefined' ? currObj.getAttribute('pname') : "";
            var jump = SITE_BASE_URL + '/map?k=programme&q=' + urlEncoder(title);
            window.open(jump, '_blank');
        }
        if (target == 1) {
            var title = currObj.getAttribute('cname') != 'undefined' ? currObj.getAttribute('cname') : "";
            var jump = SITE_BASE_URL + '/map?k=country&q=' + urlEncoder(title);
            window.open(jump, '_blank');
        }
    }
}

/**
 Function :jumpToMappingForPieChart
 Purpose : jump to map page with refine results for pie chart bar chart
 Added By : Vijay Purohit.
 Added Date : 25Aug16
 */
function jumpToMappingForPieChart(target, title) {
    //console.log(target);
    if (typeof (SITE_BASE_URL) != 'undefined') {
        // added code by vijay to go fund page  on click of resource partners
        if (target == 3) {
            var jump = SITE_BASE_URL + '/map?k=donor&q=' + urlEncoder(title);
            window.open(jump, '_blank');
        }
        if (target == 2) {            
            var jump = SITE_BASE_URL + '/map?k=programme&q=' + urlEncoder(title);
            window.open(jump, '_blank');
        }
        if (target == 1) {            
            var jump = SITE_BASE_URL + '/map?k=country&q=' + urlEncoder(title);
            window.open(jump, '_blank');
        }
    }
}


/**
 Function :urlEncoder
 Purpose : Clean url, spacially for IE
 Added By : Rahul D.
 Added Date : 16July15
 */
function urlEncoder(str) {
    str = (str + '')
            .toString();
    return encodeURI(str)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/&/g, '%26')
            .replace(/\*/g, '%2A')
            .replace(/#/g, '%23')
            .replace(/%20/g, '+');
}

function renderchart(id, data, chartType, chartHeight)
{

    var chart_categories = [];
    var chart_series = [];
    var chart_codes = [];

    switch (id)
    {

        case 'VO1' :

            for (var i = 0; i < data.length; i++)
            {
                all_categories = data[i].name;
                all_series = JSON.parse(data[i].value);
                codes = data[i].code;
                chart_categories.push(all_categories);
                chart_series.push(all_series);
                chart_codes.push({'code': codes, 'name': all_categories});
            }



            $('#' + id).highcharts({
                title: {
                    text: null,
                    style: {
                        color: '#7B7B8F',
                        fontWeight: 'normal',
                        fontSize: '15px'
                    }
                },
                subtitle: {
                    text: null,
                    //y:30,
                    style: {
                        color: '#7B7B8F',
                        fontWeight: 'normal',
                        fontSize: '13px'
                    }
                },
                chart: {
                    type: chartType,
                    height: chartHeight,
                    marginTop: 10,
                    marginRight: 14,
                    width: '328'
                            //margin: [5, 2, 2, 2], // top, right, bottom, left

                },
                xAxis: {
                    categories: chart_categories,
                    lineWidth: 0.5,
                    lineColor: '#e4e4e4',
                    tickWidth: 0.5,
                    tickColor: '#e4e4e4',
                    labels: {
                        step: 1,
                        enabled: true,
                        tickWidth: 0,
                        rotation: 270,
                        formatter: function () {
                            //console.log(this);
                            return this.value.replace(/ /g, '<br />');
                        },
                        align: null,
                        useHTML: false,
                        style: {
                            color: '#656565',
                            fontWeight: 'normal',
                            fontSize: '11px'
                        }
                    },
                },
                yAxis: {
                    min: null,
                    max: null,
                    title: {
                        text: null
                    },
                    labels: {
                        style: {
                            color: '#656565',
                            fontWeight: 'normal',
                            fontSize: '11px'
                        },
                        enabled: true,
                        formatter: function () {
                            var ret = Math.floor(this.value / 1000000);
                            return ret + "M";
                        },
                    },
                    gridLineInterpolation: null,
                    endOnTick: true,
                    startOnTick: false,
                    maxPadding: 0,
                    gridLineWidth: 1,
                    lineWidth: 0.5,
                    lineColor: '#e4e4e4',
                    gridLineColor: '#dadad8',
                    gridLineDashStyle: 'Dot',
                    tickWidth: 0.5,
                    tickColor: '#e4e4e4'
                },
                tooltip: {
                    formatter: function ()
                    {
                        return '$' + Highcharts.numberFormat(this.y, 0, ',', ',') + ' in ' + this.key;

                    }
                },
                legend: {
                    enabled: false,
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                        },
                        pointWidth: 20,
                        point: {
                            events: {
                                click: function (event) {
                                    var selected_cat = this.category;
                                    $.each(chart_codes, function (j, k) {
                                        if (k.name == selected_cat) {
                                            cur_sec = k.code;
                                            currSec_name = k.name;
                                        }
                                    });
                                    //console.log(cur_sec+"-----"+currSec_name);
                                    outComePopUp('VO1', cur_sec, currSec_name);
                                }
                            }
                        },
                    }
                },
                colors: ['#9BBB58'],
                series: [{
                        data: chart_series
                    }]

            });
            break;
        case 'VO2' :
            //console.log("data");
            //console.log(data);
            var colorArr = ['#ffffff', '#e5e5ff', '#ccccff', '#b3b3ff', /*forced colors*/ '#6666ff', '#4d4dff', '#3333ff', '#1a1aff',
                '#0000ff', '#0000e6', '#0000cc', /*forced colors*/, '#9999ff', '#8080ff',
                '#7FCDBB', '#C7E9B4', '#EDF8B1', '#C7EAE5', '#0000b3'
                        , '#000080', '#00004d' /*,'#000033','#00001a'*/];
            colorArr.reverse(); // for cross browser pie chart color similarity
            data.sort(sortFunction); // for cross browser pie chart color similarity


            for (var j = 0; j < data.length; j++) {
                //console.log(data[j]);
                if (data[j].y < 1000) {
                    data.splice(j, 1);
                }
            }

            // console.log(data);
            for (var i = 0; i < data.length; i++)
            {
                data[i].color = colorArr[i];
                all_categories = data[i].name;
                chart_categories.push(all_categories);

            }

            pieChart1 = $('#' + id).highcharts({
                title: {
                    text: null,
                    style: {
                        color: '#7B7B8F',
                        fontWeight: 'normal',
                        fontSize: '15px'
                    }
                },
                subtitle: {
                    text: null,
                    //y:30,
                },
                chart: {
                    type: chartType,
                    height: chartHeight,
                    //height: 197,
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0,
                        depth: 70,
                    },
                    marginTop: -20,
                    marginRight: 0
                            //margin: [-70, 2, 2, 2], // top, right, bottom, left

                },
                labels: {items: []},
                xAxis: {
                    lineWidth: 0.5,
                    lineColor: '#e4e4e4',
                    tickWidth: 0.5,
                    tickColor: '#e4e4e4',
                },
                yAxis: {
                    gridLineInterpolation: null,
                    endOnTick: true,
                    startOnTick: false,
                    maxPadding: 0,
                    gridLineWidth: 1,
                    lineWidth: 0.5,
                    lineColor: '#e4e4e4',
                    gridLineColor: '#dadad8',
                    gridLineDashStyle: 'Dot',
                    tickWidth: 0.5,
                    tickColor: '#e4e4e4'
                },
                tooltip: {
                    formatter: function ()
                    {

                        if (this.key.length > 10)
                        {
                            // return '$'+Highcharts.numberFormat(this.y, 0,',',',')+' ('+Highcharts.numberFormat(this.percentage, 2)+'%) in '+this.key ;
                            return "<div style='width: 150px; white-space:normal;'>" + '$' + Highcharts.numberFormat(this.y, 0, ',', ',') + ' (' + Highcharts.numberFormat(this.percentage, 2) + '%) in ' + this.key + ' </div>';
                        }
                        else
                        {

                            return '$' + Highcharts.numberFormat(this.y, 0, ',', ',') + ' (' + Highcharts.numberFormat(this.percentage, 2) + '%) in ' + this.key;
                            //return this.key+': '+'<b> $'+Highcharts.numberFormat(this.y, 0,',',',')+'</b>';

                        }
                    }
                    /*{
                     //	console.log(this);
                     return '$'+Highcharts.numberFormat(this.y, 0,',',',')+' ('+Highcharts.numberFormat(this.percentage, 2)+'%) in '+this.key ;
                     //return this.key+': '+'<b> $'+Highcharts.numberFormat(this.y, 0,',',',')+'</b>';
                     
                     }*/
                },
                legend: {
                    enabled: true,
                    align: 'center',
                    x: null,
                    y: 14,
                    verticalAlign: 'bottom',
                    layout: 'vertical',
                    itemStyle: {
                        fontWeight: 'normal'
                    },
                    symbolWidth: 10,
                    symbolHeight: 10
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        depth: 30,
                        startAngle: 0,
                        dataLabels: {
                            enabled: false,
                        },
                        showInLegend: true,
                        center: [],
                        size: '100%'

                    },
                    series: {
                        //slicedOffset : 0,
                        cursor: 'pointer',
                        states: {
                            hover: {
                                enabled: false
                            }
                        },
                        point: {
                            events: {
                                legendItemClick: function (e) {
                                    //handlingPie1LegendClick(this); // client tmp disable
                                    return false; // <== returning false will cancel the default action by rahul 28july2016
                                },
                                mouseOver: function () {
                                    this.options.oldColor = this.color;
                                    this.graphic.attr("fill", "#8cdfff");
                                },
                                mouseOut: function () {
                                    this.graphic.attr("fill", this.options.oldColor);
                                },
                                click: function (event) {
                                    //closeAllOtherSlices(['VO2','VO3', 'VO4']);
                                    //if( $("#VO2_PreIndex").val() != this.index ){
                                    //bubble_chart_pop_up('VO2', this.name); // client tmp disable
                                    $("#VO2_PreIndex").val(this.index);
                                    //} else{
                                        //closeAllOtherSlices(['VO2']);
                                      //  $("#VO2_PreIndex").val(-1);
                                        //this.slice(false);
                                    //    console.log(this);
                                        //console.log(this.name);
                                        
                                    //}
                                    return false;
                                    //	moneycomes_Popup('VO2',this.name);
                                    
                                     
                                }
                            }
                        },
                    }
                },
                colors: ['#0430aa', '#1430e7', '#2876d5', '#5694e0', '#97c0f3', '#b0cff6', '#d2e3f8', '#18c099', '#32d6b0', '#4ae6c2', '#a6eddd', '#c7e9b4', '#def3d2', '#d7d9eb', '#2695a2', '#2fbfd0', '#72e4f2', '#9ad7df', '#c8f3f8', '#e4fafc'],
                series: [{
                        data: data
                    }]

            });
            break;
        case 'VO3' :
            //console.log(data);
            for (var i = 0; i < data.length; i++)
            {

                all_categories = data[i].name;
                chart_categories.push(all_categories);

            }
            data.sort(sortFunction);
            pieChart2 = $('#' + id).highcharts({
                title: {
                    text: null,
                    style: {
                        color: '#7B7B8F',
                        fontWeight: 'normal',
                        fontSize: '15px'
                    }
                },
                subtitle: {
                    text: null,
                    //y:30,

                },
                chart: {
                    type: chartType,
                    height: chartHeight,
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0,
                        depth: 70,
                    },
                    marginTop: -20,
                    marginRight: 0,
                    marginLeft: 10,
                    //marginBottom: 35
                    //margin: [-70, 2, 2, 2], // top, right, bottom, left

                },
                labels: {items: []},
                xAxis: {
                    lineWidth: 0.5,
                    lineColor: '#e4e4e4',
                    tickWidth: 0.5,
                    tickColor: '#e4e4e4',
                },
                yAxis: {
                    gridLineInterpolation: null,
                    endOnTick: true,
                    startOnTick: false,
                    maxPadding: 0,
                    gridLineWidth: 1,
                    lineWidth: 0.5,
                    lineColor: '#e4e4e4',
                    gridLineColor: '#dadad8',
                    gridLineDashStyle: 'Dot',
                    tickWidth: 0.5,
                    tickColor: '#e4e4e4'
                },
                tooltip: {
                    useHTML: true,
                    formatter: function ()
                    {
                        if (this.key.length > 20)
                        {

                            // return '$'+Highcharts.numberFormat(this.y, 0,',',',')+' ('+Highcharts.numberFormat(this.percentage, 2)+'%) in '+this.key ;
                            return "<div style='width: 290px; white-space:normal;'>" + '$' + Highcharts.numberFormat(this.y, 0, ',', ',') + ' (' + Highcharts.numberFormat(this.percentage, 2) + '%) in ' + this.key + ' </div>';
                        }
                        else
                        {

                            return '$' + Highcharts.numberFormat(this.y, 0, ',', ',') + ' (' + Highcharts.numberFormat(this.percentage, 2) + '%) in ' + this.key;
                            //return this.key+': '+'<b> $'+Highcharts.numberFormat(this.y, 0,',',',')+'</b>';

                        }
                    }
                },
                legend: {
                    enabled: true,
                    align: 'center',
                    x: null, //90,
                    y: -30,
                    verticalAlign: 'bottom',
                    layout: 'vertical',
                    //margin: 35,
                    itemStyle: {
                        fontWeight: 'normal',
                        width: 230
                    },
                    symbolWidth: 10,
                    symbolHeight: 10,
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        depth: 30,
                        dataLabels: {
                            enabled: false,
                        },
                        showInLegend: true,
                        center: [],
                        size: '100%'
                    },
                    series: {
                        cursor: 'pointer',
                        states: {
                            hover: {
                                enabled: false
                            }
                        },
                        point: {
                            events: {
                                legendItemClick: function (e) {
                                    handlingPie2LegendClick(this);
                                    return false; // <== returning false will cancel the default action by rahul 28july2016
                                },
                                mouseOver: function () {
                                    this.options.oldColor = this.color;
                                    this.graphic.attr("fill", "#8cdfff");
                                },
                                mouseOut: function () {
                                    this.graphic.attr("fill", this.options.oldColor);
                                },
                                click: function (event) {
                                    var sec_name = this.name;
                                     
                                    //closeAllOtherSlices(['VO3','VO2', 'VO4']);
                                    switch (sec_name)
                                    {
                                        case "Central and Eastern Europe and the Commonwealth of the Independent States":
                                            sec_type = 'CEE_CIS';
                                            break;
                                        case "East Asia and the Pacific":
                                            sec_type = 'EAPR';
                                            break;
                                        case "Eastern and Southern Africa":
                                            sec_type = 'ESAR';
                                            break;
                                        case "Latin America and the Caribbean":
                                            sec_type = 'LACR';
                                            break;
                                        case "Middle East and North Africa":
                                            sec_type = 'MENA';
                                            break;
                                        case "South Asia":
                                            sec_type = 'ROSA';
                                            break;
                                        case "West and Central Africa":
                                            sec_type = 'WCAR';
                                            break;
                                        case "Europe and Central Asia":
                                            sec_type = 'ECAR';
                                            break;


                                    }
                                    ;
                                     

                                    //if( chart.series[0].data[currentI].sliced){
                                    //bubble_chart_pop_up('VO3', sec_type, sec_name);
                                    //if( $("#VO3_PreIndex").val() != this.index ){
                                        money_go_out_popup('VO3', sec_type, sec_name);
                                        $("#VO3_PreIndex").val(this.index);
                                    //}else{
                                      //  $("#VO3_PreIndex").val(-1);
                                    //}
                                    
                                    
                                    //}
                                    return false;
                                }
                            }
                        },
                    }
                },
                //colors: ['#800026', '#BD0026', '#E31A1C', '#FC4E2A', '#FD8D3C', '#FEB24C', '#FED976'],
                //colors: ['#ffffff','#ffebe5','#ffd6cc','#ffc2b3','#ffad99','#ff9980','#ff8566','#ff704d','#ff5c33','#ff471a','#ff3300','#e62e00','#cc2900','#b32400','#991f00','#801a00','#661400','#4d0f00','#330a00','#1a0500'],
                colors: ['#ffebe5', '#ffc2b3', '#ff9980', '#ff704d', '#ff471a', '#e62e00', '#b32400', '#801a00', /*'#4d0f00', '#1a0500'*/].reverse(),
                series: [{
                        data: data
                    }]

            });


            break;

        case 'VO4' :
            //console.log("data");
            //console.log(data);
            for (var i = 0; i < data.length; i++)
            {
                all_series = JSON.parse(data[i].value);
                all_categories = data[i].name;
                codes = data[i].code;
                chart_categories.push(all_categories);
                //chart_series.push([all_categories, all_series, codes]);
                chart_series.push({'name': all_categories, 'y': all_series, 'code': codes});
                chart_codes.push({'code': codes, 'name': all_categories});
            }
            data.sort(sortFunction);
            pieChart3 = $('#' + id).highcharts({
                title: {
                    text: null,
                    style: {
                        color: '#7B7B8F',
                        fontWeight: 'normal',
                        fontSize: '15px'
                    }
                },
                subtitle: {
                    text: null,
                    //y:30,

                },
                chart: {
                    type: chartType,
                    height: chartHeight,
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0,
                        depth: 70,
                    },
                    marginTop: -20,
                    marginRight: 0,
                    marginLeft: 10,
                    //margin: [-70, 2, 2, 2], // top, right, bottom, left

                },
                labels: {items: []},
                xAxis: {
                    lineWidth: 0.5,
                    lineColor: '#e4e4e4',
                    tickWidth: 0.5,
                    tickColor: '#e4e4e4',
                },
                yAxis: {
                    gridLineInterpolation: null,
                    endOnTick: true,
                    startOnTick: false,
                    maxPadding: 0,
                    gridLineWidth: 1,
                    lineWidth: 0.5,
                    lineColor: '#e4e4e4',
                    gridLineColor: '#dadad8',
                    gridLineDashStyle: 'Dot',
                    tickWidth: 0.5,
                    tickColor: '#e4e4e4'
                },
                tooltip: {
                    formatter: function ()
                    {
                        if (this.key.length > 20)
                        {

                            // return '$'+Highcharts.numberFormat(this.y, 0,',',',')+' ('+Highcharts.numberFormat(this.percentage, 2)+'%) in '+this.key ;
                            return "<div style='width: 290px; white-space:normal;'>" + '$' + Highcharts.numberFormat(this.y, 0, ',', ',') + ' (' + Highcharts.numberFormat(this.percentage, 2) + '%) in ' + this.key + ' </div>';
                        }
                        else
                        {

                            return '$' + Highcharts.numberFormat(this.y, 0, ',', ',') + ' (' + Highcharts.numberFormat(this.percentage, 2) + '%) in ' + this.key;
                            //return this.key+': '+'<b> $'+Highcharts.numberFormat(this.y, 0,',',',')+'</b>';

                        }
                        //return '$'+Highcharts.numberFormat(this.y, 0,',',',')+' in '+this.key ;
                        //return this.key+': '+'<b> $'+Highcharts.numberFormat(this.y, 0,',',',')+'</b>';

                    }
                },
                legend: {
                    enabled: true,
                    align: 'center',
                    x: null, //90,
                    y: -60,
                    verticalAlign: 'bottom',
                    layout: 'vertical',
                    itemStyle: {
                        fontWeight: 'normal',
                        width: 230
                    },
                    symbolWidth: 10,
                    symbolHeight: 10,
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        depth: 30,
                        dataLabels: {
                            enabled: false,
                        },
                        showInLegend: true,
                        center: [],
                        size: '100%'
                    },
                    series: {
                        cursor: 'pointer',
                        states: {
                            hover: {
                                enabled: false
                            }
                        },
                        point: {
                            events: {
                                legendItemClick: function (e) {
                                    handlingPie3LegendClick(this);
                                    return false; // <== returning false will cancel the default action by rahul 28july2016
                                },
                                mouseOver: function () {
                                    this.options.oldColor = this.color;
                                    this.graphic.attr("fill", "#8cdfff");
                                },
                                mouseOut: function () {
                                    this.graphic.attr("fill", this.options.oldColor);
                                },
                                click: function (event) {
                                    //closeAllOtherSlices(['VO2', 'VO3']);
                                    //if( chart.series[0].data[currentI].sliced){
                                    // bubble_chart_pop_up('VO4', cur_sec, currSec_name);
                                    //}
                                    //if( $("#VO4_PreIndex").val() != this.index ){
                                        outComePopUp('VO4', this.code, this.name);
                                        $("#VO4_PreIndex").val(this.index);
                                    //}else{
                                    //    $("#VO4_PreIndex").val(-1);
                                    //}
                                    
                                    return false;
                                }
                            }
                        },
                    }
                },
                //colors: ['#4E7F16', '#6D9D37', '#588B1F', '#6CB120', '#8AE42A', '#90EE90', '#DDF6BF'],
                colors: ['#40bf40', '#39ac39', '#339933', '#2d862d', '#267326', '#206020', '#1a4c1a', '#133913'/*,'#0d260d','#061306'*/].reverse(),
                series: [{
                        data: chart_series//data
                    }]

            });
            break;


    }

    disablemouseEventForallPielegends();
}

/**
 Function :outComePopUp
 Purpose : Pop up will open on click of Expenditure per Outcome' graph
 Added By : Rahul D.
 Added Date : 29May15
 */

function outComePopUp(chart_name, currSec, currSec_name) {

    if (currSec != "") {
        var data_collection = [];
        var data_collection_name = [];
        var data_collection_amount = [];
        var today = new Date(),
                current_year = today.getFullYear(),
                monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

        // Added by Rahul D. @13Jan16, to set default year as per client request
        if (typeof (DEFAULT_SELECTED_YEAR) != "undefined" && DEFAULT_SELECTED_YEAR != "") {
            current_year = DEFAULT_SELECTED_YEAR;
        }

        if (chart_name == 'VO1')
        {
            var json_path = TEMPLATE_PATH + '/json/summary/summary_sectors.json';
            $('#outcome_details').find('.modal-title').html(current_year + ' Expenditure by Programme Area');
        }

        if (chart_name == 'VO4')
        {
            var json_path = TEMPLATE_PATH + '/json/summary/summary_sectors.json';
            $('#outcome_details').find('.modal-title').html(current_year + ' Expenditure by Programme Area');
        }





        $('#modal-body').html(null);

        $.ajax({
            url: json_path,
            dataType: 'json',
            success: function (data) {
                data.forEach(function (d, i) {
                    if (d.year == current_year) {
                        if (typeof (d.top_10) != 'undefined' && d.top_10.length > 0) {
                            d.top_10.forEach(function (colect, itr) {

                                if (colect.outcome_code == currSec) {
                                    data_collection.push({
                                        measure: colect.name,
                                        amount: parseInt(colect.value.toFixed(0))
                                                //amount : util_fn.convertToMillion(colect.value)
                                    });
                                    data_collection_amount.push(parseInt(colect.value.toFixed(0)));
                                    data_collection_name.push(colect.name);
                                    //  console.log(data_collection_amount);
                                    //  console.log(data_collection_name);
                                }
                            });
                            if (typeof (d.other) != 'undefined' && d.other.length > 0) {
                                d.other.forEach(function (colect_other, itr_other) {
                                    if (colect_other.outcome_code == currSec) {
                                        data_collection.push({
                                            measure: colect_other.name,
                                            amount: parseInt(colect_other.value.toFixed(0))
                                                    //amount : util_fn.convertToMillion(colect_other.value)
                                        });
                                        data_collection_amount.push(parseInt(colect_other.value.toFixed(0)));
                                        data_collection_name.push(colect_other.name);
                                    }
                                });
                            }
                        }
                    }
                });

                if (typeof (data_collection) != 'undefined' && data_collection != "") {
                    $(".outcome_title").html(currSec_name);
                    //console.log(data_collection);
                    
                    $("#barpopupspan").html("");
                    /*$("#barpopupspan").html("<a href='javascript:void(0)' onclick='piechartClose(\"VO4\")'>Expand All</a>");
                    
                    data_collection_amount = data_collection_amount.slice(0, 10);
                    data_collection_name = data_collection_name.slice(0, 10);
                    data_collection = data_collection.slice(0, 10);*/
                    
                    barChartOutcome({ 
                        el: $('.bar_chart_outcome').empty()[0],
                        domain: [0, Math.max.apply(Math, data_collection_amount)],
                        width: 540,
                        height: 40,
                        margin: {top: 0, right: 8, bottom: 15, left: 250},
                        ydomain: data_collection_name,
                        /*
                         axis: {
                         y: { tickSize: 0, tickFormat: function (d, indx) {
                         //return d.length>18 ? d.substr(0, 18)+'...' : d;
                         return d;
                         }
                         }
                         },
                         */
                        outcome_data: data_collection
                    });
                    //$(".bar_chart_outcome svg").attr('height', '240');
                    //console.log("pie_c");
                    barchartLegendClickEvent("c", 2);
                }
            },
            error: function (data) {
            }
        });
    }

    $('#outcome_details').modal('show');
}

function bubble_chart_pop_up(chart_name, sec_type, currSec_name)
{
    if (sec_type != "") {

        var data_collection = [];
        var data_collection_name = [];
        var data_collection_amount = [];
        var today = new Date(),
                current_year = today.getFullYear(),
                monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
        if (chart_name == 'VO2')
        {
            var json_path = TEMPLATE_PATH + '/json/summary/summary_donors.json';
        }

        $('#outcome_details').find('.modal-title').html(current_year + ' Programme Budget Allocation by Resource Partner');
        $.ajax({
            url: json_path,
            dataType: 'json',
            async: false,
            success: function (data) {

                data.forEach(function (d, i) {
                    if (d.year == current_year) {
                        if (typeof (d.top_10) != 'undefined' && d.top_10.length > 0) {
                            d.top_10.forEach(function (colect, itr) {

                                if (colect.type == sec_type) {
                                    data_collection.push({
                                        type: colect.type,
                                        measure: colect.name,
                                        amount: parseInt(colect.value.toFixed(0))
                                                //amount : util_fn.convertToMillion(colect.value)
                                    });
                                    data_collection_amount.push(parseInt(colect.value.toFixed(0)));
                                    data_collection_name.push(colect.name);
                                }

                            });
                             
                            if (typeof (d.other) != 'undefined' && d.other.length > 0) {
                                d.other.forEach(function (colect_other, itr_other) {
                                    if (colect_other.type == sec_type) {
                                        data_collection.push({
                                            type: colect_other.type,
                                            measure: colect_other.name,
                                            amount: parseInt(colect_other.value.toFixed(0))
                                                    //amount : util_fn.convertToMillion(colect_other.value)
                                        });
                                        data_collection_amount.push(parseInt(colect_other.value.toFixed(0)));
                                        data_collection_name.push(colect_other.name);
                                    }

                                });
                            }

                        }
                    }

                });
                if (typeof (data_collection) != 'undefined' && data_collection != "") {
                    $('#modal-body').html(null);
                    $('.outcome_title').html(null);
                    if ($.trim(currSec_name)){
                        $('.outcome_title').html(currSec_name);
                    }else{
                        $('.outcome_title').html(sec_type);
                    }
                    $("#barpopupspan").html("");
                    $("#barpopupspan").html("<a href='javascript:void(0)' onclick='piechartClose(\"VO2\")'>Expand All</a>");
                    
                    data_collection_amount = data_collection_amount.slice(0, 10);
                    data_collection_name = data_collection_name.slice(0, 10);
                    data_collection = data_collection.slice(0, 10);
                    
                    //console.log(data_collection_amount);
                    //console.log(data_collection_name);
                    //console.log(data_collection);
                    
                    barChartOutcome({
                        el: $('.bar_chart_outcome').empty()[0],
                        domain: [0, Math.max.apply(Math, data_collection_amount)],
                        width: 540,
                        height: 40,                            
                        margin: {top: 0, right: 8, bottom: 15, left: 250},
                        ydomain: data_collection_name,
                        outcome_data: data_collection
                    });
                    //console.log("pie_a");
                    
                    
                    
                    barchartLegendClickEvent("a", 3);
                     
                }

            },
            error: function (data) {
            }
        });
    }

    $('#outcome_details').modal('show');
    /*$('#outcome_details').on('hidden.bs.modal', function (e) {
        alert("ssss")
    });*/

}

function money_go_out_popup(chart_name, sec_type, currSec_name) { //function for money goout popup by rahul ranjan

    if (sec_type != "") {
        var data_collection = [];
        var data_collection_name = [];
        var data_collection_amount = [];
        var today = new Date(),
                current_year = today.getFullYear(),
                monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

                 
        var json_path = TEMPLATE_PATH + '/json/summary/summary_regions.json';
        $('#outcome_details').find('.modal-title').html(current_year + ' Programme Budget Allocation by Country');

        $.ajax({
            url: json_path,
            dataType: 'json',
            async: false,
            success: function (data) {
                 
                data.forEach(function (d, i) {
                    if (d.name == sec_type)
                    {

                        d.years.forEach(function (colect, itr) {

                            //if (typeof(colect.info.year) != "undefined" && colect.info.year.length > 0) {

                            if (colect.info.year == current_year)
                            {

                                //data_collection = colect.countries_list;
                                var sorted = colect.countries_list.sort(function (a, b) {
                                    return b.value - a.value
                                });
                                sorted.forEach(function (i_inner, j) {

                                    data_collection.push({
                                        measure: i_inner.name,
                                        amount: parseInt(i_inner.value.toFixed(0))
                                    });
                                    data_collection_amount.push(parseInt(i_inner.value.toFixed(0)));
                                    data_collection_name.push(i_inner.name);
                                });
                            }
                            //}

                        });

                    }
                });

                if (typeof (data_collection) != 'undefined' && data_collection != "") {

                    $(".outcome_title").html(currSec_name);
                    
                    $("#barpopupspan").html("");
                    /*$("#barpopupspan").html("<a href='javascript:void(0)' onclick='piechartClose(\"VO3\")' >Expand All</a>");
                    
                    data_collection_amount = data_collection_amount.slice(0, 10);
                    data_collection_name = data_collection_name.slice(0, 10);
                    data_collection = data_collection.slice(0, 10);*/
                    //console.log(data_collection_amount);
                    //console.log(data_collection_name);
                    //console.log(data_collection);
                    
                    barChartExpenditureByCountryRegions({
                        el: $('.bar_chart_outcome').empty()[0],
                        domain: [0, Math.max.apply(Math, data_collection_amount)],
                        width: 450,
                        height: 40,
                        margin: {top: 0, right: 8, bottom: 15, left: 250},
                        ydomain: data_collection_name,
                        outcome_data: data_collection
                    });
                    //$(".bar_chart_outcome svg").attr('height', '240');
                    //console.log("pie_b");
                    barchartLegendClickEvent("b",1);
                }
            },
            error: function (data) {
            }
        });
    }

    $('#outcome_details').modal('show');

}


function processData(data) {

    var obj = data;
    //var obj = data.countries_msg_vol;
    var newDataSet = [];

    for (var prop in obj) {
        if (obj[prop].name)
        {
            newDataSet.push({name: obj[prop].name, className: obj[prop].name.toLowerCase(), size: obj[prop].y});
        }
        //  newDataSet.push({name: prop, className: prop.toLowerCase(), size: obj[prop]});
    }
    //console.log(newDataSet);
    return {children: newDataSet};
}

function closeAllOtherSlices(closingSliceArr) {
    /* This function is used for closing all opened slices
     * of other pie charts,  closingSliceArr represents id of all other
     * pie chart rendering divs
     */
    for (var i = 0; i < closingSliceArr.length; i++) {
        
        var currentChart = $('#' + closingSliceArr[i]).highcharts();
        for (var j = 0; j < currentChart.series[0].data.length; j++) {
            var currentSlice = currentChart.series[0].data[j];
            if (currentSlice.sliced) {
                currentSlice.slice(); // closing slice again
            }
        }
        $('#' + closingSliceArr[i]+'_PreIndex').val(-1);
        
    }
}

function sortFunction(a, b) {
    //console.log(a);
    /*a.name = a.name.toLowerCase();
     b.name = b.name.toLowerCase();
     
     a.name = a.name.charAt(0).toUpperCase() + a.name.slice(1);
     b.name = b.name.charAt(0).toUpperCase() + b.name.slice(1);
     */
    if (a.y === b.y) {
        return 0;
    }
    else {
        return (a.y < b.y) ? 1 : -1;
    }
}

/**
 Function :setCountDivsPostn
 Purpose : setting count divs (a,b,c) horizontally aligned with each other 
 Added By : Vijay Purohit.
 Added Date : 05Dec2015
 */
function setCountDivsPostn() {
    var a = $(".count_a").offset();
    var b = $(".count_b").offset();
    var c = $(".count_c").offset();
    aTp = parseInt(a.top);
    bTp = parseInt(b.top);
    cTp = parseInt(c.top);
    var greatest = (aTp >= bTp ? aTp >= cTp ? aTp : cTp : bTp >= cTp ? bTp : cTp);
    if (greatest == aTp) {
        //console.log('a'); managing b and c
        var mnb = aTp - bTp + 20;
        $(".count_b").css('margin-top', mnb + 'px');
        var mnc = aTp - cTp + 20;
        ;
        $(".count_c").css('margin-top', mnc + 'px');
    } else if (greatest == bTp) {
        // console.log('b'); managing a and c
        var mna = bTp - aTp + 20;
        ;
        $(".count_a").css('margin-top', mna + 'px');
        var mnc = bTp - cTp + 20;
        ;
        $(".count_c").css('margin-top', mnc + 'px');
    } else {
        // console.log('c'); managing a and b
        var mna = cTp - aTp + 20;
        ;
        $(".count_a").css('margin-top', mna + 'px');
        var mnb = cTp - bTp + 20;
        ;
        $(".count_b").css('margin-top', mnb + 'px');
    }
}
$(window).load(function () {
    //setCountDivsPostn();
    setTimeout(setCountDivsPostn, 100);

});
function detectBrowser() {
    //console.log(bowser.name);
    return bowser.name;
}

function disablemouseEventForallPielegends() {
    $('.highcharts-legend text, .highcharts-legend rect,.highcharts-legend title, .highcharts-legend tspan').each(function (index, element) {
        $(element).hover(function () {
            //chart.tooltip.refresh(chart.series[0].data[index]);
            return false;
        }, function () {
            //chart.tooltip.hide();
            return false;
        })
    });
}
/**
 Function : populate_lists
 Modified By : Rahul D.
 Last Modified : 220615  
 */
function populate_lists(set, container, container_details, container_count, total, keyword) {
    fn.load(set, function (data) {

        var content = '',
                other = '';

        var total_money = 0;

        data.forEach(function (d, i) {
            if (d.year == current_year) {

                if (total === null) {
                    total = d.top_10.length + d.other.length;
                }

                if (d.top_10) {
                    d.top_10.forEach(function (t, i) {
                        total_money += t.value;
                    });
                }

                if (d.other) {
                    var sorted = d.other.sort(function (a, b) {
                        return b.value - a.value
                    });
                    sorted.forEach(function (t, i) {
                        total_money += t.value;
                    });
                }
            }
        });

        if (keyword == 'programme areas') { // handle programme areas list
            var programme_areas_colors = {'01': 'rgb(0, 106, 0)', '02': 'rgb(220, 246, 191)', '03': 'rgb(144, 238, 144)', '04': 'rgb(138, 228, 41)', '05': 'rgb(77, 127, 23)', '06': 'rgb(107, 177, 32)', '07': 'rgb(0, 134, 0)'};
            //console.log(data);
            data.forEach(function (d, i) {
                if (d.year == current_year) {
                    if (total === null) {
                        total = d.top_10.length + d.other.length;
                    }

                    if (d.top_10) {
                        d.top_10.forEach(function (t, i) {
                            // replace(/-/g, ' ')
                            content += '<li style="border-left: 4px solid ' + programme_areas_colors[t.outcome_code] + '" >' + '<span  class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(2, this)" pname="' + t.name + '">' + t.name + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                        });
                    }

                    if (d.other) {
                        var sorted = d.other.sort(function (a, b) {
                            return b.value - a.value
                        });
                        //.replace(/-/g, ' ')
                        sorted.forEach(function (t, i) {
                            other += '<li style="border-left: 4px solid ' + programme_areas_colors[t.outcome_code] + '" >' + '<span  class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(2, this)" pname="' + t.name + '">' + t.name + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                        });
                    }
                }
            });
        } else if (keyword == 'resource partners') { // handle resource partners list
            //console.log(data);
            data.forEach(function (d, i) {

                if (d.year == current_year) {
                    //d = consolidateDonors(d); commented By Rahul D. @ 250615
                    if (total === null) {
                        total = d.top_10.length + d.other.length;
                    }
                    /* if (d.top_10) { // handle top 10
                     d.top_10.forEach(function (t, i) {
                     content += '<li style="border-left: 4px solid ' + t.color + '">' + t.name.replace(/-/g, ' ') + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                     });
                     }
                     
                     if (d.other) { // handle other
                     var sorted = d.other.sort(function (a, b) {
                     return b.value - a.value
                     });
                     sorted.forEach(function (t, i) {
                     other += '<li style="border-left: 4px solid ' + t.color + '">' + t.name.replace(/-/g, ' ') + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                     });
                     } */
                    // to enable links for the resource by rahul 27 july 2016
                    if (d.top_10) {
                        d.top_10.forEach(function (t, i) {
                            // replace(/-/g, ' ')
                            content += '<li  style="border-left: 4px solid ' + t.color + '" >' + '<span  class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(3, this)" dname="' + t.name + '">' + t.name + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                        });
                    }
                    if (d.other) {
                        var sorted = d.other.sort(function (a, b) {
                            return b.value - a.value
                        });
                        //.replace(/-/g, ' ')
                        sorted.forEach(function (t, i) {
                            //condition to check to hide the last text below 1000
                            //console.log(t.value);
                            if (t.value > 1000) {

                                other += '<li  style="border-left: 4px solid ' + t.color + '" >' + '<span class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(3, this)" dname="' + t.name + '">' + t.name + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                            }
                        });
                    }
                }

            });// end data.forEach

        } else {
            var resions_colect = [];
            data.forEach(function (d, i) {
                if (d.year == current_year) {
                    if (total === null) {
                        total = d.top_10.length + d.other.length;
                    }

                    if (d.top_10) {
                        d.top_10.forEach(function (t, i) {
                            resions_colect.push(t.region);
                            content += '<li style="border-left: 4px solid ' + t.color + ' " >' + '<span  class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(1, this)" cname="' + t.name + '">' + t.name.replace(/-/g, ' ') + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                        });
                    }

                    if (d.other) {
                        var sorted = d.other.sort(function (a, b) {
                            return b.value - a.value
                        });
                        sorted.forEach(function (t, i) {
                            resions_colect.push(t.region);
                            other += '<li style="border-left: 4px solid  ' + t.color + '" >' + '<span  class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(1, this)" cname="' + t.name + '">' + t.name.replace(/-/g, ' ') + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                        });
                    }
                }
            });
            if (keyword == 'countries and regions')
            {
                var unique_resions = resions_colect.filter(function (item, i, ar) {
                    return ar.indexOf(item) === i;
                });
                keyword = 'countries and <span class="bold">' + unique_resions.length + '</span> regions';
            }


        }

        $(container).html("").append('<ul>' + content + '<ul>');
        $(container_details).html("").append('<ul>' + other + '<ul>');
        $(container_count).html("").append('<span class="bold">' + total + '</span> ' + keyword + ' in ' + current_year);
    });
}

function barchartLegendClickEvent(pieType,_pieNumber){     
    //console.log(pieType);
    window.setInterval(function(){                
        // a b c :  
        // 3 1 2
        d3.select(".bar_chart_outcome")
        .selectAll("tspan")//.style("cursor" , "pointer")       
        .on("click", function(e){   
            //console.log(_pieNumber);
            jumpToMappingForPieChart(_pieNumber, $(this).text()) ;
            return false; // disabling above created event for other pie chart
        });
        
         
        //$(".bar_chart_outcome").css("overflow","scroll");
        /*
        $(".bar_chart_outcome").mCustomScrollbar({
                scrollButtons:{enable:true},
                theme:"minimal-dark",
                scrollbarPosition:"outside"                
        });
        */
        
        
    }, 1000);
}


$(document).ready(function(){
    $('#outcome_details').on('hidden.bs.modal', function (e) {
       $("#barpopupspan").html("");
    })
});

function piechartClose(whichPie){
    //console.log(whichPie);
    
    $('#outcome_details').modal("hide");
    $("#barpopupspan").html("");    
    var pie = $('#'+whichPie).highcharts();
    //var sel = pie.getSelectedPoints();
    //console.log(pie);
    //console.log(sel[0]);
    var curPieSlice = pie.series[0].data[$('#' + whichPie+'_PreIndex').val()];
    $(curPieSlice.legendItem.element).attr("isSeletcted","no");
    
     
     
    closeAllOtherSlices([whichPie]);
    
    switch(whichPie){
        case 'VO2' : 
            handlingPie1LegendClick(curPieSlice);
            myscrollTop(".count_a");
            break;
        case 'VO3' : 
            handlingPie2LegendClick(curPieSlice);
            myscrollTop(".count_b");
            break;
        case 'VO4' : 
            handlingPie3LegendClick(curPieSlice);
            myscrollTop(".count_c");
            break;
    }
     
    
    
    
    
}

function myscrollTop(selector){
    $('html,body').animate(
            {
                scrollTop: $(selector).offset().top
            },
            'slow'
    );
}
