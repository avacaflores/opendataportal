/**
 Function : populate_lists
 Modified By : Vijay .
 Last Modified : 220816  
 
 populate_lists('summary_donors.json', '.list_a', '.details_a', '.count_a', current_year_dataset.num_donors, 'resource partners');
 populate_lists('summary_countries.json', '.list_b', '.details_b', '.count_b', current_year_dataset.num_countries, 'countries and regions');
 populate_lists('summary_sectors.json', '.list_c', '.details_c', '.count_c', null, 'programme areas');
 */

function populate_lists2(set, container, container_details, container_count, total, keyword, pieSliceObj) {
    
    var globalDataCnt = 0; 
    var filteredCnt = 0;
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
            var tmpData = data;   
            var filterAgainst = pieSliceObj.code;
    
    
            data.forEach(function (d, i) {
                if (d.year == current_year) {
                    if (d.top_10) {
                        d.top_10.forEach(function (t, t10i) {
                            globalDataCnt++;
                            if ($.trim(t.outcome_code) != filterAgainst) {                                
                                delete data[i].top_10[t10i];                                
                            }
                        });
                    }
                    if (d.other) {                                                
                        d.other.forEach(function (to, otheri) {
                            globalDataCnt++;
                            if ($.trim(to.outcome_code) != filterAgainst) {
                                delete data[i].other[otheri]; 
                            }
                        });
                    }
                }
            });
            
            //console.log(data);
            data.forEach(function (d, i) {
                if (d.year == current_year) {
                    if (total === null) {
                        total = d.top_10.length + d.other.length;
                    }
                    if (d.top_10) {
                        d.top_10.forEach(function (t, i) {
                            filteredCnt++;
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
                            filteredCnt++;
                            other += '<li style="border-left: 4px solid ' + programme_areas_colors[t.outcome_code] + '" >' + '<span  class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(2, this)" pname="' + t.name + '">' + t.name + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                        });
                    }
                }
            });
             
        } else if (keyword == 'resource partners') { // handle resource partners list
            var tmpData = data;
            var filterAgainst = pieSliceObj.name;
            data.forEach(function (d, i) {
                if (d.year == current_year) {
                    if (d.top_10) {
                        d.top_10.forEach(function (t, t10i) {
                            globalDataCnt++;
                            // replace(/-/g, ' ')                             
                            if ($.trim(t.type) != filterAgainst) {
                                //console.log(t.region);
                                delete data[i].top_10[t10i];
                                //console.log(data[i].top_10[t10i]);
                            }
                        });
                    }
                    if (d.other) {                        
                        //.replace(/-/g, ' ')                        
                        d.other.forEach(function (to, otheri) {
                            globalDataCnt++;
                            if ($.trim(to.type) != filterAgainst) {
                                delete data[i].other[otheri]; 
                            }
                        });
                       
                        
                    }
                }
            });
            
            data.forEach(function (d, i) {

                if (d.year == current_year) {
                    //d = consolidateDonors(d); commented By Rahul D. @ 250615
                    if (total === null) {
                        total = d.top_10.length + d.other.length;
                    }

                    // to enable links for the resource by rahul 27 july 2016
                    if (d.top_10) {
                        d.top_10.forEach(function (t, i) {
                            filteredCnt++;
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
                            filteredCnt++;
                            if (t.value > 1000) {                                
                                other += '<li  style="border-left: 4px solid ' + t.color + '" >' + '<span class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(3, this)" dname="' + t.name + '">' + t.name + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                            }
                        });
                    }
                }

            });// end data.forEach

        } else {
            var resions_colect = [];
            var tmpData = data;
            var filterAgainst = pieSliceObj.region_code;
            data.forEach(function (item, i) {
                if (item.year == current_year) {
                    //console.log(item);
                    //console.log( i);
                    if (item.top_10) {
                        item.top_10.forEach(function (t, t10i) {
                            globalDataCnt++;
                            if ($.trim(t.region) != filterAgainst) {
                                //console.log(t.region);
                                delete data[i].top_10[t10i];
                                //console.log(data[i].top_10[t10i]);
                            }
                            //console.log(t.region);
                        });
                    }
                    if (item.other) {
                        item.other.forEach(function (to, otheri) {
                            globalDataCnt++;
                            if ($.trim(to.region) != filterAgainst) {
                                //data.push(item); 
                                delete data[i].other[otheri];
                                //console.log(to.region);
                                //console.log(data[i].other[otheri]);
                            }
                            //console.log(t.region);
                        });
                    }
                }
            });
            //console.log(data);
            data.forEach(function (d, i) {
                if (d.year == current_year) {
                    if (total === null) {
                        total = d.top_10.length + d.other.length;
                    }

                    if (d.top_10) {
                        d.top_10.forEach(function (t, i) {
                            filteredCnt++;
                            resions_colect.push(t.region);
                            content += '<li style="border-left: 4px solid ' + t.color + ' " >' + '<span  class="heighlightedText" title="Click here to show this on map page" style="cursor: pointer;" onclick="jumpToMapping(1, this)" cname="' + t.name + '">' + t.name.replace(/-/g, ' ') + '</span>' + ' <br> <span class="number">$' + util_fn.fmtnumber(t.value.toFixed(0)) + ' (' + ((t.value / total_money) * 100).toFixed(2) + '%)</span><div class="percent" style="width:' + t.value.toFixed(0) / 5000000 + 'px;"></div></li>';
                        });
                    }

                    if (d.other) {
                        var sorted = d.other.sort(function (a, b) {
                            return b.value - a.value
                        });
                        sorted.forEach(function (t, i) {
                            filteredCnt++;
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
                if(unique_resions.length == 1){
                    keyword = 'countries  ';
                }else{
                    keyword = 'countries and <span class="bold">' + unique_resions.length + '</span> regions';
                }
                
            }


        }
        // globalDataCnt filteredCnt
        $(container).html("").append('<ul>' + content + '<ul>');
        $(container_details).html("").append('<ul>' + other + '<ul>');
        //$(container_count).html("").append('<span class="bold">' + total + '</span> ' + keyword + ' in ' + current_year);
        var legendStr = "<div class='extraFilterInfo'><span class='arrowpieDetailCls'>&#10149;</span> <div class='extraFilterTxt'>"+pieSliceObj.name+"</div>"
                +"</div> ";
        $(container_count).html("").append('<span class="bold">' + filteredCnt + '</span> ' + keyword + ' in ' + current_year +legendStr );
    });
}

function handlingPie1LegendClick(me){
    //console.log(me);
    var pieId = 'VO2';
    closeAllOtherSlices([pieId]);
    var currentChart = $('#'+pieId).highcharts();
    var currentSlice = currentChart.series[0].data[me.index];
    
    
    
    var isSeletcted = $(me.legendItem.element).attr("isSeletcted");                                    
    $("#VO2 .highcharts-legend-item text").attr("isSeletcted", "no");
    $("#VO2 .highcharts-legend-item text").css("font-weight","normal");
    //rgb(51, 51, 51) //default 
    //rgb(0, 128, 0)highlighted
    if (typeof (summaryTotalJson.current_year_index) != "undefined") {
        summaryTotalJson.current_year_index = 4;
    }
    var current_year_dataset = summaryTotalJson.years[summaryTotalJson.current_year_index];
    var subset_values        = current_year_dataset.value;
    if( (isSeletcted == "no") || (!isSeletcted) ){
        // now select it                                                            
        $(me.legendItem.element).attr("isSeletcted", "yes");
        $(me.legendItem.element).css("font-weight","bold");    
        //console.log(this.name+ "-->now selected " );    
        populate_lists2('summary_donors.json', '.list_a', '.details_a', '.count_a', current_year_dataset.num_donors, 'resource partners',me);
        
        $("#myPiedetail_a .details").show();
        $("#myPiedetail_a .view_full_list").hide(); 
        
        currentSlice.slice(true);        
        $('#' + pieId+'_PreIndex').val(me.index);
        
    }else{
        // now deselect it                                                      
        $(me.legendItem.element).attr("isSeletcted", "no");
        $(me.legendItem.element).css("font-weight","normal");             
        populate_lists('summary_donors.json', '.list_a', '.details_a', '.count_a', current_year_dataset.num_donors, 'resource partners');        
        //console.log( this.name+ "-->now deselected " );
        
        $("#myPiedetail_a .details").hide();
        $("#myPiedetail_a .view_full_list").show();
         
        
    }
}
function handlingPie2LegendClick(me){
    var pieId = 'VO3';
    closeAllOtherSlices([pieId]);
    var currentChart = $('#'+pieId).highcharts();
    var currentSlice = currentChart.series[0].data[me.index];
    
    var isSeletcted = $(me.legendItem.element).attr("isSeletcted");                                    
    $("#VO3 .highcharts-legend-item text").attr("isSeletcted", "no");
    $("#VO3 .highcharts-legend-item text").css("font-weight","normal");
    //rgb(51, 51, 51) //default 
    //rgb(0, 128, 0)highlighted
    if (typeof (summaryTotalJson.current_year_index) != "undefined") {
        summaryTotalJson.current_year_index = 4;
    }
    var current_year_dataset = summaryTotalJson.years[summaryTotalJson.current_year_index];
    var subset_values        = current_year_dataset.value;
    if( (isSeletcted == "no") || (!isSeletcted) ){
        // now select it                                                            
        $(me.legendItem.element).attr("isSeletcted", "yes"); 
        $(me.legendItem.element).css("font-weight","bold");    
        //console.log(this.name+ "-->now selected " );                                        
        populate_lists2('summary_countries.json', '.list_b', '.details_b', '.count_b', current_year_dataset.num_countries, 'countries and regions', me);         
       
        $("#myPiedetail_b .details").show();
        $("#myPiedetail_b .view_full_list").hide();
        
        currentSlice.slice(true);        
        $('#' + pieId+'_PreIndex').val(me.index);
        
    }else{
        // now deselect it                                                      
        $(me.legendItem.element).attr("isSeletcted", "no");
        $(me.legendItem.element).css("font-weight","normal");             
        populate_lists('summary_countries.json', '.list_b', '.details_b', '.count_b', current_year_dataset.num_countries, 'countries and regions');
        //console.log( this.name+ "-->now deselected " );
        
        $("#myPiedetail_b .details").hide();
        $("#myPiedetail_b .view_full_list").show();
    }
}
function handlingPie3LegendClick(me){
    var pieId = 'VO4';
    closeAllOtherSlices([pieId]);
    var currentChart = $('#'+pieId).highcharts();
    var currentSlice = currentChart.series[0].data[me.index];

    var isSeletcted = $(me.legendItem.element).attr("isSeletcted");                                    
    $("#VO4 .highcharts-legend-item text").attr("isSeletcted", "no");
    $("#VO4 .highcharts-legend-item text").css("font-weight","normal");
    //rgb(51, 51, 51) //default 
    //rgb(0, 128, 0)highlighted    
    if( (isSeletcted == "no") || (!isSeletcted) ){
        // now select it                                                            
        $(me.legendItem.element).attr("isSeletcted", "yes");
        $(me.legendItem.element).css("font-weight","bold");    
        //console.log(this.name+ "-->now selected " );         
        populate_lists2('summary_sectors.json', '.list_c', '.details_c', '.count_c', null, 'programme areas', me);   
        
        $("#myPiedetail_c .details").show();
        $("#myPiedetail_c .view_full_list").hide();
        
        currentSlice.slice(true);        
        $('#' + pieId+'_PreIndex').val(me.index);
        
    }else{
        // now deselect it                                                      
        $(me.legendItem.element).attr("isSeletcted", "no");
        $(me.legendItem.element).css("font-weight","normal");                     
        populate_lists('summary_sectors.json', '.list_c', '.details_c', '.count_c', null, 'programme areas');        
        //console.log( this.name+ "-->now deselected " );
        
        $("#myPiedetail_c .details").hide();
        $("#myPiedetail_c .view_full_list").show();
    }
}