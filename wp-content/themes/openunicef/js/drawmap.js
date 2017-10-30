/*****************************************************************
* @Jquery Visulization plugin librray file.
* @Requirements: Jquery, Highcharts chart library, JSON
* @Created by DFA
* @Date 28/05/2015
*****************************************************************/
$.ajaxSetup({
	cache: true
});

var  MAP_TYPE = 'map', HC_MAP_TYPE = 'hcmap'; FS_SEC = 'fullscreen', APP_SEC = 'app';
var DFA_TEMAP_DATA = {};
var mapData = mapGeojson = '';
var $ = jQuery;

(function($) { 

	 Highcharts.setOptions({
		lang: {
			thousandsSep: ','
		}
	});

	
	/******************** Jquery Plugin **********************
	@el - variable will be contained the dom of the div where map will be drawn
	@options - options that will overwrite default attribute
	@callback - callback method that can be called after drawing the chart if needed
	********************************************************/
	$.dfaDrawMap = function(el, options, callback) { 

		var base = this, o;
		base.el = el;
		if(options.title)
		{
		//var screenHeight = screen.height - 181; //150;
		//var screenWidth = screen.width - 40;
		var map_height = $('#map').height();
		//var map_width = $('#map').height();
		}
		else
		{
		var screenHeight = screen.height;
		var screenWidth = screen.width;
		}
		/******************** Default variables *******************
		@objName - Div Id of Map
		@areaId - Selected Area Id on the dashboard
		@dataPath - JSON Data file path
		***********************************************************/
		base.defaults = {
			byGroup: 'yes',
			//width: screenWidth,			// Map width
			//height: map_height,			// Map height
			mapFilePath: '',
			IUSGId: '', 
			dataFilePath: '',
			dataLabelFromat: 'AreaName',
			callbackSingleClick: '',	
			callbackDoubleClick: '',
			title: '',
			subtitle: '',
			timeSlider:	{
							enabled:false,						// enable/disable time epriod
							timeValues: '',						// slider time period values
							clickCallback: ''					// time period callback
								},
			mapSettings: {
				// - for HIGHCHARTS MAP
				iconSize: 'medium',  // big/medium/small
				navAlign: 'left',	// left/right
				missingColor: 'gray',
				animation: true,
				hoverColor: '#BADA55',
				legendLayout: 'horizontal',
				legendAlign: 'center',
				legendVerticalAlign: 'bottom',
				legendFloating: false,
				legendDecimal: 0,
				clickZoomTo: true,
				selectedZoomTo: false,
				showLegend: true,
				allowPointSelect: false,
				dataLabels: true,
				dataLabelFormat: '', // {_AREANAME_}, {_AREAID_}, {_DATAVALUE_},
				tooltipFormat: '', // {_AREANAME_}, {_AREAID_}, {_DATAVALUE_},
				dataLabelStyle: {
				},
				stops: null,
				hideOverlappingDataLabels: true,
				minColor: '#E6E8FA',
				maxColor: '#0A407B',
				selectedAreaDataLabel: false,
				
			},
			toolbar: {
				enabled: true,				// true/false
				iconsize: 'medium',			// big/small/medium
				fullscreen: {				// Fullscreen settings object
					enabled: false,			// true/false
					iconSize:	'big',		// big/small/medium for the fullscreen view
					settings: {}
				},
				tableView: {				// Table view settings object
					enabled: true,
					settings: {}
				},
				print: {					// Print settings object
					enabled: true,
					settings: {}
				},
				download: {					// Download settings object
					enabled: false,
					settings: {}
				},
				dataLabel: {					// Download settings object
					enabled: true,
					settings: {}
				},
				share: {					// Share settings object
					enabled: false,
					url: '',
					callback: '',
					settings: {}
				}
			},			
			progvars: {}
		};

		base.init = function() {
			if(options.mapSettings) {
				options.mapSettings = $.extend({}, base.defaults.mapSettings, options.mapSettings);
			}
			
			if(options.toolbar) {			

				if(options.toolbar.fullscreen) options.toolbar.fullscreen = $.extend({}, base.defaults.toolbar.fullscreen, options.toolbar.fullscreen);

				if(options.toolbar.tableView) options.toolbar.tableView = $.extend({}, base.defaults.toolbar.tableView, options.toolbar.tableView);

				if(options.toolbar.print) options.toolbar.print = $.extend({}, base.defaults.toolbar.print, options.toolbar.print);

				if(options.toolbar.download) options.toolbar.download = $.extend({}, base.defaults.toolbar.download, options.toolbar.download);

				if(options.toolbar.share) options.toolbar.share = $.extend({}, base.defaults.toolbar.share, options.toolbar.share);

				options.toolbar = $.extend({}, base.defaults.toolbar, options.toolbar);
			}

			base.options = o = $.extend({}, base.defaults, options);
			// calculating div width and height
			base.options.progvars.width = $('#'+base.el.id).width();
			base.options.progvars.height = $('#'+base.el.id).height();
			base.options.progvars.chartContainerId = base.el.id;
			base.options.progvars.visType = base.el.id;
			base.options.progvars.base = base;
			base.options.progvars.defVOGrp = 'G1';
			base.options.progvars.topMapId = base.options.mapFileName;	//filename for map
			base.options.progvars.preMapSettings = {}; 
			base.options.progvars.mapFilePath = base.options.mapFilePath;
		
			// updating deafault vars
			base.defaults = base.options;	
			var otps = base.defaults;
			//console.log(otps);
			if(otps.progvars.visType=='MapObject') { //calling methjod to draw map
					
					otps.progvars.visType = 'hcmap';
						// - NAVIGATION
						base.hcDrawNavigation();
					
						// - HIGHCHARTS MAP
						base.renderMapHighcharts(otps.mapFilePath, otps.IUSGId, otps.timePeriod, callback);

						// - REMOVE TOOLBAR
						base.removeVizToolbar();
						
						// - DRAW TOOLBAR
						base.drawVizToolbar();
						
					
				}
			
		};


		// - REMOVE TOOLBAR IF EXIST FOR A VIZ ON FRESH LOAD
		base.removeVizToolbar = function() {
			
			if($('#dfa_toolbar_'+base.el.id).length > 0) {
				$('#dfa_toolbar_'+base.el.id).remove();
			}
		};

		/*****************************************************************
		******************* Function to draw visualization toolbar for ***
		******************* Fullscreen, TableView, Print, Download *******
		*****************************************************************/
		base.drawVizToolbar = function() {
			var otps = base.defaults; 
			
			DFA_TEMAP_DATA['fs_'+base.el.id] = otps;

			var iconcls = 'dfapi-viz-toolbar-'+otps.toolbar.iconsize;
			
			if(otps.toolbar.enabled) {
				var ui = '<ul id="dfa_toolbar_'+base.el.id+'" class="dfapi-viz-toolbar" rel="'+otps.objName+'">';
				if(otps.toolbar.tableView.enabled) {
					ui += '<li rel="table"><a href="javascript:void(0);"><i class="'+iconcls+' tbl"></i></a></li>';
				}
				if(otps.toolbar.fullscreen.enabled) {
					ui += '<li rel="fullview"><a href="javascript:void(0);"><i class="'+iconcls+' fs"></i></a></li>';
				}
				if(otps.toolbar.print.enabled) {
					ui += '<li rel="print"><a href="javascript:void(0);"><i class="'+iconcls+' print"></i></a></li>';
				}
				if(otps.toolbar.download.enabled) {
					ui += '<li class="dwnld-option-li" rel="'+otps.objName+'"><a href="javascript:void(0);"><i class="'+iconcls+' dwnld"></i></a>\
					<div class="dwnld-opts" rel="download">\
						<a class="export" href="javascript:void(0);" type="png">PNG </a>\
						<a class="export" href="javascript:void(0);" type="jpeg">JPEG </a>\
						<a class="export" href="javascript:void(0);" type="svg">SVG </a>\
						<a class="export" href="javascript:void(0);" type="pdf">PDF </a>\
					</div>';
				}		
				ui += '</ul>';
				
				// - Adding a class on the parent div
				$('#'+base.el.id).parent().parent().addClass('dfapi-box-placeholder');

				// - Adding Table view div
				if($('#dfa_tblview_'+base.el.id).length == 0) {
					$('#'+base.el.id).parent().parent().prepend('<div id="dfa_tblview_'+base.el.id+'" class="dfapi-viz-toolbar-tblview" style="height:'+(otps.progvars.height-35)+'px;"></div>');
				}
				else {
					$('#dfa_tblview_'+base.el.id).hide();
				}

				// - Render the Toolbar UI for each Viz
				if($('#dfa_toolbar_'+base.el.id).length == 0) {

					$('#'+base.el.id).parent().parent().prepend(ui).find('ul.dfapi-viz-toolbar a').on('click', function() {					
						var selectedVo = $(this).parent().parent().attr('rel');
						var selectedType = $(this).parent().attr('rel');
						var downloadType = $(this).attr('type');
						//console.log(selectedVo + ' - ' + selectedType + ' - ' + downloadType);

						switch(selectedType) {
							case "table":	

								var vizObjHt = '';
								var vizObjWt = '';
								var vizObjHtTop = 35;
							 if($('#'+base.el.id).highcharts()) {
									vizObjHt = $('#'+base.el.id).highcharts().chartHeight;
									vizObjWt = $('#'+base.el.id).highcharts().chartWidth;
									if($.trim($('#'+base.el.id).highcharts().plotTop)!='')
									vizObjHtTop = $('#'+base.el.id).highcharts().plotTop;
								}
								if(vizObjHtTop < 15) vizObjHtTop = 24;

								if($.trim(vizObjWt)!='') {
									$('#dfa_tblview_'+base.el.id).css('width', vizObjWt+'px');
								}

								if($.trim(vizObjHt)!='') { 
									$('#dfa_tblview_'+base.el.id).css('height', (vizObjHtTop < 18) ? (vizObjHt)+'px' : (vizObjHt - vizObjHtTop)+'px');
									$('#dfa_tblview_'+base.el.id).css('top', vizObjHtTop+'px');
								}
								$('#'+base.el.id).slideToggle();
								$('#mapslider').slideToggle();


								// - CALLING TABLEVIEW CLICK EVENT METHOD
								base.callingTableview();
									
							break;
							case "fullview":
								
								// - CALLING FULLVIEW CLICK EVENT METHOD
								base.callingFullview();

							break;
							case "print":

								// - CALLING PRINT CLICK EVENT METHOD
								base.callingPrint();

							break;
							case "download":

								// - CALLING DOWNLOAD CLICK EVENT METHOD
								base.callingDownload(downloadType);								

							break;
						}					

					});
				} // end length if

				// - DRAW SHARE
				var pcontainerId = $('#'+base.el.id).parent().attr('id');

				var eleLength = $('#'+base.el.id).parent().find('div.dfapi_shareIconsContainer').length;

				if(eleLength == 0) { 
					dfa_share.show(pcontainerId, {
						'enabled': otps.toolbar.share.enabled,
						'url': otps.toolbar.share.url, 
						'iconSize': otps.toolbar.iconsize, 
						'callback': otps.toolbar.share.callback, 
						'onmousehover': true, 
						'chartType': otps.progvars.visType, 
						'containerParentDivID': pcontainerId, 
						'containerDivId': base.el.id
					});
				}

			} // enabled div
		};
		
		/**************************************
		Method to which are binded with click event
		**************************************/
		// - FULLSCREEN
		base.callingFullview = function() {
			var otps = base.defaults;
			
			// - CALL FULLVIEW PLUGIN
			var dfaFSInputObj = {
				'objType': otps.progvars.visType, 
				'vizDivId': base.el.id, 
				'tblDefOpt': true, 
				'shareObj': {
					'enabled': otps.toolbar.share.enabled, 
					'url':	otps.toolbar.share.url, 
					'iconSize': otps.toolbar.share.iconSize
				}, 
				'settingsObj': otps.toolbar.fullscreen.settings,
				'actOptSetObj': {
					'iconSize': otps.toolbar.fullscreen.iconSize,
					'actOpts': {
						'dtLbl': {'enabled': otps.toolbar.dataLabel.enabled}, 
						'tblVw': {'enabled': otps.toolbar.tableView.enabled}, 
						'dwnld': {'enabled': otps.toolbar.download.enabled}, 
						'prnt':	 {'enabled': otps.toolbar.print.enabled}
					}
				}
			};
			
			dfa_fullscreen.show(dfaFSInputObj);
		};
	
		// - PRINT
		base.callingPrint = function() {
			var otps = base.defaults;
								
			// - CALL PRINT PLUGIN
			dfa_printvisualization.print({
				'objType': otps.progvars.visType, 
				'vizDivId': base.el.id, 
				'calledSec': APP_SEC, 
				'settingsObj': otps.toolbar.print.settings
			});
		};
		// - DOWNLOAD
		base.callingDownload = function(downloadType) {
			var otps = base.defaults;
								
			// - CALL DOWNLOAD PLUGIN
			dfa_dwnldvisualization.download({
				'objType': otps.progvars.visType, 
				'vizDivId': base.el.id, 
				'fileType':	downloadType, 
				'settingsObj': otps.toolbar.download.settings
			});
		};
		// - TABLEVIEW
		base.callingTableview = function() {
			var otps = base.defaults;
			
			// - CALL TABLEVIEW PLUGIN 
			var chartTable = dfa_tableview.getDataTableContent({
				'objType': otps.progvars.visType, 
				'vizDivId': base.el.id, 
				'calledSec': APP_SEC, 
				'settingsObj': otps.toolbar.tableView.settings
			});

			// - RENDER TABLEVIEW DATA
			$('#dfa_tblview_'+base.el.id).html(chartTable).slideToggle();	

			// - ENABLE SORTING ON TABLE VIEW
			dfa_tableview.enableTableSorting('dfa_tblview_'+base.el.id);
		};

		/****************************************************************
		************************ START HIGHCHARTS MAP *******************
		****************************************************************/

		// - Render highcharts map data
		base.renderMapHighcharts = function(mapFilePath, IUSGId, timePeriod, callback) {
		
			var otps = base.defaults;
			var Json_file_path = '../wp-content/themes/openunicef/json/files/';
			if( $.trim(IUSGId)!='') {
				otps.IUSGId = IUSGId;
				var layers = otps.mapFilePath;
				var  data_path = otps.dataFilePath;
				
				$.ajax({
					type: "GET",
					url: layers,
					async:false,
					data: {},
					dataType: "json",
					beforeSend: function(jqXHR) {
						
						// - SHOW Loader
						if($.trim(otps.showLoaderDivId)!='') dfa_loadMask.showLoader(otps.showLoaderDivId);
					},
					success: function(mapGeojson) {
						
						if(layers.indexOf('worldmap') != -1)
						{
							$.ajax({
							type: "GET",
							url: Json_file_path+"maps/locs.json",
							async:false,
							data: {},
							dataType: "json",
							beforeSend: function(jqXHR) {
								
								// - SHOW Loader
								if($.trim(otps.showLoaderDivId)!='') dfa_loadMask.showLoader(otps.showLoaderDivId);
							},
							success: function(dataSr1) {
								$.ajax({
								type: "GET",
								url: Json_file_path+"maps/dibs.json",
								async:false,
								data: {},
								dataType: "json",
								beforeSend: function(jqXHR) {
									
									// - SHOW Loader
									if($.trim(otps.showLoaderDivId)!='') dfa_loadMask.showLoader(otps.showLoaderDivId);
								},
								success: function(dataSr2) {
										$.ajax({
										type: "GET",
										url: Json_file_path+"maps/jammu_n_kashmir.json",
										async:false,
										data: {},
										dataType: "json",
										beforeSend: function(jqXHR) {
											
											// - SHOW Loader
											if($.trim(otps.showLoaderDivId)!='') dfa_loadMask.showLoader(otps.showLoaderDivId);
										},
										success: function(dataSr3) {
											$.getJSON(data_path, function (hcdata) {
												
													 mapData = hcdata;
												
												/*	if(otps.byGroup=='yes') { 
														var tpIndex = 2;
														mapData = hcdata.data[IUSGId];
													}
													else {
														
														var tpIndex = 3;
														mapData = hcdata[mapFileName]; // data for loaded shape file only
													}*/
														mapGeojson = mapGeojson;
														 
														base.loadHCMapData(mapData, mapGeojson,dataSr1,dataSr2,dataSr3);	

												});
										}
										});
									
									
									}
								});
								
							}
							});
						
						}
						else
						{
							$.getJSON(data_path, function (hcdata) {
								

								 mapData = hcdata;
							
								if(otps.byGroup=='yes') { 
									var tpIndex = 2;
									mapData = hcdata.data[IUSGId];
									
								}
								else {
									
									var tpIndex = 3;
									mapData = hcdata[mapFileName]; // data for loaded shape file only
								}
								
									base.loadHCMapData(mapData, mapGeojson);	

							});
						}

						// - HIDE Loader
						if($.trim(otps.showLoaderDivId)!='') dfa_loadMask.hideLoader(otps.showLoaderDivId);
					},
					error: function(result) {

						//base.manageDrillArray(mapFileName, 'remove');
						console.log("ERROR");
						console.log(result);
					},
					cache: true
				});

				

			} // end if
		};

		// - Load highcharts map data
		base.loadHCMapData = function(mapData, mapGeojson,dataSr1,dataSr2,dataSr3) { 
			
                        //console.log(mapData); 
                        console.log(mapGeojson); 
                        console.log(dataSr1); 
			
			var DmDELAY = 500, Dmclicks = 0, Dmtimer = null;
			var otps = base.defaults;
			var realdata = '';
			//getting vo array
			//var vo = base.getVO();
			var vInx = otps.progvars.voIndex;

			// If IUS data is available by Groups
			var tpsArr = []; var asTpsArr = [];
			if($.trim(otps.timePeriod)=='') {
				$.each(mapData, function(i) {
					//console.log(i);
					//tpsArr.push(i);
					//asTpsArr.push(i);
					
				});

	
				

				
				
				tpsArr.sort(function (a, b) {
							return b-a;
						});
				asTpsArr.sort(function (a, b) {
							return a-b;
						});
				//console.log(otps);
				otps.timeSlider.timeValues = [];
				otps.timePeriod = tpsArr[0];
			
				if(otps.timeSlider.timeValues.length==0) otps.timeSlider.timeValues = asTpsArr;	 
				
			}

		
			var minData = 0;
			var maxData = 100;
			var retData = base.hcConvertMapData(mapData); // convert map data infor highchart format
			
			realdata = retData.dt;
			minData = retData.min;
			maxData = retData.max;
		//	console.log(realdata);
			if(tpsArr != 'MRD')
			{
				var Is_TS = 'true';
				var TimeSlider = '';		
			}
			
			if($.trim(otps.width)!='')
			{
			var cwidth = otps.width;
			
				if((typeof(cwidth) == 'string') &&(cwidth.indexOf("%") >= 0) == true)
				{
				var width_var = cwidth.split('%');
				var cwidth = ((width_var[0] * screenWidth)/ 100);
				}		
			}
			else
			{
			cwidth = null;
			}

			if($.trim(otps.height)!='')
			{
			var cheight = otps.height;
			
				if((typeof(cheight) == 'string') &&(cheight.indexOf("%") >= 0) == true)
				{
				var height_var = cheight.split('%');
				var cheight = ((height_var[0] * screenHeight)/ 100);
				}		
			}
			else
			{
			cheight = null;
			}

			($.trim(otps.width)!='') ? cwidth = otps.width : cwidth = null;
			($.trim(otps.height)!='') ? cheight = otps.height : cheight = null;
			
			($.trim(otps.title)!='') ? ctitle = otps.title : ctitle = null; //vo[vInx.vo.vTtlIx];
			($.trim(otps.subtitle)!='') ? csubtitle = otps.subtitle : csubtitle = null; //vo[vInx.vo.vSbTtlIx];

			otps.title = ctitle;
			otps.subtitle = csubtitle;
			
			// - SHOW ALL DATA LABELS
			if(otps.mapSettings.hideOverlappingDataLabels) {
				(function(H) {
					H.seriesTypes.map.prototype.hideOverlappingDataLabels = function() { };
				})(Highcharts);
			}

			// - Data Label Format
			var DataLabelFormat = '{point.properties.NAME1_} <br>{point.value}';
			if($.trim(otps.mapSettings.dataLabelFormat)!='') {
				DataLabelFormat = otps.mapSettings.dataLabelFormat.replace('_AREANAME_', 'point.properties.NAME1_').replace('_AREAID_', 'point.properties.ID_').replace('_DATAVALUE_', 'point.value');
			}
			// - Tooltip Label Format
			var TooltipFormat = '{point.properties.NAME1_} <br>{point.value}';
			if($.trim(otps.mapSettings.tooltipFormat)!='') {
				TooltipFormat = otps.mapSettings.tooltipFormat.replace('_AREANAME_', 'point.properties.NAME1_').replace('_AREAID_', 'point.properties.ID_').replace('_DATAVALUE_', 'point.value');
			}
		//	console.log(realdata);
                        // Initiate the chart
                        window['dfaviz_' + base.el.id] = new Highcharts.Map({
                            chart: {
                                width: cwidth,
                                height: cheight,
                                renderTo: base.el.id,
                                backgroundColor: null
                            },
                            title: {
                                text: ctitle
                            },
                            subtitle: {
                                text: csubtitle
                            },
                            mapNavigation: {
                                enabled: false,
                                enableDoubleClickZoom: false,
                                enableDoubleClickZoomTo: false,
                                enableMouseWheelZoom: false,
                                buttonOptions: {
                                    verticalAlign: 'top'
                                }
                            },
                            colorAxis: {
                                min: 0,
                                max: maxData,
                                minColor: otps.mapSettings.minColor,
                                maxColor: otps.mapSettings.maxColor,
                                stops: otps.mapSettings.stops
                            },
                            legend: {
                                enabled: otps.mapSettings.showLegend,
                                layout: otps.mapSettings.legendLayout,
                                align: otps.mapSettings.legendAlign,
                                verticalAlign: otps.mapSettings.legendVerticalAlign,
                                floating: otps.mapSettings.legendFloating,
                                valueDecimals: otps.mapSettings.legendDecimal,
                                useHTML: true,
                                symbolWidth: 270
                            },
                            plotOptions: {
                                map: {
                                    nullColor: otps.mapSettings.missingColor
                                },
                                series: {
                                    //borderColor:'rgba(255, 255, 255, 0.1)',  // Property to make Background Transparent
                                    point: {
                                        events: {
                                            mouseOver: function () {
                                                this.options.oldColor = this.color;
                                                this.graphic.attr("fill", "#BADA55");
                                            },
                                            mouseOut: function () {
                                                this.graphic.attr("fill", this.options.oldColor);
                                            },
                                            click: function (e) {
                                                var thisPbj = this;
                                                Dmclicks++;  //count clicks
                                                if (Dmclicks === 1) {
                                                    Dmtimer = setTimeout(function () {
                                                        //e.point.applyOptions({dataLabels: {enabled:true}});
                                                        // - SINGLE CLICK
                                                        base.hcmapSingleClick(thisPbj);
                                                        Dmclicks = 0; //after action performed, reset counter										
                                                    }, DmDELAY);
                                                }
                                                else {
                                                    Dmclicks = 0;
                                                    window.clearTimeout(Dmtimer);      //prevent single-click action
                                                    // - DOUBLE CLICK
                                                    base.hcmapDoubleClick(thisPbj);
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            tooltip: {
                                enabled: true,
                                useHTML: true,
                                backgroundColor: 'white',
                                style: {
                                    padding: 10
                                },
                                followPointer: true,
                                shadow: false,
                                borderRadius: 10,
                                headerFormat: '',
                                pointFormat: TooltipFormat,
                                formatter: function () {
                                    if ($.trim(this.point.all)){
                                        // console.log(this.point.all);
                                        return '<b>' + this.point.NAME1_ + '</b> <br>Planned Dispersement : $' + Highcharts.numberFormat(this.point.all.b, 0, ',', ',') + '<br/> Allocation : $' + Highcharts.numberFormat(this.point.all.c, 0, ',', ',') + '<br/> Expense : $' + Highcharts.numberFormat(this.point.all.e, 0, ',', ',');
                                    }
                                    else{
                                        if (($.trim(this.point.b)) && ($.trim(this.point.c)) && ($.trim(this.point.e))){
                                            return '<b>' + this.point.NAME1_ + '</b> <br>Planned Dispersement : $' + Highcharts.numberFormat(this.point.b, 0, ',', ',') + '<br/> Allocation : $' + Highcharts.numberFormat(this.point.c, 0, ',', ',') + '<br/> Expense : $' + Highcharts.numberFormat(this.point.e, 0, ',', ',');
                                        }
                                        else if ((($.trim(this.point.b)) == '') && (($.trim(this.point.e)) == '')){
                                            return '<b>' + this.point.NAME1_ + '</b> <br>Allocation : $' + Highcharts.numberFormat(this.point.c, 0, ',', ',');
                                        }
                                        else if ((($.trim(this.point.b)) == '') && (($.trim(this.point.c)) == '')){
                                            return '<b>' + this.point.NAME1_ + '</b> <br>Expense : $' + Highcharts.numberFormat(this.point.e, 0, ',', ',');
                                        }
                                        else if ((($.trim(this.point.c)) == '') && (($.trim(this.point.e)) == '')){
                                            return '<b>' + this.point.NAME1_ + '</b> <br>Planned Dispersement : $' + Highcharts.numberFormat(this.point.b, 0, ',', ',');
                                        }
                                        else if ((($.trim(this.point.b)) == '') && (($.trim(this.point.c)) == '') && (($.trim(this.point.e)) == '')){
                                            return '<b>' + this.point.NAME1_;
                                        }
                                    }
                                },
                            },
                            exporting: {enabled: false},
                            credits: {enabled: false},
                            series: [
                                {                 
                                    mapData: mapGeojson,
                                    allAreas: true,
                                    //color: '#6FB5E6',//'#E4ECCF',
                                    nullColor: '#EEEEEE',
                                    animation: otps.mapSettings.animation,
                                    joinBy: ['NAME1_', 'name'],
                                    allowPointSelect: otps.mapSettings.allowPointSelect,
                                    cursor: 'pointer',
                                    borderWidth: 1.5,
                                    borderColor: 'rgba(255, 255, 255, 0.1)', // 'rgba(255, 255, 255, 0.1)',//'#ffffff',
                                    states: {
                                        hover: {
                                            enabled: false,
                                            color: '#BADA55', //otps.mapSettings.hoverColor
                                        },
                                    },
                                    events: {
                                        click: function (e) {
                                            bubbleClickHandler(e);
                                            /*if(otps.mapSettings.clickZoomTo) {
                                             e.point.zoomTo();
                                             }*/
                                        }
                                    },
                                    dataLabels: {
                                        enabled: otps.mapSettings.dataLabels,
                                        style: otps.mapSettings.dataLabelStyle,
                                        formatter: function () {
                                            if ($.trim(this.point.properties) != '') {
                                                if ($.trim(this.point.properties.NAME1_) != '') {
                                                    if ($.trim(this.point.value) != ''){
                                                        return this.point.properties.NAME1_ + '<br>' + this.point.value;
                                                    }
                                                    else{
                                                        return this.point.properties.NAME1_;
                                                    }
                                                }
                                                else{
                                                    return '';
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    mapData: dataSr3,
                                    nullColor: '#D0CFCA',
                                    borderColor: 'rgba(255, 255, 255, 0.1)', //'rgba(255, 255, 255, 0.1)', //'#ffffff',
                                    borderWidth: 1.2,
                                    name: 'jnk',
                                    allAreas: true,
                                    states: {
                                        hover: {
                                            color: '#BADA55',
                                        }
                                    },
                                    joinBy: ['NAME1_', 'name'],
                                    dashStyle: 'dash'
                                },
                                {
                                    mapData: dataSr2,
                                    name: 'DIBs',
                                    nullColor: '#D0CFCA',
                                    borderWidth: 1.2,
                                    borderColor: 'rgba(255, 255, 255, 0.1)', //'rgba(255, 255, 255, 0.1)',//'rgba(255, 255, 255, 0.1)',
                                    type: "mapline",
                                    allAreas: true,
                                    states: {
                                        hover: {
                                            color: '#BADA55',
                                        }
                                    },
                                    joinBy: ['NAME1_', 'name'],
                                    dashStyle: 'Dash'
                                },
                                {
                                    lineWidth: 2,
                                    mapData: dataSr1,
                                    name: 'Locs',
                                    borderWidth: 1.2,
                                    borderColor: 'rgba(255, 255, 255, 0.1)', //'rgba(255, 255, 255, 0.1)', //'rgba(255, 255, 255, 0.1)',
                                    type: "mapline",
                                    dashStyle: 'Dot'
                                }],
                            },
                            function (obj) {
                                otps.progvars.visObj = mapObj = obj;
                            }
                        ); 
                        
			 
					
		};

                
                
                
                
                


		// - HIghchart Map - call function to display back link
		base.hcDrawNavigation = function() {
			var otps = base.defaults;

			if($('#hcnav_'+base.el.id).length > 0) {
				$('#hcnav_'+base.el.id).remove();
			}

			var customStyle = 'position:absolute; left:0; top:22px;';
			if(otps.mapSettings.navAlign=='right') customStyle = 'right:0;top:22px;';

			$('#'+base.el.id).parent().append('<div id="hcnav_'+base.el.id+'" class="dfapi_hcnav_medium_con" style="'+customStyle+'"><div class="dfapi_hcnav_'+otps.mapSettings.iconSize+' zoomin"></div><div class="dfapi_hcnav_'+otps.mapSettings.iconSize+' zoomout"></div><div class="dfapi_hcnav_'+otps.mapSettings.iconSize+' fulextend"></div><div class="dfapi_hcnav_'+otps.mapSettings.iconSize+' back"></div></div>');
			
			$('#hcnav_'+base.el.id+' div').on('click', function() { 
				var hcmapobj = $('#'+base.el.id).highcharts();
				
				if($(this).hasClass('zoomin')) {
					hcmapobj.mapZoom(0.5); // Zoom In	
				}
				else if($(this).hasClass('zoomout')) {
					hcmapobj.mapZoom(2); // Zoom Out
				}
				else if($(this).hasClass('fulextend')) {
					hcmapobj.mapZoom(); // full extend
				}
				
			});
		};

		// - HIghchart Map - call function on Single Click
		base.hcmapSingleClick = function(Obj) { 
			var otps = base.defaults;
			/*var dataForAllUrl = 'http://www.dataforall.org/dashboard/';

			otps.selectedId = Obj.ID_;
			var webReference = (otps.webReference).toLowerCase();
			var redirected_url = '';

			switch (webReference) {
				case "ay_africa":
					 redirected_url = dataForAllUrl+'unfpa/ay_africa/';
				break;
				case "ay":
					redirected_url = dataForAllUrl+'unfpa/ay/index.php/pages/index/'+Obj.ID_;
				break;
				case "fgm":
					 redirected_url = dataForAllUrl+'unfpa/fgm/dashboard.php?country='+Obj.ID_;
				break;
				case "census_global":
					redirected_url = dataForAllUrl+'unfpa/census_global/';
				break;
				case "fp":
					redirected_url = dataForAllUrl+'unfpa/family_planning/';
				break;
			}
			if($.trim(redirected_url) != '') {
				window.location= redirected_url;
			}*/
			// - Call Single click callback
			if(otps.callbackSingleClick!='') eval(otps.callbackSingleClick)(Obj);
		};

		// - HIghchart Map - call function on Double Click
		base.hcmapDoubleClick = function(Obj) { 
			var otps = base.defaults;
			
			// if double click callback is available
			if(otps.callbackDoubleClick!='')	eval(otps.callbackDoubleClick)(Obj);
		};

		// - HIghchart Map - call function to convert map data into highcharts format
		base.hcConvertMapData = function(mapData) {
			var otps = base.defaults;
			var minData = 0;
			var maxData = 0;
			var minmaxdataAr = [];
			var realdata = [];
			otps.progvars.loadedIUSData = mapData;
			if($.trim(mapData)!='') {
				$.each(mapData, function(i,j) {
					//console.log(j);
					realdata.push({'lat':(j['lat']) ? j['lat'] : null,'lng':(j['lng']) ? j['lng'] : null, 'drilldown': i, 'value': (j['all']['b']) ? j['all']['b'] : null, 'c': (j['all']['c']) ? j['all']['c'] : null, 'e': (j['all']['e']) ? j['all']['e'] : null});
					//tpsArr.push(i);
					//asTpsArr.push(i);
					
				});
				//console.log(realdata);
				//console.log(mapData);
				//var m_data = mapData;
				//console.log(m_data);
				//var tpData = mapData[otps.timePeriod];
				//console.log(tpData);
				/*for(i in tpData) {
					//realdata.push({'code':(i) ? i : null, 'drilldown': i, 'value': (tpData[i]) ? tpData[i][0] : null});
					var dt = {'id':(i) ? i : null, 'code':(i) ? i : null, 'value': (tpData[i]) ? tpData[i][0] : null, 'tp':tpData[i][2]};
					if(otps.mapSettings.selectedAreaDataLabel && otps.mapSettings.clickZoomTo && i==otps.selectedId) {
						dt['dataLabels'] = {
							enabled: true
						};
					}
					else if(otps.mapSettings.dataLabels==false){
						dt['dataLabels'] = {
							enabled: false
						};
					}
					
					realdata.push(dt); 

					if(tpData[i]) minmaxdataAr.push(tpData[i][0]);
				}*/

			}

			minData = (minmaxdataAr.length >0) ? Math.min.apply(Math,minmaxdataAr) : 0;
			maxData = (minmaxdataAr.length >0) ? Math.max.apply(Math,minmaxdataAr) : 100;

			return {'dt':realdata, 'min':minData, 'max':maxData};
		};

			

		/****************************************************************
		************************ END HIGHCHARTS MAP *********************
		****************************************************************/

		/* initializing plugin main function */
		base.init();
	};	

	/* Binding method name with the Jquery Plugin */
	$.fn.dfaDrawMap = function (options, callback) { 
		 var obj='';
		 this.each(function () {
			var page, anyMap = $(this).data('dfaDrawMap');
		
			// initialize the slider but prevent multiple initializations
			if ((typeof (options)).match('object|undefined')) { 
				if (!anyMap) {
					obj =(new $.dfaDrawMap(this, options, callback));
				} else {
					anyMap.dfaDrawMap();
				}
				// If options is a number, process as an external link to page #: $(element).anythingSlider(#)
			} else if (/\d/.test(options) && !isNaN(options) && anySlide) {
				page = (typeof (options) === "number") ? options : parseInt($.trim(options), 10); // accepts "  2  "
				// ignore out of bound pages
				if (page >= 1 && page <= anyMap.pages) {
					anyMap.gotoPage(page, false, callback); // page #, autoplay, one time callback
				}
				// Accept id or class name
			} else if (/^[#|.]/.test(options) && $(options).length) {
				anyMap.gotoPage(options, false, callback);
			}
		});

		return { // Preserve the jQuery chainability 
             setData:		function(methodName, newoptions){ 
								if(newoptions.mapSettings) {									
									newoptions.mapSettings = $.extend({}, obj.defaults.mapSettings, newoptions.mapSettings);
								}

								// Toolbar settings
								if(newoptions.toolbar) { 			

									if(newoptions.toolbar.fullscreen) newoptions.toolbar.fullscreen = $.extend({}, obj.defaults.toolbar.fullscreen, newoptions.toolbar.fullscreen);

									if(newoptions.toolbar.tableView) newoptions.toolbar.tableView = $.extend({}, obj.defaults.toolbar.tableView, newoptions.toolbar.tableView);

									if(newoptions.toolbar.print) newoptions.toolbar.print = $.extend({}, obj.defaults.toolbar.print, newoptions.toolbar.print);

									if(newoptions.toolbar.download) newoptions.toolbar.download = $.extend({}, obj.defaults.toolbar.download, newoptions.toolbar.download);

									if(newoptions.toolbar.share) newoptions.toolbar.share = $.extend({}, obj.defaults.toolbar.share, newoptions.toolbar.share);

									newoptions.toolbar = $.extend({}, obj.defaults.toolbar, newoptions.toolbar);
								}



								obj.defaults = $.extend({}, obj.defaults, newoptions);
								eval('obj.'+methodName)(newoptions);
                            }
           };
	};
	
	

}(jQuery));

/*  --------------------------------- End Plugin for Visulization ---------------------------------- */


    function bubbleClickHandler(context) {
	//console.log(context);

	
      return function () {
		  

		 
		   //context.trigger('uiShowDetails', { year:'2015', name: context.point.NAME1_, type: 'country', country: context.point.NAME1_ });
	  }
		//  context.stopPropagation();
		  //	console.log(defaults);
          // Added By Rahul D. @03July15
		  // $("#MapObject").trigger('uiShowDetails', { year:'2015', name: context.point.NAME1_, type: 'country', country: context.point.NAME1_ });
          /*if (typeof(context.attr.year) != 'undefined'){
            context.trigger('uiShowDetails', { year:'2015', name: context.point.NAME1_, type: 'country', country: context.point.NAME1_ });
          }
		  else 
		  {
            context.trigger('uiShowDetails', {name: context.point.NAME1_, type: 'country', country: context.point.NAME1_ });              
          }*/
          // End
    /*  };*/
    }

/*  --------------------------------- Start of making plugin for Table View ---------------------------------- */
/*
* Class function to create table view of selected object
*/
function dfa_tableview() {
	
	// initialize class variables
	this.visTblDvId = 'visTblDvId';
	this.visTblContDvCls = 'dfapi-visTbl-container';
	this.visTblId ='TblDtVw';
	this.objType = '';	
	this.obj = '';
	this.objTblSettings = {};	
		
	this.getDataTableContent = function(objTblParams){
		
		this.objType = objTblParams.objType;
		var visContPrntDivID = $('#'+objTblParams.vizDivId).parent('div').attr('id');
		//call function to get selected visualization object
		this.obj = getSelVisObject(objTblParams.objType, objTblParams.vizDivId);		
		var calledSec = objTblParams.calledSec;
		this.objTblSettings = objTblParams.settingsObj;

		// if called section specified, it means that it get called from hosting application
		if(calledSec===undefined || calledSec=='')
		{
			calledSec = APP_SEC;
		}

		// if selected parent container already contain visualization table content
		if($('#'+visContPrntDivID).find($('div.'+this.visTblContDvCls)).length)
		{
			$('#'+visContPrntDivID).find($('div.'+this.visTblContDvCls)).remove();
		}

		//if visualization parent container found the use its height and width to set in table div
		if(calledSec==APP_SEC && visContPrntDivID && $('#'+visContPrntDivID).length)
		{
			prntHght = $('#'+visContPrntDivID).height();
			//Make chart data table and store in string
			chartTable = '<div id="'+this.visTblDvId+'" class="'+this.visTblContDvCls+'" style="display:block;margin-top:0px;">';
		}else{
			//Make chart data table and store in string
			chartTable = '<div id="'+this.visTblDvId+'" class="'+this.visTblContDvCls+'">';
		}		
		
		//if selected object type is map
		if( this.objType==HC_MAP_TYPE)
		{ 
			//Calling function to get map data in table
			var tableStr = this.obj.getData();
		}
	
		// if table title setting passed
		if(this.objTblSettings.title)
		{
			tblTitleRow = this.setTableTitleRow();
			chartTable += tblTitleRow;
		}
		chartTable += tableStr;
		chartTable += '</div>';

		return chartTable;
	};

	/**
	* Function to set table title style
	*/
	this.setTableTitleRow = function ()
	{
		var tblTtlStr = '', tblTitleStyle = '';
		if(this.objTblSettings.title && this.objTblSettings.title.text)
		{
			if(this.objTblSettings.title.style) 
			{
				// start loop through title style
				$.each(this.objTblSettings.title.style, function (stlAttr,stlAttrVal) {
					tblTitleStyle += stlAttr+':'+stlAttrVal;
				});
			}
			tblTtlStr = '<div class="tblTitle" style="'+tblTitleStyle+'">'+this.objTblSettings.title.text+'</div>';
		}
		return tblTtlStr;
	}


	/**
	* function to get data for table from highchart object
	*/
	this.initHighChartTableData = function() {
		//Highcharts is a global variable		
		var each = Highcharts.each;
		Highcharts.Chart.prototype.getData = function () {

		var trHd = '<thead><tr> <th>&nbsp; </th> </tr></thead>\n';	
		var trData ='<tr><td class="">&nbsp;</td></tr>';

		//if selected object is map
		if(this.userOptions.chart.type=='map')
		{
			trHd = '<thead><tr>\n <th> Area Name</th> <th> Planned Dispersement </th> <th> Allocation </th> <th> Expense </th> </tr></thead>\n';		
			trData ='';
			
			$.each(this.series[0].data, function (dtIndx, dtValArr) {
				
				if(dtValArr.properties)
				{
					//console.log(dtValArr.all);
				trData += '<tr>';
				tdData ='';
				tdData += '<td class="'+dfa_tableview.dataValTdCls(dtValArr.properties.NAME1_)+'">' + dtValArr.properties.NAME1_ + '</td>';
				if($.trim(dtValArr.all))
					{
				
					b = '$'+Highcharts.numberFormat(dtValArr.all.b, 0,',',',');
					c = '$'+Highcharts.numberFormat(dtValArr.all.c, 0,',',',');
					e = '$'+Highcharts.numberFormat(dtValArr.all.e, 0,',',',');
					value= b;
					}
					else if(($.trim(dtValArr.b)) || ($.trim(dtValArr.c)) || ($.trim(dtValArr.e)))
					{
					b = '$'+Highcharts.numberFormat(dtValArr.b, 0,',',',');
					c = '$'+Highcharts.numberFormat(dtValArr.c, 0,',',',');
					e = '$'+Highcharts.numberFormat(dtValArr.e, 0,',',',');
					value = '';
					if(($.trim(dtValArr.b)) == '')
					{
					b= '';
					}	
					if(($.trim(dtValArr.c)) == '')
					{
					c = '';
					}
					if(($.trim(dtValArr.e)) == '')
					{
					e = '';
					}
					
					
					}
				else
					{
					b = '';
					c = '';
					e = '';
					value = '';
					}
				tdData += '<td class="'+dfa_tableview.dataValTdCls(dtValArr.value)+'">' + b+ '</td>'+'<td class="'+dfa_tableview.dataValTdCls(dtValArr.value)+'">' + c+ '</td>'+'<td class="'+dfa_tableview.dataValTdCls(dtValArr.value)+'">' + e+ '</td>';
				trData += tdData + '</tr>\n';
				}
			
			/*	if(dtValArr.properties)
				{
				trData += '<tr>';
				tdData ='';
				tdData += '<td class="'+dfa_tableview.dataValTdCls(dtValArr.properties.NAME1_)+'">' + dtValArr.properties.NAME1_ + '</td>';
				if($.trim(dtValArr.value))
					{
					value = dtValArr.value;
					}
				else
					{
					value = '';
					}
				tdData += '<td class="'+dfa_tableview.dataValTdCls(dtValArr.value)+'">' + value/*dtValArr.value + '</td>';
				//console.log(dtValArr);//return false;
				trData += tdData + '</tr>\n';
				}*/
				
			});	
		}
	
			csv = '<table cellpadding="0" cellspacing="0" width="100%" id="'+dfa_tableview.visTblId+'">' +trHd +' <tbody>'+trData + '</tbody></table>';	
			
			return csv;
		};	
	};	

	/**
	* function to check numeric data value and return its respected class on td
	*
	* @param {String} dataVal data point value to which class eed to be returned
	*/
	this.dataValTdCls = function(dataVal)
	{
		clsName = '';
		dataVal = $.trim(dataVal);
		if(dataVal!==undefined && dataVal!='' && !isNaN(dataVal))
		{
			clsName = 'dfapi-txt-aln-rgt-imp';
		}
		return clsName;
	};

	/**
	* function to enable table sorting functionality
	**/
	this.enableTableSorting = function(visContPrntDivID)
	{
		// if conatiner parent div exists
		if(visContPrntDivID!==undefined || visContPrntDivID!='')
		{
			// enable sorting of table
			$('#'+visContPrntDivID).children($('div#'+this.visTblDvId)).children($('table#'+this.visTblId)).tablesorter();
		}
	};

	//Call function to initialize table data function
	this.initHighChartTableData();	

	/**
	* function to load table sort js script
	**/
	this.loadTableSortJsFile = function()
	{
		(function($){$.extend({tablesorter:new
		function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
		var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[£$€?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);
	};

	//Call function to load table sort js file
	this.loadTableSortJsFile();
	///function to get selected visualization object


getSelVisObject = function(objType, objContDivId){
	
	var visObj ={};
	//if selected object type is map
	if(objType==HC_MAP_TYPE)
	{
		// Getting highchart chart object by container id
		if(window['dfaviz_'+objContDivId]) {
			visObj = window['dfaviz_'+objContDivId];
		}
		else {
			var index=$("#"+objContDivId).data('highchartsChart'); 
			visObj = Highcharts.charts[index];
		}
	}
	
	return visObj;		
}

}
var dfa_tableview = new dfa_tableview();	// create object of table view

/* --------------------------------- end of making plugin for table view ----------------------------------- */


/*  --------------------------------- start of making plugin for print visualization ---------------------------------- */

/*
* Class function to create table view of selected object
*/
function dfa_printvisualization() {	
			
	/**
	 * Print the visualization 
	 *
	 * @param {Object} selVisObj Object of parameters for print function
	 * old params - selObjType, selVisObj, containerParentDivID, objPrintSettings
	 * new parameter object attrs - {'objType':'', 'vizDivId': '', 'calledSec':'', 'settingsObj': {}} 
	 */
	this.print =  function (objPrintParams) {		

		var selObjType = objPrintParams.objType;
		//call function to get selected visualization object
		var selVisObj = getSelVisObject(objPrintParams.objType, objPrintParams.vizDivId);
		if(objPrintParams.calledSec==FS_SEC)
			var containerParentDivID = $('#'+objPrintParams.vizDivId).parent('div').parent('div').attr('id');
		else
			var containerParentDivID = $('#'+objPrintParams.vizDivId).parent('div').attr('id');
		var objPrintSettings = objPrintParams.settingsObj;		

		// if selected visualization map/chart and its container parent div found
		if((selObjType==MAP_TYPE || selObjType==HC_MAP_TYPE) && $('#'+containerParentDivID).length)
		{
			// if selected visulization is map 
			if(selObjType==MAP_TYPE)
			{	
				// call function to add map title and subtitle from obj settings	
				if(objPrintSettings && (objPrintSettings.title || objPrintSettings.subtitle))
					dfa_fullscreen.addMapTitleSubtitle(selVisObj, objPrintSettings);
			}

			var container = $('#'+containerParentDivID).html();		
			var origDisplay = [];
			var origParent = container.parentNode;
			var body = document.body;
			var childNodes = body.childNodes;
			var contWdth = $('#'+containerParentDivID).width();
			var contHght = $('#'+containerParentDivID).height();
			
			var isPrinting = true;		

			for (i=0; i<childNodes.length; i++)
			{
				if(childNodes[i].nodeType === 1) {
					//console.log(i+'   dis   '+$(childNodes[i]).css('display'));
					origDisplay[i] = $(childNodes[i]).css('display');
					$(childNodes[i]).css('display','none')
				}
			}		

			// pull out the chart
			$(body).append('<div id="printVisDv">'+container+'</div>');
			if(typeof dfa_tableview != 'undefined' && typeof dfa_tableview != 'function' && dfa_tableview && dfa_tableview !== undefined){ 	
				$('#printVisDv').children('div.'+dfa_tableview.visTblContDvCls).height('100%');
				$('#printVisDv').children('div.'+dfa_tableview.visTblContDvCls).width('95%');
			}			

			// print
			window.focus(); // focus window
			window.print(); // print on window

			// allow the browser to prepare before reverting
			setTimeout(function () {
				$('#printVisDv').remove();

				// put the chart back in
				$(origParent).append(container);

				// if selected visulization is map then reset size of map svg
				if(selObjType==MAP_TYPE)
				{	
					//call function to remove map title and subtitle of selected map object
					if(objPrintSettings && (objPrintSettings.title || objPrintSettings.subtitle))
						dfa_fullscreen.removeMapTitleSubtitle(selVisObj);

					$('#'+containerParentDivID).find('svg').attr('width',contWdth).attr('height',contHght);
				}

				for (i=0; i<childNodes.length; i++)
				{
					if(childNodes[i].nodeType === 1) {
						//childNodes[i].style.display = origDisplay[i];
						$(childNodes[i]).css('display',origDisplay[i])
					}
				}
				isPrinting = false;

			}, 1000);
		}
	};
}
var dfa_printvisualization = new dfa_printvisualization();	// create object of print

/*  --------------------------------- end of making plugin for print visualization ---------------------------------- */

/*  --------------------------------- start of making plugin for download visualization ---------------------------------- */
/*
* Class function to download visualization
*/
function dfa_dwnldvisualization() {	
		
	/**
	* function to export chart depending on selected option
	*
	* @param {Object} objDwnldParams The object of parameters
	* old params - selObjType, selVisObj, selVisFileName, selFlType, objDwnldSettings
	* new parameter object attrs - {'objType':'chart', 'vizDivId': '', 'fileType':'', 'settingsObj': {}}		
	*/
	this.download = function(objDwnldParams) {

		//call function to get selected visualization object
		var selVisObj = getSelVisObject(objDwnldParams.objType, objDwnldParams.vizDivId);
		var objDwnldSettings = objDwnldParams.settingsObj;
				
		//Set default file type
		var fileType = 'application/pdf';			
		  
		//Set file type as per selected type
		if(objDwnldParams.fileType=='jpeg') fileType = 'image/jpeg';	
		else if(objDwnldParams.fileType=='png') fileType = 'image/png';
		else if(objDwnldParams.fileType=='svg') fileType = 'image/svg+xml';
		  
		//if selected object type is chart
		if(objDwnldParams.objType==HC_MAP_TYPE)
		{	
			selVisScale = 1;
			if(objDwnldParams.objType==HC_MAP_TYPE)
			{	selVisFileName = 'map';
				selVisScale = 2;
			}
			//Set chart title if passed in object objDwnldSettings
			if(objDwnldSettings && objDwnldSettings.title) 
			{
				oldVisTitle = selVisObj.options.title;	
				selVisObj.setTitle(objDwnldSettings.title);
			}
			//Set chart subtitle if passed in object objDwnldSettings
			if(objDwnldSettings && objDwnldSettings.subtitle)
			{
				oldVisSubTitle = selVisObj.options.subtitle;
				selVisObj.setTitle(null, objDwnldSettings.subtitle);
			}

			// Set source on download
			if(objDwnldSettings && objDwnldSettings.source)
			{				
				if(selVisObj.options.labels.items[0]) {
					selVisObj.options.labels.items[0].html = objDwnldSettings.source.text;
				}
				else {
					selVisObj.options.labels = {items: [{html:objDwnldSettings.source.text}]};					
				}
			}

			//get file name as chart title name
			if(typeof selVisObj.title != 'undefined' && typeof selVisObj.title.textStr != 'undefined' && selVisObj.title.textStr && selVisObj.title.textStr !='') {
				selVisFileName = selVisObj.title.textStr; 				
				selVisFileName = selVisFileName.split(" ").join("_"); 
				selVisFileName = selVisFileName.replace(/,/g, "_");	
			}
			
			selVisObj.exportChart({ type: fileType, filename: selVisFileName, scale: selVisScale});

			// reset the label value
			if(objDwnldSettings && objDwnldSettings.source)
			{
				selVisObj.options.labels.items[0].html = '';
			}
			
			// Reset chart title back if passed in object objDwnldSettings
			if(objDwnldSettings && objDwnldSettings.title) 			
				selVisObj.setTitle(oldVisTitle);

			// Reset chart subtitle back if passed in object objDwnldSettings
			if(objDwnldSettings && objDwnldSettings.subtitle) 
				selVisObj.setTitle(null, oldVisSubTitle);
		}
		//if selected object type is map
		else if(objDwnldParams.objType==MAP_TYPE)
		{	
			selVisFileName = 'map';
			//set again svg width by attr property as without this there was issue in export
			$('#'+selVisObj.getMapContainerDivId()+' svg').attr({'width': $('#'+selVisObj.getMapContainerDivId()+' svg').width(),'height': $('#'+selVisObj.getMapContainerDivId()+' svg').height()});
			
			// call function to add map title and subtitle from obj settings	
			if(objDwnldSettings && (objDwnldSettings.title || objDwnldSettings.subtitle))
			{
				dfa_fullscreen.addMapTitleSubtitle(selVisObj, objDwnldSettings);
				//get file name as map title name
				if(objDwnldSettings.title.text) selVisFileName = objDwnldSettings.title.text;
			}
			
			$('div.tooltip').remove();
			var mapSVG = $('#'+selVisObj.getMapContainerDivId()).html();	
			//get export data for map to be exported
			var mapExpData = {
				filename: selVisFileName,
				type: fileType,
				width:  0, // IE8 fails to post undefined correctly, so use 0
				scale:  1,
				svg: mapSVG
			}
			Highcharts.post('http://export.highcharts.com', mapExpData);			
			
			//call function to remove map title and subtitle of selected map object
			if(objDwnldSettings && (objDwnldSettings.title || objDwnldSettings.subtitle))
				dfa_fullscreen.removeMapTitleSubtitle(selVisObj);
		}
		return false;
	};
}
var dfa_dwnldvisualization = new dfa_dwnldvisualization();	// create object of download

/*  --------------------------------- end of making plugin for download visualization ---------------------------------- */

/*  --------------------------------- Start of making plugin for full screen ---------------------------------- */

/*
* Class function to full screen
*/
function dfa_fullscreen() {
	
	// initialize class variables
	this.objType = '';
	this.fullScreenContDivID = 'dfapi-fs-outer-container';	
	this.actBoxContDivCls = 'dfapi-fs-act-box';
	this.shareBoxContDivCls = 'dfapi-share-box';	
	this.obj = '';
	this.containerParentDivIDObj = '';
	this.fullScreenContDivIDObj = '';
	this.objSettings = '';
	this.categories = '';	
	this.tableScreenFlg = false;
	this.containerWidth = '';
	this.containerHeight = '';
	this.titleProperties = {};
	this.subTitleProperties = {};	
	this.legendOldSettings = {};	
	this.legendProperties = {};
	this.actOptSettings = {'iconSize':'medium',
							'actOptSettings': {
								'dtLbl': {'enabled':true}, 
								'tblVw': {'enabled':true}, 
								'dwnld': {'enabled':true}, 
								'prnt': {'enabled':true}
							}		
						};
	this.objShareOptions = {'enabled':false,'url':''};
	this.viewTblDfltFlg = false;
	this.visDivId  = '';
	this.chartObj  = '';
		
	
	/**
	* this function is used to show full screen of selected visulization
	*
	* @param {Object} objFSParams The object of parameters
	* old params - selObjType, visObj, visContPrntDivID, objTblSettings, calledSec
	* new parameter object attrs - {'objType':'', 'vizDivId': '', 'calledSec': '', 'actOptSetObj':{}, 'settingsObj': {}}
	*/
	this.show = function(objFSParams) { 

		//call function to get selected visualization object
		obj = getSelVisObject(objFSParams.objType, objFSParams.vizDivId);	
		containerParentDivID = $('#'+objFSParams.vizDivId).parent('div').attr('id');
		viewTblDfltFlg = objFSParams.tblDefOpt;		
		
		// add new full screen div around passed visulization container parent div 
		$('#'+containerParentDivID).wrap( "<div id='"+this.fullScreenContDivID+"' class='"+this.fullScreenContDivID+"'></div>");
		$('.'+this.fullScreenContDivID).wrap( "<div></div>");
		this.fullScreenContDivIDObj = $('#'+this.fullScreenContDivID);
		this.containerParentDivIDObj = $('#'+containerParentDivID);
		this.objType = objFSParams.objType;
		this.obj = obj;	
		if(objFSParams.actOptSetObj)
			this.actOptSettings = objFSParams.actOptSetObj;
		this.objSettings = objFSParams.settingsObj;
		this.objShareOptions = objFSParams.shareObj;
		this.visDivId = objFSParams.vizDivId;
		//console.log(this.obj);return false;
		
		// if default view of table is on
		if(viewTblDfltFlg)
		{
			//show table only if table object enabled properly
			if(typeof dfa_tableview != 'undefined' && typeof dfa_tableview != 'function' && dfa_tableview && dfa_tableview !== undefined){ 		
				this.viewTblDfltFlg = viewTblDfltFlg;
			}else{
				this.viewTblDfltFlg = false;
				alert('Table can not be enabled without including plugin for same.');
			}			
		}

		// call function to reset visualization status
		this.resetVisStatus(this.objType, this.obj, containerParentDivID);

		//if selected object type is map
		if(this.objType==HC_MAP_TYPE)
		{
			//call function to show map in full screen
			this.showChart();
		}
	
	};

	/**
	* function to show chart in full screen
	*/
	this.showChart = function(){

		//Set variables to use later for undo of full screen

		//Getting visualization container width
		this.containerWidth = this.obj.chartWidth;
		//Getting visualization container height
		this.containerHeight = this.obj.chartHeight;		
		//Getting chart title properties
		this.titleProperties = this.getChartTitleProperties('title', this.obj);
		//Getting chart subtitle properties		
		this.subTitleProperties = this.getChartTitleProperties('subtitle', this.obj);

		//Getting chart original legend settings used to restore legend	
		this.legendOldSettings = this.obj.legend;

		//Getting chart x-axis and y-axis properties
		var xAxisChartProperties = this.getChartAxisproperties(this.obj, 'xAxis', this.objSettings);
		var yAxisChartProperties = this.getChartAxisproperties(this.obj, 'yAxis', this.objSettings);

		//Getting chart data labels properties
		var dataLabelsProperties = this.getChartDataLblProperties(this.obj);
			
		//Getting chart parent container width and height to use later for undo of full screen 
		var containerParentDivWidth =   this.fullScreenContDivIDObj.width();		
		var containerParentDivHeight =   this.fullScreenContDivIDObj.height();			

		/*
		* Jquery Blocking function to masking/unmasking screen when on/off fullscreen
		*/
		$.blockUI({
			//Container Parent div object
			message: dfa_fullscreen.fullScreenContDivIDObj,
			//Deafult css to be used for masking
			css: { 
				top: '0%', left: '', right: '0px',width:'100%',height:'100%',cursor:'auto'
			},
			//When page is blocked to show full screen
			onBlock: function() {		
				
				parentDivId = $(dfa_fullscreen.containerParentDivIDObj).attr('id');
				
				//Call function to add export options
				dfa_fullscreen.addExportOptions();
				
				//Call function to save new chart settings
				dfa_fullscreen.saveChartNewSettings();				
								
				//Set chart size as per as full screen
				if(!dfa_fullscreen.viewTblDfltFlg)				//if by default table view is not on
					dfa_fullscreen.obj.setSize(dfa_fullscreen.fullScreenContDivIDObj.width(),dfa_fullscreen.fullScreenContDivIDObj.height(),true);				
				//Call function to add share options
				if(dfa_fullscreen.objShareOptions.enabled) dfa_fullscreen.addShareOptions();				

				//Call function to view chart data in table format 
				if(dfa_fullscreen.viewTblDfltFlg)				//if by default table view is on
					dfa_fullscreen.viewTable();			
				return false;

			}, 
			// when page is unblocked to hide full screen
            onUnblock: function() {

				parentDivId = $(dfa_fullscreen.containerParentDivIDObj).attr('id');
				
				//Call function to restore chart previous settings
				dfa_fullscreen.restoreChartPreviousSettings(xAxisChartProperties, yAxisChartProperties, dataLabelsProperties);

				//Set container parent div old width and height
				dfa_fullscreen.fullScreenContDivIDObj.width(containerParentDivWidth).height(containerParentDivHeight);		
				
				//Set visualization old size 
				dfa_fullscreen.obj.setSize(dfa_fullscreen.containerWidth, dfa_fullscreen.containerHeight,true);

				//unwrap newly added full screen container div
				dfa_fullscreen.fullScreenContDivIDObj.unwrap();	
				dfa_fullscreen.containerParentDivIDObj.unwrap();	

				return false;
            }                    
        });	
	}
	
	/**
	* function to save new chart settings
	*/
	this.saveChartNewSettings = function(){

		// function to set chart legend properties
		if(this.objSettings.legend)
			dfa_fullscreen.setChartLegendProperties(this.objSettings.legend,'new_settings');	

		//Set chart new title and subtitle passed in object objSettings
		if(this.objSettings.title || this.objSettings.subtitle)
			this.obj.setTitle(this.objSettings.title, this.objSettings.subtitle);

	}

	/**
	* function to restore chart previous settings
	*/
	this.restoreChartPreviousSettings = function(xAxisChartProperties, yAxisChartProperties, dataLabelsProperties){

		// function to restore chart legend old settings
		if(this.legendProperties)
			dfa_fullscreen.setChartLegendProperties(this.legendProperties,'restore_old_settings');

		
		//Set visualization old title and subtitle 
		if(this.objSettings.title || this.objSettings.subtitle)
		{
			
			//if chart title not exists then set to null
			if($.isEmptyObject(this.titleProperties) || this.titleProperties===false || this.titleProperties=='')
				this.titleProperties = {text: ''};

			//if chart sub-title not exists then set to null
			if($.isEmptyObject(this.subTitlePropertie) || this.subTitleProperties===false || this.subTitleProperties=='')
				this.subTitleProperties = {text: ''};

			this.obj.setTitle(this.titleProperties, this.subTitleProperties);
		}

	}

	/**
	* function to get chart title properties
	*
	* @param {String} titleType The title/subtitle of chart
	*/
	this.getChartTitleProperties = function(titleType, obj){ 
		var titlearray = {};
		
		if(obj[titleType])
		{
			$.each(obj[titleType].alignOptions, function(key, value){	
				//console.log(key+' val-->'+ value)
				if($.trim(obj[titleType])!='') titlearray[key] = obj[titleType].alignOptions[key];
				else titlearray[key] = '';
			});	
		}		
	   return titlearray;
	};		

	/**
	* function to set chart legend settings
	*
	* @param {Object} objLgndSettings The new legend setting of chart
	* @param {String} objLgndSetFlg The new/restore legend setting flag of chart
	*/
	this.setChartLegendProperties = function (objLgndSettings, objLgndSetFlg)
	{		
		var newLgndSeeting = {}; 
		newLgndSeeting = dfa_fullscreen.legendOldSettings.options;
		
		//loop for legend setting properties
		$.each(objLgndSettings, function(key, value){	
			
			if(newLgndSeeting[key] !== undefined && $.trim(newLgndSeeting[key])!='' && objLgndSettings[key]) 
			{
				if(objLgndSetFlg=='new_settings')
				dfa_fullscreen.legendProperties[key] = newLgndSeeting[key];
				newLgndSeeting[key] = objLgndSettings[key];
			}else{
				newLgndSeeting[key] = '';
			}
		});		
		dfa_fullscreen.obj.legend.options = newLgndSeeting;
		
		return false;
	};
	
	/**
	* function to get chart axis properties
	*
	* @param {Object} obj The object of chart
	* @param {String} settingType The x/y axis of chart
	* @param {Object} settingsAxis The x/y axis settting of chart
	*/
	this.getChartAxisproperties = function(obj, settingType, settingsAxis){
		var axisPrptArr ={};

		// Start loop through each axis of chart object 
		for(axCnt=0;axCnt<obj.options[settingType].length;axCnt++)
		{
			axisPrptArr[axCnt] = {};			
			$.each(obj[settingType][axCnt].options, function(key, value){
				if($.trim(obj[settingType][axCnt].options)!='') axisPrptArr[axCnt][key] = obj[settingType][axCnt].options[key];
				else axisPrptArr[axCnt][key] =  '';				
			});
		}
		return axisPrptArr;
	};

	/**
	* function to get chart data labels properties
	*
	* @param {Object} obj The object of chart
	*/
	this.getChartDataLblProperties = function(obj) {
		var labelsPrptArr = []; 
		/*if(obj.options.plotOptions && obj.options.plotOptions.series && obj.options.plotOptions.series.dataLabels) {
			labelsPrptObj = obj.options.plotOptions.series.dataLabels;
		}*/
		var series = obj.series;
		
		//Loop through each series of chart
		for(var i=0; i<series.length; i++) {
			var opt = series[i].options.dataLabels;
			labelsPrptArr[i] = opt;
		}
		return labelsPrptArr;
	};

	/**
	* function to get chart table height
	*/
	this.getDtTblHeight = function(){
		//Return table height as 30% of full screen container div height 
		return parseInt(this.fullScreenContDivIDObj.height()*30/100);	
	};	

	/**
	* Function to append table with chart
	*/
	this.viewTable = function ()
	{
		// if table view object exits to create table
		if(dfa_tableview !== undefined && dfa_tableview!='')
		{
			//If table screen flag already not set then show the table with chart
			if(!this.tableScreenFlg)						
			{						
				//Get data table height
				winTblHght = this.getDtTblHeight(); 

				//Set table screen flag to true
				this.tableScreenFlg = true;

				//Call function to get chart data in tabular format
				calledSec = FS_SEC;
				objTblSettings = {};
				chartTable = dfa_tableview.getDataTableContent({'objType':this.objType, 'vizDivId': this.visDivId, 'calledSec': calledSec, 'settingsObj': objTblSettings});

				//if selected object type is chart
				if(this.objType==HC_MAP_TYPE)
				{
					//Set size of chart to adjust its visualization accordingly
					this.obj.setSize(this.fullScreenContDivIDObj.width(),this.fullScreenContDivIDObj.height()-winTblHght,true);	
				}
				
				//Append chart data table with chart container parent div
				this.fullScreenContDivIDObj.append(chartTable);	
				
				// call function to enable sorting of table
				dfa_tableview.enableTableSorting(this.fullScreenContDivID);
				 
				//Show chart table container div
				this.fullScreenContDivIDObj.find($('div.'+dfa_tableview.visTblContDvCls)).height(winTblHght-10).slideDown('slow');
				
			}
			else { //If table screen already set then hide existing

				//Set table screen flag to false
				this.tableScreenFlg = false;
				//Get chart table container div id
				chartTblHght = this.fullScreenContDivIDObj.find($('div.'+dfa_tableview.visTblContDvCls)).height();
				//Chart container parent div height
				chartContHght = this.fullScreenContDivIDObj.height();
				
				//Hide and remove chart table container div
				this.fullScreenContDivIDObj.children('div.'+dfa_tableview.visTblContDvCls).slideUp('slow').hide().remove();	
				
				//if selected object type is chart
				if(this.objType==HC_MAP_TYPE)
				{
					//Set size of chart to adjust its visualization accordingly
					this.obj.setSize(this.fullScreenContDivIDObj.width(),this.fullScreenContDivIDObj.height(),true);	
				}			
			}		
		}
	};

	/**
	* function to add export options
	*/
	this.addExportOptions = function(){
		
		//If export options not exists then append same with full screen container div
		if(this.fullScreenContDivIDObj.find('div.'+this.actBoxContDivCls).length == 0){
			
			//if icon size is small/medium/big
			if(this.actOptSettings.iconSize=='small' || this.actOptSettings.iconSize=='medium' || this.actOptSettings.iconSize=='big')
				optIcnSz = this.actOptSettings.iconSize;
			
			actOptStr  = '<div class="'+this.actBoxContDivCls+'">';
			
			//if data label option enable to show in action options
			if(this.actOptSettings.actOpts.dtLbl.enabled)			
				actOptStr += '<a class="dfapi-fs-icn-'+optIcnSz+' datalbl" href="javascript:void(\'0\');" title="Data Labels"></a>';

			//if table option enable to show in action options
			if(this.actOptSettings.actOpts.tblVw.enabled)			
				actOptStr += '<a class="dfapi-fs-icn-'+optIcnSz+' tbl" href="javascript:void(\'0\');" title="Table"></a>';	
			
			//if download option enable to show in action options
			if(this.actOptSettings.actOpts.dwnld.enabled)			
				actOptStr += '<a class="dfapi-fs-icn-'+optIcnSz+' dwnld" href="javascript:void(\'0\');"></a>';

			//if print option enable to show in action options	
			if(this.actOptSettings.actOpts.prnt.enabled)			
				actOptStr += '<a class="dfapi-fs-icn-'+optIcnSz+' prnt" title="Print" href="javascript:void(\'0\');"></a>';

			actOptStr += '<a class="dfapi-fs-icn-'+optIcnSz+' cls" title="Close" href="javascript:void(\'0\');"></a></div>';
			
			this.fullScreenContDivIDObj.prepend(actOptStr);

			//if download option enable to show in action options
			if(this.actOptSettings.actOpts.dwnld)		
			{
				var export_menu = '<div class="dfapi_contnr-dwnld dfapi-txt-algn-lft">\
				<a class="export" href="javascript:void(\'0\');" type="png">PNG </a><br>\
				<a class="export" href="javascript:void(\'0\');" type="jpeg">JPEG </a><br>\
				<a class="export" href="javascript:void(\'0\');" type="svg">SVG </a><br>\
				<a href="javascript:void(\'0\');" class="export" type="pdf">PDF </a></div>';

				this.fullScreenContDivIDObj.find('div.'+this.actBoxContDivCls).find('a.dfapi-fs-icn-'+optIcnSz+'.dwnld').append(export_menu);
			}
		}
		//If export options already exists then just show them
		else {
			this.fullScreenContDivIDObj.find('div.'+this.actBoxContDivCls).show();
		}
	};

	/**
	* function to add share options
	*/
	this.addShareOptions = function(divId){		
		if(this.fullScreenContDivIDObj.find('div.'+this.shareBoxContDivCls).length == 0) {
			this.fullScreenContDivIDObj.append('<div id="'+this.shareBoxContDivCls+'" class="'+this.shareBoxContDivCls+'"></div>');

			var shareDivID = this.shareBoxContDivCls;
			dfa_share.show(shareDivID, this.objShareOptions);
		}
		else {
			this.fullScreenContDivIDObj.find('div.'+this.shareBoxContDivCls).show();
		}
	};

	/**
	* function to add map title and sub titlein FS HTML
	*/
	this.addMapTtlSubTtl = function()
	{
		mapTtlStr = mapSubTtlStr = '';
		// if map title found then show with map
		if(this.titleProperties.text)
		{
			var ttlstl = '';
			// if map subtitle style found
			if(this.titleProperties.style) 
			{
				$.each(this.titleProperties.style, function( stlKey, stlVal ) {
					ttlstl += stlKey+':'+stlVal+';';					
				});
			}
			// if map subtitle style not found
			else{
				ttlstl = 'font-size:15px;font-family:Verdana;fill:gray;color:gray;';
			}
			
			mapTtlStr = '<div style="'+ttlstl+'">'+dfa_fullscreen.titleProperties.text+'</div>'
		}

		// if map subtitle found then show with map
		if(this.subTitleProperties.text)
		{
			var sbstl = '';
			// if map subtitle style found
			if(this.subTitleProperties.style) 
			{
				$.each(this.subTitleProperties.style, function( stlKey, stlVal ) {
					sbstl = sbstl+stlKey+':'+stlVal+';';					
				});
			}
			// if map subtitle style not found
			else{
				sbstl = 'font-size:9px;font-family:Verdana;fill:gray;color:gray;';
			}
			mapSubTtlStr = '<div style="'+sbstl+'">'+dfa_fullscreen.subTitleProperties.text+'</div>';
		}

		// if map title or subtitle found
		if(mapTtlStr!='' || mapSubTtlStr!='')
		{
			this.fullScreenContDivIDObj.prepend('<div id="dfaos-fs-map-ttl-sbttl" class="dfaos-fs-map-ttl-sbttl">'+mapTtlStr+mapSubTtlStr+'</div>');
		}
	}

	/**
	* function to remove map title and sub title in FS HTML
	*/
	this.removeMapTtlSubTtl = function()
	{
		if($('#dfaos-fs-map-ttl-sbttl').length)
		{
			$('#dfaos-fs-map-ttl-sbttl').remove();
		}
	}

	/**
	* function to reset visualization status before showing in full screen
	*/
	this.resetVisStatus = function(objType, obj, containerParentDivID)
	{
		// if visualization tbl view object found
		if(typeof dfa_tableview != 'undefined' && typeof dfa_tableview != 'function' && dfa_tableview && dfa_tableview !== undefined)		
		{
			// if selected visualization table is already being shown
			if($('#'+containerParentDivID).children('div.'+dfa_tableview.visTblContDvCls).length)
			{
				//get chart container div id if selected object type is chart
				if(this.objType==CHART_TYPE)
				{
					objDvId = obj.options.chart.renderTo;
				}
				//get chart container div id if selected object type is map
				else if(this.objType==MAP_TYPE)
				{
					objDvId = this.obj.getMapContainerDivId();
				}
				visTblContDivID = $('#'+containerParentDivID).children('div.'+dfa_tableview.visTblContDvCls).attr('id');
						
				$('#'+containerParentDivID).find($('#'+visTblContDivID)).remove();
			}
		}
	}

	/**
	* function to close full screen
	*/
	this.closeFullScreen = function()
	{		
		//if table view content elements found
		if(this.tableScreenFlg && this.fullScreenContDivIDObj.children('div.'+dfa_tableview.visTblContDvCls).length>0)
		{	
			this.fullScreenContDivIDObj.children('div.'+dfa_tableview.visTblContDvCls).remove();
		}
		this.tableScreenFlg = false;

		// remove map title and sub title from FS HTML
		if($('#dfaos-fs-map-ttl-sbttl').length)$('#dfaos-fs-map-ttl-sbttl').remove();
		
		// if share view content elements found
		if($('div.'+this.shareBoxContDivCls).length)$('div.'+this.shareBoxContDivCls).remove();

		// if action box content elements found
		if($('div.'+this.actBoxContDivCls).length)$('div.'+this.actBoxContDivCls).remove();
		// Call unmasking
		$.unblockUI();		
	}	

	/**
	* chart table view on full screen
	*/	
	var fsActOptContDv = 'div#'+this.fullScreenContDivID+' > div.'+this.actBoxContDivCls+' >';
	
	$(document).on('click',fsActOptContDv+' a.tbl.dfapi-fs-icn-small,a.tbl.dfapi-fs-icn-medium,a.tbl.dfapi-fs-icn-big', function(){
		dfa_fullscreen.viewTable();	
		return false;
	});
	
	/**
	* function to close full screen view when close icon pressed 
	*/
	$(document).on('click', fsActOptContDv+' a.cls.dfapi-fs-icn-small,a.cls.dfapi-fs-icn-medium,a.cls.dfapi-fs-icn-big', function(){
		//Call function to close full screen
		dfa_fullscreen.closeFullScreen();		
		return false;
	});

	/**
	* function to execute when print button clicked on chart 
	*/
	$(document).on('click', fsActOptContDv+' a.prnt.dfapi-fs-icn-small,a.prnt.dfapi-fs-icn-medium,a.prnt.dfapi-fs-icn-big', function(){ 		
		
		// if print visualization object exits to print
		if(dfa_printvisualization !== undefined && dfa_printvisualization!='')
		{
			// Call function to print visualization	
			calledSec = FS_SEC;
			dfa_printvisualization.print({'objType':dfa_fullscreen.objType, 'vizDivId': dfa_fullscreen.visDivId, 'calledSec':calledSec, 'settingsObj': {}});
		}
	});  

	/**
	* function to execute when user mouse over and out on download downloan icon to show options for same
	*/
	$(document).on('mouseover', fsActOptContDv+' a.dwnld.dfapi-fs-icn-small,a.dwnld.dfapi-fs-icn-medium,a.dwnld.dfapi-fs-icn-big', function(e){
		e.stopPropagation();
		$(this).find('div.dfapi_contnr-dwnld').show();
	});
	$(document).on('mouseleave', fsActOptContDv+' a.dwnld.dfapi-fs-icn-small,a.dwnld.dfapi-fs-icn-medium,a.dwnld.dfapi-fs-icn-big', function(e){
		$(this).find('div.dfapi_contnr-dwnld').hide();
		e.stopPropagation();
	});

	/**
	* event when clicked on data label icon. This will show/hide data label on the visualization
	*/
	$(document).on('click', fsActOptContDv+' a.datalbl.dfapi-fs-icn-small,a.datalbl.dfapi-fs-icn-medium,a.datalbl.dfapi-fs-icn-big', function(){ 		
		//toggle with highchart data label
		if($('.highcharts-data-labels').css('display')!='none') $('.highcharts-data-labels').hide();
		else $('.highcharts-data-labels').show();
	});

	/**
	* function to execute when export option png, jpeg, pdf, svg select
	*/
	$(document).on('click', fsActOptContDv+' a.dwnld.dfapi-fs-icn-small,a.dwnld.dfapi-fs-icn-medium,a.dwnld.dfapi-fs-icn-big a.export', function(){ 

		// if download visualization object exits to download
		if(dfa_dwnldvisualization !== undefined && dfa_dwnldvisualization!='')
		{
			//get file type
			var fileType = $(this).attr('type');	

			// apply title chart or map setting before to download selected visulization
			objDwnldSettings= {};

			//if selected object type is map
			if(dfa_fullscreen.objType==HC_MAP_TYPE)
			{
				//Set file name as map title
				if(this.objSettings && dfa_fullscreen.objSettings.title && dfa_fullscreen.objSettings.title.text) 
					var visFileName = dfa_fullscreen.objSettings.title.text;
				else 
					var visFileName = dfa_fullscreen.getChartTitleProperties('title', dfa_fullscreen.obj); //get old chart title name
			}
	
			//Call function to download visualization
			dfa_dwnldvisualization.download({'objType':dfa_fullscreen.objType, 'vizDivId': dfa_fullscreen.visDivId, 'fileType':fileType, 'settingsObj': objDwnldSettings});
		}
	});

	/**
	* function to execute when esc key prssed
	*/
	$(document).keyup(function(e) {
	   //Key trapping
	   //Esc - 27
		if (e.keyCode == 27) {
			//Call function to close full screen if object exists for same
			if(typeof dfa_fullscreen != 'undefined' ) 		
				dfa_fullscreen.closeFullScreen();		
		}
	   //...... may be inhanced for more key binding later
	});
}

var dfa_fullscreen = new dfa_fullscreen();	// create object of full screen

/*  --------------------------------- End of making plugin for full screen ---------------------------------- */

/*  --------------------------------- Start of making plugin for share functionality ---------------------------------- */
var addthis_share =
{
	// ... members go here
	url: ''
}
/*
* Class function to share
*/
function dfa_shareVis() {
	// initialize class variables
	this.shareContainerDivObj = '';
	this.settingObj = {'enabled':true,'url':'', 'iconSize':'big', 'callback':'', 'onmousehover':true, 'chartType':'map', 'containerParentDivID':'map_render', 'containerDivId':'map'};
	this.settingsArray = [];

	/**
	* This function is used to show Share Icons and their action
	* Available share options are Facebook, Twiter and Email
	*
	* @param {String} shareContainerDiv The string for share container div id
	* @param {Object} settingObj The object of the settings
	*/
	this.show = function(shareContainerDiv, settingObj) {
		
		// Getting web url
		var urlhref = (window.location.href).split('?')[0];
		if(settingObj.url=="") settingObj.url = urlhref;

		this.shareContainerDivObj = $('#'+shareContainerDiv);		
		if($.trim(settingObj)!='') this.settingObj = settingObj;
		
		this.settingObj.url = (settingObj.url!="") ? (settingObj.url.indexOf('?')>-1) ? settingObj.url + '&mode=share' : settingObj.url + '?mode=share' : settingObj.url = "";

		this.settingObj.url += '&cpid='+this.settingObj.containerParentDivID+'&cid='+this.settingObj.containerDivId+'&ctype='+this.settingObj.chartType+'&clb='+this.settingObj.callback;

		this.settingsArray[shareContainerDiv] = this.settingObj;

		if(this.settingObj.enabled==false) return false;
		
		// UI to be rendered in the given share container		
		var ui = '<div class="dfapi_shareIconsContainer" rel="'+shareContainerDiv+'">';
		ui += '<ul class="icons">'
		ui += '<li><a href="javascript:void(0);" class="fb_'+this.settingObj.iconSize+' addthis_button_facebook at300b" title="Facebook"><span></span></a></li>';
        ui += '<li><a href="javascript:void(0);" class="tw_'+this.settingObj.iconSize+' addthis_button_twitter at300b" title="Tweet"><span></span></a></li>';
        ui += '<li><a class="em_'+this.settingObj.iconSize+' addthis_button_email at300b" target="_blank" title="Email"><span></span></a></li>'
        ui += '</ul></div>';
		this.shareContainerDivObj.append(ui);

		// append for if mousehover is true 
		if(this.settingObj.onmousehover) {
			this.shareContainerDivObj.css('position','relative');
			this.shareContainerDivObj.find('.dfapi_shareIconsContainer').attr('style','position:absolute;bottom:0;right:0;width:auto;margin:0;display:none;');

			this.shareContainerDivObj.hover(
				function () { // mouse in
					$('#'+shareContainerDiv).find('.dfapi_shareIconsContainer').animate({opacity:0},0).animate({opacity:1},500).show();
				},
				function () { // mouse out
					$('#'+shareContainerDiv).find('.dfapi_shareIconsContainer').hide();
				}
			);
		}

		// Start loading addthis online library
		// The library will be loaded once on the page.
		if(!window.addthis) { // if addthis lib is not loaded
			$.getScript('http://s7.addthis.com/js/300/addthis_widget.js#pubid=ra-4ee99f091f4402e0',
				function(){
					addthis.init(); //callback function for script loading
				}
			);
		}
		else { // if addthis lib is already loaded
			// initializing addthis
			addthis.init();
			// binding addthis event with the container class
			addthis.toolbox('.dfapi_shareIconsContainer');
		}
		
	};

	/**
	* This function is used to update share URL
	*
	* @param {String} url, the url to be updated in addthis
	*/
	this.updateShareUrl = function(url) { 
		addthis.update('share','url', url);
	};

	/**
	* This function is used to get parameter in url
	*
	* @param {String} string name
	*/
	this.checkQueryStringinURL = function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	/**
	* This function is used to show only shared visulization on the website
	*
	* @param {String} url, the url to be updated in addthis
	*/
	this.showSharedObject = function(url) {  
		try
		{		
			var mode = this.checkQueryStringinURL('mode');
			var cpid = this.checkQueryStringinURL('cpid');
			var cid = this.checkQueryStringinURL('cid');
			var ctype = this.checkQueryStringinURL('ctype');
			var clb = this.checkQueryStringinURL('clb');
			var so = this.checkQueryStringinURL('so');
			if($.trim(so)=='') {
				var objSettings = {};
			}
			else {
				var objSettings = $.parseJSON(decodeURIComponent(so));
			}
			if(mode=='share' && cpid!='' && cid!='' && ctype!='') {
				//$('#'+cid).find('.'+icls).trigger('click');

				var objShareOptions = {'enabled':true, 'url':window.location.href.split('mode=share')[0], 'iconSize':'big', 'callback':clb, 'onmousehover':false, 'containerParentDivID':cpid, 'containerDivId':cid, 'chartType':ctype};

				// - CALL FULLVIEW PLUGIN
				var dfaFSInputObj = {
					'objType': ctype, 
					'vizDivId': cid, 
					'tblDefOpt': true, 
					'shareObj': objShareOptions, 
					'settingsObj': objSettings,
					'actOptSetObj': {
						'iconSize': 'big',
						'actOpts': {
							'dtLbl': {'enabled': true}, 
							'tblVw': {'enabled': true}, 
							'dwnld': {'enabled': true}, 
							'prnt':	 {'enabled': true}
						}
					}
				}; 
				
				dfa_fullscreen.show(dfaFSInputObj);

			}	
		
		}
		catch (err){}
	};	

}

// Define an object for share visulization
var dfa_share = new dfa_shareVis();

// Click event on share icons
$(document).on('click', '.dfapi_shareIconsContainer li', function() {	
	var settingsArray = dfa_share.settingsArray;
	var p = $(this).parent().parent().attr('rel');

	// Script will be called for callback if it is set.
	// Callback function will return the URL that to be shared only
	if($.trim(settingsArray[p].callback)!='') { 
		// if callback is function then execute
		if(jQuery.isFunction(settingsArray[p].callback)) shareUrl = settingsArray[p].callback(p);
		else shareUrl = eval(settingsArray[p].callback)(p);
		settingso = ($.trim(shareUrl)!='') ? JSON.stringify(shareUrl.settingso) : '';
		shareUrl = ($.trim(shareUrl)!='') ? shareUrl.url : '';
		
		if($.trim(shareUrl)=='') shareUrl = window.location.href;
		shareUrl = (shareUrl!="") ? (shareUrl.indexOf('?')>-1) ? shareUrl + '&mode=share' : shareUrl + '?mode=share' : shareUrl = "";
		shareUrl += '&cpid='+settingsArray[p].containerParentDivID+'&cid='+settingsArray[p].containerDivId+'&ctype='+settingsArray[p].chartType+'&clb='+settingsArray[p].callback+'&so='+encodeURIComponent(settingso);
	}
	else {
		shareUrl = settingsArray[p].url;
	}
	
	addthis_share.url = shareUrl; 
	addthis.update('share','url', shareUrl);
});
/*  --------------------------------- End of making plugin for share functionality ---------------------------------- */

	//--------------------------------------ON CHANGE OF IUS

function IUSNodeClick(obj)
	{
	console.log(mapObj);
	mapObj.setData('setIUS', {'IUSGId':obj, 'title':'.', 'subtitle': ''});
	//rankObj.setData('setIUS', {'IUSGId':obj.id, 'title':'.', 'subtitle': ''});
	}

function showTimePeiodText(otps)
	{
	console.log(otps);
	base.renderMapHighcharts(otps.mapFilePath, otps.IUSGId, otps.timePeriod, callback);
	}


	
