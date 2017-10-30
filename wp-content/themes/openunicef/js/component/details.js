'use strict';

define(function (require) {
    var defineComponent = require('flight/lib/component');

    var _ = require('lodash');
    var Vue = require('vue');

    var barChart = require('component/barChart');
    var iatiData = require('data/iatiData');

    var PCRModel = require('data/pcr');
    var OutputModel = require('data/output');

    function details() {
        this.attributes({
            year: null,
            measure: null,
            filter: null
        });

        this.show = function (ev, data) {
            var self = this;
            _.extend(this.attr, data);
            if (typeof (this.attr.measure) != 'undefined' && this.attr.measure == 'c') { // Handle Funds Available tab, By Rahul D. @15July15
                iatiData.details(this.attr).done(function (details) { // ploting-bars
                    details.c = (typeof (details.c) != 'undefined' && !isNaN(details.c)) ? details.c : 0;
                    self.details.$data = details;
                    barChart({
                        el: self.$node.find('.bar-chart').empty()[0],
                        domain: [0, Math.max(details.c)],
                        width: 540,
                        height: 23,
                        margin: { top: 0, right: 8, bottom: 15, left: 250 },
                        ydomain: ['c'],
                        axis: { y: { tickSize: 0, tickFormat: function (d) {
                            switch (d) {
                                case 'c':
                                    return 'Allocation';
                            }
                        }
                        }
                        },
                        data: [
                            { measure: 'c', amount: Math.floor(details.c) }
                          ]
                    });
                    self.$node.modal('show');
                }); // end-iatiData.details            
            } else if (typeof (this.attr.measure) != 'undefined' && this.attr.measure == 'e') { // Handle Funds Spent tab, By Rahul D. @15July15
                iatiData.details(this.attr).done(function (details) { // ploting-bars
                    details.e = (typeof (details.e) != 'undefined' && !isNaN(details.e)) ? details.e : 0;
                    self.details.$data = details;
                    barChart({
                        el: self.$node.find('.bar-chart').empty()[0],
                        domain: [0, Math.max(details.e)],
                        width: 540,
                        height: 23,
                        margin: { top: 0, right: 8, bottom: 15, left: 250 },
                        ydomain: ['e'],
                        axis: { y: { tickSize: 0, tickFormat: function (d) {
                            switch (d) {
                                case 'e':
                                    return 'Expense';
                            }
                        }
                        }
                        },
                        data: [
                            { measure: 'e', amount: Math.floor(details.e) }
                          ]
                    });
                    self.$node.modal('show');
                }); // end-iatiData.details                
            } else { // Handle Funds Overview tab
                iatiData.details(this.attr).done(function (details) { // ploting-bars, By Rahul D. @15July15
                    details.b = (typeof (details.b) != 'undefined' && !isNaN(details.b)) ? details.b : 0;
                    details.c = (typeof (details.c) != 'undefined' && !isNaN(details.c)) ? details.c : 0;
                    details.e = (typeof (details.e) != 'undefined' && !isNaN(details.e)) ? details.e : 0;
                    self.details.$data = details;
                    barChart({
                        el: self.$node.find('.bar-chart').empty()[0],
                        domain: [0, Math.max(details.b, details.c, details.e)],
                        width: 540,
                        height: 23,
                        margin: { top: 0, right: 8, bottom: 15, left: 250 },
                        axis: { y: { tickSize: 0, tickFormat: function (d) {
                            switch (d) {
                                case 'c':
                                    return 'Allocation';
                                case 'e':
                                    return 'Expense';
                                default:
                                    //return 'Planned Disbursement';
                                    return 'Planned Budget';
                            }
                        }
                        }
                        },
                        data: [
                            { measure: 'b', amount: Math.floor(details.b) },
                            { measure: 'c', amount: Math.floor(details.c) },
                            { measure: 'e', amount: Math.floor(details.e) }
                          ]
                    });
                    self.$node.modal('show');
                }); // end-iatiData.details            
            }
        };

        this.after('initialize', function () {
            this.on(document, 'uiYearChanged uiCountryChanged uiPCRChanged uiFilterChanged uiMeasureChanged', function (ev, data) { // Added uiFilterChanged, uiMeasureChanged @ Rahul D. on 15July15 
                _.extend(this.attr, data);
            });

            this.on(document, 'uiShowDetails', this.show);

            this.details = new Vue({
                el: this.node,
                data: {}
            });

        });
    }

    return defineComponent(details);

});
