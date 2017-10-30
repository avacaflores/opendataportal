'use strict';
var countryIndicators = [];
define(function (require) {
    var _ = require('lodash');
    var d3 = require('d3');
    var moment = require('moment');

    var CountryModel = require('data/country');
    var PCRModel = require('data/pcr');
    var OutputModel = require('data/output');

    var url = TEMPLATE_PATH + '/json/table/';

    var pcrs = $.ajax({
        url: url + 'pcr_ids.json',
        dataType: 'json'
    });

    var downloads = $.Deferred();

    $.ajax({
        url: url + 'downloads.json',
        dataType: 'json',
        success: function (data) {
            downloads.resolve(data);
        },
        fail: function () {
            downloads.resolve([]);
        }
    });

    function notEmpty(d) {
        return ((d.b && d.b !== 0) ||
      (d.c && d.c !== 0) ||
      (d.e && d.e !== 0));
    }

    function request(year, country) {
        var key = [year, country.replace(/[\s,\/]/g, '-')].join('/');

        return $.ajax({
            url: url + key + '.json',
            dataType: 'json'
        });
    }

    var IATIData = {};

    IATIData.countries = function (year, measure, filter) {
        var country = ((measure === 'c') ? 'dnr' : 'sct'),
      p = request(year, country).then(function (data) {
          return data.map(function (d) {
              return new CountryModel(d, measure, filter);
          }).filter(notEmpty);
      });

        return p;
    };

    IATIData.pcrs = function (year, country, measure, filter) {
        // p is the promise of the data returned
        var p = request(year, country).then(function (data) {

            // Data is a list of outputs that need to be grouped by PCR ID.
            var outputs = d3.nest()
          .key(function (d) { return d.pcr_id; })
          .rollup(function (outputs) {

              return {
                  pcr_id: outputs[0].pcr_id,
                  sdt: outputs[0].sdt,
                  edt: outputs[0].edt,
                  outputs: outputs
              };

          })
          .entries(data.outputs);

            // Return a promise for the array of PCRModels because we have to
            // load the PCR names separately.
            return pcrs.then(function (names) {

                // Returns an array of PCRModel objects
                return outputs.map(function (d) {
                    var id = d.key,
            pcr = d.values;

                    pcr.name = names.hasOwnProperty(id) ? names[id][0] : id;

                    return new PCRModel(pcr, measure, filter);
                }).filter(notEmpty);

            });

        });

        return p;
    };

    IATIData.outputs = function (year, country, pcr, measure, filter) {
        var outputNames = request(year, 'output_names');

        var p = request(year, country).then(function (data) {

            // Exclude outputs not of this PCR
            var outputs = data.outputs.filter(function (d) {
                return d.pcr_id === pcr;
            });

            // Promise an array of OutputModel objects pending the retrieval of
            // output names.
            return outputNames.then(function (names) {

                // Once the output names have been loaded, generate an array of
                // OutputModel objects.
                return outputs.map(function (o) {
                    o.name = names[o.otc_id];

                    return new OutputModel(o, measure, filter);
                }).filter(notEmpty);

            });

        });

        // Promise an array of OutputModel objects.
        return p;
    };

    IATIData.metadata = function (year, country, measure, filter) {
        var all = (measure === 'c') ? 'dnr' : 'sct';

        if (country === 'all') {
            country = all;
        }

        var filterPromise = request(year, country),
      countryPromise = request(year, all);

        var p = $.when(filterPromise, countryPromise).then(function (filterArgs, countryArgs) {
            var total = 0,
        asOf = null,
        countries = [],
        filters = [];

            var filterList = filterArgs[0];

            if (country !== all) {
                filterList = filterList.outputs;
            }

            // year + country define which filters are available.
            filterList.forEach(function (c) {
                _.forOwn(c[all], function (v, k) {
                    filters.push(k);
                });
            });

            countryArgs[0].forEach(function (c) {
                // year + filter define which countries are available.
                if (filter === 'all' || c[all].hasOwnProperty(filter)) {
                    countries.push(c.name);
                }

                var recentAsOf;

                // Update totals based on country + filter + measure.
                if (country === all || c.name === country) {
                    if (filter === 'all') {
                        total += c.all[measure];
                        recentAsOf = moment(c.all.as_of, 'MM-DD-YY');
                    } else if (c[all].hasOwnProperty(filter)) {
                        total += c[all][filter][measure];
                        recentAsOf = moment(c[all][filter].as_of, 'MM-DD-YY');
                    }
                }

                // Use the most recent date in the data set for the "as of" date.
                if (!asOf || (recentAsOf && asOf.isBefore(recentAsOf))) {
                    asOf = recentAsOf;
                }
            });

            return {
                total: total || 0,
                asOf: typeof (asOf) != 'undefined' ? asOf.format() : '',
                countries: countries,
                filters: _.uniq(filters)
            };
        });

        return p;
    };

    IATIData.pcrName = function (pcrid) {
        return pcrs.then(function (names) {
            return {
                id: pcrid,
                name: names[pcrid][0]
            };
        });
    };

    IATIData.details = function (options) {
        var links = $.Deferred(),
      p;

        if (options.country === 'all') {
            options.country = options.name;
        }

        $.ajax({
            url: url + 'links/' + options.country.replace(/[\s,\/]/g, '-') + '.json',
            dataType: 'json',
            success: function (data) { links.resolve(data); },
            error: function (data) { links.resolve([]); }
        });

        switch (options.type) {
            case 'pcr': // handle pcr-popup-triggered
                options.measure = typeof (options.measure) != 'undefined' ? options.measure : 'b'; // Added uiFilterChanged, uiMeasureChanged @ Rahul D. on 15July15  
                options.filter = typeof (options.filter) != 'undefined' ? options.filter : 'all'; // Added uiFilterChanged, uiMeasureChanged @ Rahul D. on 15July15 
                p = IATIData.pcrs(options.year, options.country, options.measure, options.filter)
        .then(function (pcrs) {
            var target;

            pcrs.forEach(function (p) {
                if (options.name === p.name) {
                    target = p;
                    return false;
                }
            });

            return target;
        });
                break;

            case 'output': // handle output-popup-triggered
                options.measure = typeof (options.measure) != 'undefined' ? options.measure : 'b'; // Added uiFilterChanged, uiMeasureChanged @ Rahul D. on 15July15  
                options.filter = typeof (options.filter) != 'undefined' ? options.filter : 'all'; // Added uiFilterChanged, uiMeasureChanged @ Rahul D. on 15July15 
                p = IATIData.outputs(options.year, options.country, options.pcr, options.measure, options.filter)
        .then(function (outputs) {
            var target;

            outputs.forEach(function (o) {
                if (options.name === o.name) {
                    target = o;
                    return false;
                }
            });
            var countryName = options.country.replace(/[\s,\/]/g, '-');
            var indicatorData = [];
            //console.log(countryIndicators);
            if(typeof countryIndicators[countryName] === 'undefined') {
                // does not exist
                $.ajax({
                    url: url + 'indicators/' + countryName + '.json',
                    dataType: 'json',
                    async : false,
                    success: function (data) { 
                        countryIndicators[countryName] = data; 
                    },
                    error: function (data) { /*indicatorData = []; */ }
                });
            }
            else {
                // does exist
                //indicatorData = countryIndicators[countryName];                
            }
            //console.log(countryIndicators);
            //console.log(options.id);
            target.id = options.id;
            if(typeof countryIndicators[countryName][options.id] === 'undefined') {
                target.indicatorData = null;                
            }else{
                target.indicatorData = countryIndicators[countryName][options.id];
                if(target.indicatorData.length > 0){
                    target.headlinestatement = target.indicatorData[0].headline;
                }
                //console.log(target.indicatorData);
            }
            target.name = target.description;
            console.log(target);

            return target;
        });
                break;

            default: // handle countries-popup-triggered
                options.measure = typeof (options.measure) != 'undefined' ? options.measure : 'b'; // Added uiFilterChanged, uiMeasureChanged @ Rahul D. on 15July15  
                options.filter = typeof (options.filter) != 'undefined' ? options.filter : 'all'; // Added uiFilterChanged, uiMeasureChanged @ Rahul D. on 15July15 
                p = IATIData.countries(options.year, options.measure, options.filter)
        .then(function (countries) {
            var target;

            countries.forEach(function (c) {
                if (c.name === options.name) {
                    target = c;
                    return false;
                }
            });

            return target;
        });
                break;
        }

		var flag_name = options.country;
		flag_name = flag_name.replace(/ /g,"-");
		flag_name = flag_name.replace(/'/g,"");
		var flag_path = TEMPLATE_PATH + '/images/flag/'+flag_name+'-Flag-24.png'
		var flag_status = false;
		$.ajax({
			url: flag_path,
			type:'HEAD',
			async: false,
			error: function() 
			{
				//file not exists
			},
			success: function()
			{
				flag_status = true;
			   //file exists
			}
		});

        return $.when(p, downloads, links).then(function (details, downloads, links) {
            // Make sure we store the country name on the object in the same place
            // regardless of what type of details we're fetching.
            details.country = options.country;
			
			if(flag_status == true) {
				details.country_flag = flag_name; //options.country;
			}
			else {
				details.country_flag = 'no_flag';
			}

            details.year = options.year;

            details.downloads = downloads[options.country];
            //details.links = links;
            
            var document_links = null;
            if(links.document_links){
                document_links = links.document_links;            
                delete links.document_links;
            }          
            details.links = null;
            details.document_links = null;
            details.links = links;
            details.document_links = document_links;

            return details;
        });
    };

    return IATIData;
});
