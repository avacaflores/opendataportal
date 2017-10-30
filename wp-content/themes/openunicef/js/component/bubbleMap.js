/* global google */
var df = null;
var layerNamesArr =  {};
var layerNames =  [];
var layerData =  [];

var allLayerObj = [];
var sss = 'b';
var legendHtmls = {};
legendHtmls['b'] = '';
legendHtmls['c'] = '';
legendHtmls['e'] = '';

'use strict';
define(function (require) {
  var defineComponent = require('flight/lib/component');

  var _ = require('lodash');
  var d3 = require('d3');

  var iatiData = require('data/iatiData');

  var withMeasure = require('mixin/withMeasure');
  var withFilter = require('mixin/withFilter');
  var withYear = require('mixin/withYear');
  var withCountry = require('mixin/withCountry');

  function BubbleMap() {
    function bubbleClickHandler(context, country) {
        //console.log(context);
        //console.log(country);
      return function () {
          // Added By Rahul D. @03July15
          if (typeof(context.attr.year) != 'undefined'){
            context.trigger('uiShowDetails', { year: context.attr.year, name: country.name, type: 'country', country: country.name });
          } else {
            context.trigger('uiShowDetails', {name: country.name, type: 'country', country: country.name });              
          }
          // End
      };
    }

    this.attributes({
      filter: 'all',
      minZoom: 2,
      maxZoom: 8,
      countryZoom: 5,
      scaleRange: [4, 20],
      center: { lat: 0, lng: 0 },
      measureColors: { 'b': '#FDBD29', 'c': '#40B5C3', 'e': '#A1CC3A' },
      bubbleOpacity: 0.9,
      bubbleStrokeColor: '#FFFFFF',
      bubbleStrokeWeight: 1,
    });

    this.updateData = function (ev, data) {
      var self = this,
        domain = this.scale.domain();      
      _.merge(this.attr, data);
      iatiData.countries(this.attr.year, this.attr.measure, this.attr.filter)
        .done(function (countries) {

          var extent = d3.extent(countries.filter(function (d) {
            return (Number(d[self.attr.measure]) > 0);
          }), function (d) {
            return Number(d[self.attr.measure]);
          });

          self.data = countries;

          // Don't change the scale if any of the extents of this data set are
          // undefined.
          if (!extent.some(isNaN)) {
            domain[0] = Math.min(domain[0], extent[0]);
            domain[1] = Math.max(domain[1], extent[1]);

            self.scale.domain(domain);
          }

          self.redraw();
        });
    };

    this.updateCenter = function (ev, data) {
      var self = this;

      this.attr.center = { lat: 0, lng: 0 };
      this.zoom = this.attr.minZoom;

      this.data.forEach(function (c) {
        if (c.name === data.country) {
          self.attr.center.lat = c.lat;
          self.attr.center.lng = c.lng;
          self.zoom = self.attr.countryZoom;
        }
      });

      this.recenter();
    };

    this.redraw = function () {
      var i;

      // Clear any extraneous bubbles
      if (this.data.length < this.bubbles.length) {
        var removed = this.bubbles.splice(this.data.length, this.bubbles.length - this.data.length);

        for (i = 0; i < removed.length; ++i) {
          removed[i].setMap(null);
        }
      }
      df = this.gmap;
      layerNames = []; 
      layerData = []; 
       
      for (i = 0; i < this.data.length; ++i) {
          //console.log(d);
        var d = this.data[i],
          opts = {
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              strokeColor: this.attr.bubbleStrokeColor,
              strokeWeight: this.attr.bubbleStrokeWeight,
              fillOpacity: this.attr.bubbleOpacity,
            },
            map: this.gmap,
          },
          bubble;
        
        layerNames.push(d.name); 
        layerData.push(d); 
           
        while (i >= this.bubbles.length) {
          this.bubbles.push(new google.maps.Marker(opts));
        }
        
        /*bubble = this.bubbles[i];
        var latLng = new google.maps.LatLng(Number(d.lat), Number(d.lng));
        var icon = bubble.getIcon();
        bubble.setPosition(latLng);
        icon.fillColor = this.attr.measureColors[this.attr.measure];
        icon.scale = (d[this.attr.measure] && d[this.attr.measure] > 0) ? this.scale(d[this.attr.measure]) : 0;
        bubble.setIcon(icon);
        google.maps.event.clearInstanceListeners(bubble);
        google.maps.event.addListener(bubble, 'click', bubbleClickHandler(this, d));*/
        
         
           
      }
      
      layerNamesArr = {
        layerNames : layerNames,
        layerData : layerData        
      };

      //console.log(layerNamesArr);
      multiLayerMap(layerNamesArr,this.gmap, this.attr.measure,this);
      this.recenter();
      
      var selCountry = getselectedCountry();
      if(selCountry != null){          
          //this.after('uiCountryChanged', this.updateCenter);
          this.updateCenter('',{country: selCountry});
          //this.after('uiYearChanged', this.updateCenter('',{country: selCountry}));
          
      }
      
      
    };

    this.recenter = function () {
      this.gmap.panTo(this.attr.center);
      this.gmap.setZoom(this.zoom);
    };

    this.after('initialize', function () {
      this.attr.onMeasureChanged = this.redraw;

      this.gmap = new google.maps.Map(this.node, {
        //mapTypeId: 'roadmap',  
        zoom: this.attr.minZoom,
        minZoom: this.attr.minZoom,
        maxZoom: this.attr.maxZoom,
        center: new google.maps.LatLng(0, 0),
        disableDefaultUI: true,
        scrollwheel: true,
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL,
        },
        styles: [
          {
            'featureType': 'administrative',
            'stylers': [{
              'visibility': 'off'
            }]
          }, {
            'featureType': 'road',
            'stylers': [{
              'visibility': 'off'
            }]
          }, {
            'featureType': 'poi',
            'stylers': [{
              'visibility': 'off'
            }]
          }, {
            'featureType': 'administrative.country',
            'stylers': [{
              'visibility': 'on'
            }]
          }
        ],
      });

        this.scale = d3.scale.linear()
            .range([4, 20])
            .domain([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);

        this.data = [];
        this.bubbles = [];
        this.zoom = this.attr.minZoom;

        this.after('countryChanged', this.updateCenter);
        
        //this.after('measureChanged', this.updateData);
        // Added By Rahul D. @03July15
        this.after('measureChanged', function () {
            if (typeof (this.attr.year) != 'undefined' && typeof (this.attr.measure) != 'undefined' && this.attr.measure == 'e') { 
                this.attr.year = moment().year();
            }
            this.updateData();
            
        });

        this.after('yearChanged', this.updateData);
        this.after('filterChanged', this.updateData);

        this.updateData();
    });
  }

  return defineComponent(BubbleMap,
    withMeasure,
    withYear,
    withFilter,
    withCountry);
});


function multiLayerMap(layerNamesArr,myMap,measure,me){
    while(allLayerObj.length) { allLayerObj.pop().setMap(null); }
    allLayerObj.length = 0;
    drawMap(gmapdata,myMap, layerNamesArr,measure , me);
    
    
}

function drawMap(data,map, layerNamesArr,measure ,me) {
    var layerNames = layerNamesArr.layerNames;
    var layerData = layerNamesArr.layerData;
    var layerFunc = layerNamesArr.layerFunc;
    
    //console.log(layerData[layerNames.indexOf("China")])
    
    
    //var colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];  
     
    //['60000K', '120000K', '180000K', '240000K']


    var rows = data['rows'];
    
    for (var i in rows) {
      //if (rows[i][0] != 'Antarctica') {
      var layerFind = layerNames.indexOf(rows[i][0]);
      if (  layerFind != -1) {
        
        /* highlight country or not and color settingd start*/  
        var ranClrNumber = '';
        switch(measure){
            case 'b' : 
                ranClrNumber = layerData[layerFind].b;
                break;
            case 'c' : 
                ranClrNumber = layerData[layerFind].c;
                break;
            case 'e' : 
                ranClrNumber = layerData[layerFind].e;
                break;
            default : 
                ranClrNumber = layerData[layerFind].b;
                
        }
        // if(ranClrNumber != 0){
            ranClr = getColor(ranClrNumber,measure);
            /* highlight country or not and color settingd end*/  

            var newCoordinates = [];
            var geometries = rows[i][1]['geometries'];
            if (geometries) {
              for (var j in geometries) {
                newCoordinates.push(constructNewCoordinates(geometries[j]));
              }
            } else {
              newCoordinates = constructNewCoordinates(rows[i][1]['geometry']);
            }


            var country = new google.maps.Polygon({
              paths: newCoordinates,
              strokeColor: ranClr,
              strokeOpacity: 0,
              strokeWeight: 1,
              fillColor: ranClr,
              fillOpacity: 0.7
            });
            allLayerObj.push(country);
            country.mydata = layerData[layerFind];
            country.myColor = ranClr;
            google.maps.event.addListener(country, 'mouseover', function(e) {
              this.setOptions({
                  //fillOpacity: 0.9,
                  fillColor : '#ff6d00'                  
              });
            });
            google.maps.event.addListener(country, 'mouseout', function(e) {
              this.setOptions({
                  //fillOpacity: 0.7,
                  fillColor : this.myColor
              });
            });
            
            //country.myClickFunc = layerFunc[layerFind];
            
            //console.log(country)  ;
            google.maps.event.addListener(country, 'click', function(e) {
              //console.log(layerData[layerFind])  ;
              //console.log(this.mydata)  ;
              //return bubbleClickHandler2(me, this.mydata);
              return bubbleClickHandler2(me, this.mydata);
              
            });

            country.setMap(map);
        //}
        
         
        
        
      }
    }
}

function constructNewCoordinates(polygon) {
    var newCoordinates = [];
    var coordinates = polygon['coordinates'][0];
    for (var i in coordinates) {
      newCoordinates.push(
        new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
    }
    return newCoordinates;
}
function getColor(d, measure) {        
    //measure = 'b';
    var divisor = 3;
    var clrArr = [];
    var tenMillion = 10*Math.pow(10, 6);
    var fiftyMillion = 50*Math.pow(10, 6);
    var tmpClrArr = [depricateColor2( 0 , measure),depricateColor2( 1 , measure),depricateColor2( 2 , measure) ];
    if( d <= tenMillion  ){
        retClr =  tmpClrArr[0];    
    }else if( (d > tenMillion)  && (d <= fiftyMillion)    ){
        retClr =  tmpClrArr[1];
    }else{
        retClr =  tmpClrArr[2]
    }
    
        
    clrArr.push([0,tenMillion,tmpClrArr[0]]);  
    clrArr.push([tenMillion,fiftyMillion,tmpClrArr[1]]);  
    clrArr.push([fiftyMillion, (fiftyMillion+1) ,tmpClrArr[2]]);  
        
    
    //console.log(clrArr);
    
    createLegands(clrArr, measure);
    return retClr;
    
}

function createLegands(clrArr , measure){
    var clrArr_local = clrArr.reverse();
    var measureStr = measure+"";
    legendHtmls[measureStr] = '';
    if( $("#myMapLegends").length == 0  ){
        $("#map").append("<div id='myMapLegends'></div>");
    }
    //console.log(measure);
    //console.log(legendHtmls[""+measure+""]);      
    //if(legendHtmls[measureStr] == ''){  
        //console.log(clrArr_local);
        clrArr_local.forEach(function(i,index){
            i[0] = i[0]/Math.pow(10, 6);
            i[1] = i[1]/Math.pow(10, 6);
            
            legendHtmls[measureStr] += '<div class="allLegendDivs">'; 
            legendHtmls[measureStr] += '    <div class="allLegendColorDivs" style="background:'+i[2]+';"></div>'; 
            if(index == 0){
                legendHtmls[measureStr] += '     &nbsp; <span style="font-weight:bold;"> > '+i[0]+'M</span>'; 
            }else if(index == 1) {                
                legendHtmls[measureStr] += '     &nbsp; <span style="font-weight:bold;">'+(i[0])+'M</span> - <span style="font-weight:bold;">'+i[1]+'M</span>'; 
            }else{
                legendHtmls[measureStr] += '     &nbsp; <span style="font-weight:bold;"> < '+(i[1])+'M</span>'; 
            }
            legendHtmls[measureStr] += '    <div style="clear:both;"></div>'; 
            legendHtmls[measureStr] += '</div>'; 
        });
        $("#myMapLegends").html(legendHtmls[measureStr]);         
    //}else{
        //$("#myMapLegends").html(legendHtmls[measureStr]);
    //}
    
     
    
}  
  

function depricateColor2( lum, measure) {
    //var arr = ['000000','000033','000066','000099','0000cc','0000ff','3232ff','6666ff','9999ff','ccccff'];
    
    /*var arr_b = ['#0000e5','#0000ff','#1919ff','#3232ff','#4c4cff','#6666ff','#7f7fff','#9999ff','#b2b2ff','#ccccff'];    
    var arr_c = ['#996400','#b27400','#cc8500','#e59600','#ffa700','#ffaf19','#ffb832','#ffc14c','#ffca66','#ffd37f'];
    var arr_e = ['#00bde5','#00d2ff','#19d6ff','#32dbff','#4cdfff','#66e4ff','#7fe8ff','#99edff','#b2f1ff','#ccf6ff'];
    */
    
    //var arr_b = ['#f8ed62','#e9d000','#e3c011'];    
    //var arr_b = ['#ffff8d','#ffee58','#ffab00'];    
    
    var arr_b = ['#fff176', '#ffca28' , '#fb8c00' ];
    
    var arr_c = arr_b;
    var arr_e = arr_b;
    //console.log(measure);
    var retArr = [];
    if(measure == 'b'){
        retArr = arr_b;
    }else if(measure == 'c'){
        retArr = arr_c;
    }else{
        retArr = arr_e;
    }
    //retArr = retArr.reverse();
    return retArr[lum];
}

 

function bubbleClickHandler2(context, country) {
    if (typeof(context.attr.year) != 'undefined'){
        context.trigger('uiShowDetails', { year: context.attr.year, name: country.name, type: 'country', country: country.name });
    } else {
        context.trigger('uiShowDetails', {name: country.name, type: 'country', country: country.name });              
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getselectedCountry(){
    var k = getParameterByName('k');
    var q = getParameterByName('q');
    var counval = getParameterByName('counval');    
    var ret = '';
    if( k == 'country' ){
        ret = q;
    }else{
        ret = counval;
    }
    if(ret == 0){
        ret = null;
    }
    return ret;
}






function depricateColor_old(color, percent) {  // deprecated. See below.
    var num = parseInt(color,16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
    return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}
function depricateColor(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
    }
    return rgb;
}



