'use strict';

define(function (require) {
    // Added by Rahul D. @13Jan16, to set default year as per client request
    
    var defineComponent = require('flight/lib/component');

    var moment = require('moment');

    var Vue = require('vue');
    var vueDropdown = require('component/vue-dropdown');

    var flowModel = require('data/flow');

    var donorInfo = require('text!template/donor-info.html');
    var expenseInfo = require('text!template/expense-info.html');

    var years = $.ajax({
        url: TEMPLATE_PATH + '/json/flow/sankey_years.json',
        dataType: 'json'
    });

    var entities_count = $.ajax({
        url: TEMPLATE_PATH + '/json/summary/summary_total.json',
        dataType: 'json'
    });

    var num_countries_heap = {};
    var today = new Date(),
    current_year = today.getFullYear();

    function FlowSentence() {
        this.update = function (ev, data) {
            var self = this;
            entities_count.done(function (counts_data) {
                var selected_year = data.year;
                flowModel(data.year).done(function (data) {
                    self.sentence.$data.donations = data.donations;
                    self.sentence.$data.expenses = data.expenses;
                    self.sentence.$data.sectors = data.sectors;
                    if ((counts_data.years).length > 0) {
                        for (var i = 0; i < (counts_data.years).length; i++) {
                            num_countries_heap[counts_data.years[i].year] = counts_data.years[i].num_countries;
                        }
                    }
                    self.sentence.$data.country_count = num_countries_heap[selected_year];
                });
            });
        };

        this.after('initialize', function () {

            var self = this;

            years.done(function (data) {
                if ((data.years).length > 2) data.years.pop() // remove previous 2 years from years @client suggested
                if ((data.years).length > 2) data.years.pop() // remove previous 2 years from years @client suggested

                var current = data.years[data.current_year_index],
          years = data.years.map(function (v) { return { value: v, text: v }; });
                // Added by Rahul D. @13Jan16, to set default year as per client request
                if (typeof(DEFAULT_SELECTED_YEAR) != "undefined" && DEFAULT_SELECTED_YEAR !="") {
                    current = DEFAULT_SELECTED_YEAR;
                }
                self.sentence = new Vue({
                    el: self.node,
                    template: '#sentence-template',
                    data: {
                        year: {
                            isOpen: false,
                            display: current,
                            selected: current,
                            options: years
                        }
                    },
                    components: {
                        'year-dropdown': vueDropdown.extend({
                            methods: {
                                setSelected: function (year) {
                                    this.$data.isOpen = false;
                                    this.$data.display = year;
                                    self.trigger('uiYearChanged', { year: Number(year) });
                                }
                            }
                        })
                    }
                });

                $('.donor.info').append(donorInfo);
                $('.sector.info').append($(expenseInfo).data('placement', 'left'));
                $('.info a').popover();
                self.on(document, 'uiYearChanged', self.update);
                self.trigger('uiYearChanged', { year: current });
            });

        });
    }

    return defineComponent(FlowSentence);
});
