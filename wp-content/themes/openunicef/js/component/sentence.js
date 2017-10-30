'use strict';

define(function (require) {
    var defineComponent = require('flight/lib/component');

    var _ = require('lodash');
    var moment = require('moment');
    var d3 = require('d3');
    var Vue = require('vue');

    var dropdown = require('component/vue-dropdown');

    var withMeasure = require('mixin/withMeasure');
    var withFilter = require('mixin/withFilter');
    var withCountry = require('mixin/withCountry');
    var withYear = require('mixin/withYear');

    var iatiData = require('data/iatiData');

    var donorInfo = require('text!template/donor-info.html');
    var expenseInfo = require('text!template/expense-info.html');

    var dataRoot = TEMPLATE_PATH + '/json/table/';

    var years = $.ajax({
        url: dataRoot + 'years.json',
        dataType: 'json'
    });

    var sectorDonorNames = $.ajax({
        url: dataRoot + 'donor_and_sector_ids.json',
        dataType: 'json'
    });

    var donorGroups = $.ajax({
        url: dataRoot + 'donor_categories.json',
        dataType: 'json'
    }).then(function (donorCategories) {
        var reversed = {};

        _.forOwn(donorCategories, function (donors, category) {
            donors.forEach(function (donor) {
                reversed[donor] = category;
            });
        });

        return reversed;
    });

    function option(value, text) {
        return {
            value: value,
            text: text || value
        };
    }

    function Sentence() {
        this.attributes({
            country: 'all',
            filter: 'all'
        });

        this.setYear = function (year) {
            this.trigger('uiYearChanged', { year: year });
        };

        this.setCountry = function (country) {
            this.trigger('uiCountryChanged', { country: country });
        };

        this.setFilter = function (filter) {
            this.trigger('uiFilterChanged', { filter: filter });
        };

        this.initSentence = function () {
            this.sentence = new Vue({
                template: '#sentence-' + this.attr.measure,
                data: this.vm,
                filters: {
                    date: function (value) {
                        return moment(value).format('MMM YYYY');
                    }
                },
                components: {
                    'year-dropdown': this.yearDropdown,
                    'country-dropdown': this.countryDropdown,
                    'sector-dropdown': this.sectorDropdown,
                    'donor-dropdown': this.donorDropdown
                }
            });

            this.sentence.$appendTo(this.node);
            $('.donor.info').append($(donorInfo).data('placement', 'left'));
            $('.sector.info').append($(expenseInfo).data('placement', 'left'));
            $('.info a').popover();

            this.fetch();
        };

        this.updateView = function () {
            var now = moment(),
        current = (now.year() === Number(this.attr.year));

            this.vm.year.isOpen = false;
            this.vm.year.selected = this.attr.year;
            this.vm.year.display = this.attr.year;

            this.vm.filter.selected = this.attr.filter;
            this.vm.filter.isOpen = false;

            this.vm.country.selected = this.attr.country;
            this.vm.country.isOpen = false;

            switch (this.attr.measure) {
                case 'c':
                    this.vm.verb = !current ? 'committed' :
        this.vm.filter.selected === 'all' ? 'have committed' : 'has committed';
                    break;

                case 'e':
                    this.vm.verb = current ? 'has spent' : 'spent';
                    break;

                default:
                    this.vm.verb = current ? 'plans' : 'planned';
                    break;
            }
        };

        this.fetch = function () {
            var measure = this.attr.measure,
        vm = this.vm,
        attr = this.attr;
            // remove previous 2 years from years only for "spent tab" @unicef team suggested By Rahul D. @170615
            if (measure == 'e') {
                var now = moment().year();
                var spent_options = [];
                years.done(function (years) {
                    spent_options = years.filter(function (d) { return d <= now; });
                    spent_options.sort(function (a, b) { return (a < b) ? 1 : (a > b) ? -1 : 0; });

                    if ((spent_options).length > 2) spent_options.pop()
                    if ((spent_options).length > 2) spent_options.pop()

                    vm.year.options = spent_options.map(function (d) {
                        return { text: d, value: d };
                    });
                });
            } else {
                years.done(function (years) {
                    var now = moment().year(),
                    options = years.filter(function (d) { return d <= now; });
                    options.sort(function (a, b) { return (a < b) ? 1 : (a > b) ? -1 : 0; });
                    vm.year.options = options.map(function (d) {
                        return { text: d, value: d };
                    });
                });
            }
            // close changes
            this.updateView();

            iatiData.metadata(this.attr.year,
          this.attr.country,
          this.attr.measure,
          this.attr.filter)
        .done(function (data) {
            function compareOptions(a, b) {
                return (a.text < b.text) ? -1 :
            (b.text < a.text) ? 1 : 0;
            }

            var nCountries = data.countries.length;

            vm.asOf = data.asOf;
            vm.amount = Math.floor(data.total);

            // Update the country dropdown.
            var options = data.countries.map(function (d) {
                return option(d);
            });

            options.sort(compareOptions);
            vm.country.options = [{ value: 'all', text: 'All countries'}].concat(options);

            vm.country.display = (attr.country === 'all') ?
          (nCountries + ' countr' + (nCountries === 1 ? 'y' : 'ies')) :
          attr.country;

            // Update the filters dropdown.
            $.when(sectorDonorNames, donorGroups).done(function (names, groups) {
                var n = data.filters.length,
              filterType = attr.measure === 'c' ? 'donors' : 'sectors',
                //unit = attr.measure === 'c' ? 'resource partner' : 'sub-sector', // By Rahul D.@05Jun15
              unit = attr.measure === 'c' ? 'resource partner' : 'programme area', // By Rahul D.@05Jun15
              plural = unit + 's';

                // Extract the actual data objects from the arguments arrays.
                names = names[0];

                if (filterType === 'sectors') {
                    var options = data.filters.filter(function (sector) { return sector !== 'all'; })
                .map(function (sector) {
                    return option(sector, names[filterType][sector]);
                });

                    options.sort(compareOptions);

                    vm.filter.options = [{ value: 'all', text: ('All ' + plural)}].concat(options);
                    vm.filter.optgroups = [];
                } else {
                    var optGroups = {},
                ungrouped = [{ value: 'all', text: ('All ' + plural)}];

                    data.filters.filter(function (donor) { return donor !== 'all'; })
                .forEach(function (donor) {
                    var category = groups[donor] || '';

                    if (category === '') {
                        ungrouped.push(option(donor, names[filterType][donor]));
                    } else {
                        if (!optGroups.hasOwnProperty(category)) {
                            optGroups[category] = [];
                        }

                        optGroups[category].push(option(donor, names[filterType][donor]));
                    }
                });

                    vm.filter.options = ungrouped;
                    vm.filter.optgroups = optGroups;
                }

				//04OCT16 - Vijay Purohit
				//Work for map page -> Programme area count in sentence section for "Spent" tab & "Funds Available" tab.
				//console.log(attr.country);
                //console.log(attr.year);
                //console.log("-----");
                //console.log(attr.measure);
                //console.log(attr.filter);
                if(attr.country != 'all'){
                    vm.filter.display = (attr.filter === 'all') ?
                    (n-1) + ' ' + (n === 1 ? unit : plural) : names[filterType][attr.filter];
                }else{
                    vm.filter.display = (attr.filter === 'all') ?
                    n + ' ' + (n === 1 ? unit : plural) : names[filterType][attr.filter];
                }
            });
        });
        };

        this.after('initialize', function () {
            var self = this;

            this.vm = {
                verb: 'plans',
                preposition: 'in',
                amount: 0,
                year: {
                    isOpen: false,
                    display: moment().format('MMM YYYY'),
                    selected: this.attr.year,
                    options: []
                },
                country: {
                    isOpen: false,
                    display: '',
                    selected: 'all',
                    searchable: true,
                    pattern: '',
                    options: []
                },
                filter: {
                    isOpen: false,
                    display: '',
                    selected: 'all',
                    searchable: true,
                    pattern: '',
                    options: []
                }
            };

            years.done(function (years) {
                var now = moment().year(),
                options = years.filter(function (d) { return d <= now; });
                options.sort(function (a, b) { return (a < b) ? 1 : (a > b) ? -1 : 0; });
                self.vm.year.options = options.map(function (d) {
                    return { text: d, value: d };
                });
            });

            this.yearDropdown = dropdown.extend({
                methods: {
                    setSelected: this.setYear.bind(this)
                }
            });

            this.countryDropdown = dropdown.extend({
                methods: {
                    setSelected: this.setCountry.bind(this)
                }
            });

            this.sectorDropdown = dropdown.extend({
                methods: {
                    setSelected: this.setFilter.bind(this)
                }
            });

            this.donorDropdown = dropdown.extend({
                methods: {
                    setSelected: this.setFilter.bind(this)
                }
            });

            this.after('filterChanged', this.fetch);
            this.after('yearChanged', this.fetch);
            this.after('countryChanged', this.fetch);

            this.after('measureChanged', function () {
                this.sentence.$destroy();
                // By Rahul D. @02july15
                if (typeof (this.attr.year) != 'undefined' && typeof (this.attr.measure) != 'undefined' && this.attr.measure == 'e') {
                    this.attr.year = moment().year();
                    this.initSentence();
                } else {
                    this.initSentence();
                }
                // end
            });

            this.initSentence();
            this.fetch();
        });
    }

    return defineComponent(Sentence,
    withMeasure,
    withYear,
    withCountry,
    withFilter);
});
