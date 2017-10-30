define(function (require) {

    'use strict';

    /**
    * Module dependencies
    */

	var filter_for = typeof (SEARCH_FOR) != 'undefined' ? SEARCH_FOR : "";
	if(filter_for == 'donor') {
		var donor_obj = typeof (DONORS_OBJ) != 'undefined' ? DONORS_OBJ : "";
		var DONOR_SEARCH_VAL = typeof (SEARCH_VALUE) != 'undefined' ? SEARCH_VALUE : "";
		var filter_val = donor_obj[DONOR_SEARCH_VAL];
	}
	else {
		var filter_val = typeof (SEARCH_VALUE) != 'undefined' ? SEARCH_VALUE : "";
	}
	
	var country_filter_val = typeof (COUNTRY_SEARCH_VALUE) != 'undefined' ? COUNTRY_SEARCH_VALUE : "";
    var moment = require('moment');
    var _ = require('lodash');

    var AidTable = require('component/aidTable');
    var BubbleMap = require('component/bubbleMap');
    var Details = require('component/details');
    var Sentence = require('component/sentence');
    var Tabs = require('component/tabs');
    var lastUpdated = require('text!template/last-updated.html');
    var Vue = require('vue');
    var iatiData = require('data/iatiData');

    // Install vue filters
    require('component/vue-filters');

    /**
    * Module exports
    */

    return initialize;

    /**
    * Module function
    */

    function initialize() {
		
		if(filter_for == 'programme') {
			
			 var get_measure = "e";
		}
		else if(filter_for == 'donor') {
			 var get_measure = "c";
		}
		else {
			var get_measure = filter_for != "" ? "e" : "b";
		}
		
        var get_filter = 'all';
        var get_country = 'all';
		
        if (filter_for == 'country' && filter_val != '') {
            get_country = filter_val;
            get_measure = "b";
        } else if (filter_for == 'programme' && filter_val != '') {
            get_filter = filter_val;
			if (country_filter_val != '') {
				get_country = country_filter_val;
			}
        } else if (filter_for == 'donor' && DONOR_SEARCH_VAL != ''){
			get_filter = filter_val;
			if (country_filter_val != '') {
					get_country = country_filter_val;
				}
		}
		
        var year = moment().year();
        // Added by Rahul D. @13Jan16, to set default year as per client request
        if (typeof (DEFAULT_SELECTED_YEAR) != "undefined" && DEFAULT_SELECTED_YEAR != "") {
            year = DEFAULT_SELECTED_YEAR;
        }
        var defaults = {
            year: year,
            measure: get_measure,
            filter: get_filter,
            country: get_country
        };
	
        Tabs.attachTo('.tabs');
        Sentence.attachTo('#sentence', defaults);
        BubbleMap.attachTo('#map', defaults);
        AidTable.attachTo('#aid', _.extend({ pcr: 'all' }, defaults));
        Details.attachTo('#details', defaults);

        iatiData.metadata(year, 'all', 'b', 'all').done(function (data) {
            new Vue({
                el: '.last-updated',
                template: lastUpdated,
                data: { updated: data.asOf }
            });
        });
    }

});
