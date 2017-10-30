'use strict';

define(function (require) {
  var defineComponent = require('flight/lib/component');

  var _ = require('lodash');
  var d3 = require('d3');
  var Vue = require('vue');

  var Breadcrumbs = require('component/vue-breadcrumbs');
  var barChart = require('component/barChart');
  var iatiData = require('data/iatiData');

  var withYear = require('mixin/withYear');
  var withFilter = require('mixin/withFilter');
  var withCountry = require('mixin/withCountry');
  var withPCR = require('mixin/withPCR');
  var withMeasure = require('mixin/withMeasure');

  var expandTemplate = '<span class="glyphicon glyphicon-plus"></span>';

  function aidTable() {
    this.attributes({
      year: null,
      measure: null,
      country: 'all',
      pcr: 'all',
      filter: 'all'
    });

    this.updateCrumbs = function () {
      var breadcrumbs = [];

      if (this.attr.country !== 'all') {
        breadcrumbs.push({
          href: this.attr.country,
          title: this.attr.country
        });
      }

      if (this.attr.pcr !== 'all') {
        iatiData.pcrName(this.attr.pcr).done(function (pcr) {
          breadcrumbs.push({
            href: pcr.id,
            title: pcr.name
          });
        });
      }

      this.bread.crumbs = breadcrumbs;
    };

    this.setColumnVisibility = function () {
      // Reset all columns to visible so that indices line up.
      this.$table.columns().visible(true, false);

      switch(this.attr.measure) {
      case 'c':
        this.$table.column('.commitment').order('desc');
        this.$table.columns([4,6]).visible(false, false);
        break;

      case 'e':
        this.$table.column('.expense').order('desc');
        this.$table.columns([4,5]).visible(false, false);
        break;

      default:
        this.$table.column('.disbursement').order('desc');
        this.$table.columns([4,5,6]).visible(true, false);
        break;
      }

      this.$table.column(1).visible(this.attr.country !== 'all', false);
      this.$table.columns([0, 3]).visible(this.attr.pcr === 'all', false);
    };

    this.update = function (ev, data) {
      function updateTable(data) {
		data = applyCharacterLengthLimit(data );
        self.$table.clear().rows.add(data).columns.adjust().draw();

        var max = d3.max(data, function (d) { return Math.max(d.b || 0, d.c || 0, d.e || 0); });

        self.$table.rows()[0].forEach(function (idx) {
          var row = self.$table.row(idx),
            tr = row.node(),
            d = row.data(),
            chartData, ydomain;

          switch (self.attr.measure) {
          case 'c':
            ydomain = ['c'];
            chartData = [
              { measure: 'c', amount: d.c }
            ];
            break;
          case 'e':
            ydomain = ['e'];
            chartData = [
              { measure: 'e', amount: d.e }
            ];
            break;
          default:
            ydomain = ['b', 'c', 'e'];
            chartData = [
              { measure: 'b', amount: d.b },
              { measure: 'c', amount: d.c },
              { measure: 'e', amount: d.e }
            ];
            break;
          }
          barChart({
            el: $(tr).find('.bar-chart')[0],
            ydomain: ydomain,
            domain: [0, max],
            width: 173,
            axis: { y: false },
            label: false,
            data: chartData
          });
        });
      }

      var self = this,
        p;

      // If the filters have changed, reset the pcr because it may no longer be
      // a valid selection.
      if (!(data && data.hasOwnProperty('pcr'))) {
        this.attr.pcr = 'all';
      }

      this.updateCrumbs();

      this.setColumnVisibility();

      if (this.attr.pcr !== 'all') {
        p = iatiData.outputs(this.attr.year, this.attr.country, this.attr.pcr, this.attr.measure, this.attr.filter);
      } else if (this.attr.country !== 'all') {
        p = iatiData.pcrs(this.attr.year, this.attr.country, this.attr.measure, this.attr.filter);
      } else {
        p = iatiData.countries(this.attr.year, this.attr.measure, this.attr.filter);
      }

      p.done(updateTable);
    };

    this.onRowClicked = function (ev) {
      var data = this.$table.row($(ev.target).closest('tr')).data(),
        type = (this.attr.pcr !== 'all') ? 'output' :
            (this.attr.country !== 'all') ? 'pcr':
            'country';

        var dataName = data.name;
        if(data.constructor.name != "CountryModel" ){
            dataName = data.tmpName;
        }
        //console.log(data);
        //this.trigger('uiShowDetails', { name: data.name, type: type, country: this.attr.country });
        // Added By Rahul D. @03July15
        if (typeof(this.attr.year) != 'undefined'){
            //this.trigger('uiShowDetails', { year: this.attr.year, name: data.name, type: type, country: this.attr.country });
            this.trigger('uiShowDetails', { year: this.attr.year, name: dataName, type: type, country: this.attr.country, id : data.id });
        } else {
            //this.trigger('uiShowDetails', { name: data.name, type: type, country: this.attr.country });        
            this.trigger('uiShowDetails', { name: dataName, type: type, country: this.attr.country, id : data.id });        
        }
    };

    this.onExpand = function (ev) {
      var data = this.$table.row($(ev.target).closest('tr')).data();

      if (this.attr.country === 'all') {
        this.trigger('uiCountryChanged', { country: data.name });
      } else {
        this.trigger('uiPCRChanged', { pcr: data.id });
      }

      return false;
    };

    this.after('initialize', function () {
      var self = this,
        usd = function (v) {
          if(!isNaN(Number(v))) {
            return d3.format('$,d')(Math.floor(v));
          }

          return '--';
        };

      this.$table = this.$node.find('.data-table').DataTable({
        processing: true,
        scrollCollapse: false,
        paging: false,
        dom: 't',
        order: [2, 'asc'],
        scrollY: 670,
        columns: [
          { className: 'expand', sDefaultContent: expandTemplate, orderable: false, width: '40px' },
          { data: 'id', className: 'aid-id', sDefaultContent: '', orderable: false, width: '100px' },
          //{ data: 'name', width: '120px' },
		  { data: 'name', width: '240px' },
          { data: 'otc_n', className: 'numeric output-count', type: 'numeric', sDefaultContent: '--', width: '80px' },
          { data: 'b', className: 'numeric disbursement', type: 'numeric-fmt', sDefaultContent: '--', render: { display: usd } },
          { data: 'c', className: 'numeric commitment', type: 'numeric-fmt', sDefaultContent: '--', width: '120px', render: { display: usd } },
          { data: 'e', className: 'numeric expense', type: 'numeric-fmt', sDefaultContent: '--', width: '120px', render: { display: usd } },
          //{ className: 'bar-chart', sDefaultContent: '', orderable: false, width: '200px' }
		  { className: 'bar-chart', sDefaultContent: '', orderable: false, width: '180px' }
        ]
      });

      this.bread = new Breadcrumbs({
        el: this.$node.find('.breadcrumb')[0],
        data: {
          rootTitle: 'All countries',
          crumbs: []
        }
      });

      this.bread.$on('uiBreadcrumbsChanged', function () {
        if (self.bread.crumbs.length === 1) {
          self.attr.pcr = 'all';
          self.trigger('uiPCRChanged', { pcr: 'all' });
        } else {
          self.attr.country = 'all';
          self.trigger('uiCountryChanged', { country: 'all' });
        }
      });

      this.$node.on('click', 'tbody > tr', this.onRowClicked.bind(this));
      this.$node.on('click', '.expand', this.onExpand.bind(this));

      this.after('yearChanged', this.update);
      this.after('countryChanged', this.update);

      // this.update();   
      // Added By Rahul D. @03July15
      this.after('measureChanged', function(){
        if (typeof (this.attr.year) != 'undefined' && typeof (this.attr.measure) != 'undefined' && this.attr.measure == 'e') { 
            this.attr.year = moment().year();
        }      
        this.update();   
      });
      // End
      
      this.after('filterChanged', this.update);
      this.after('pcrChanged', this.update);

      this.update();
    });
  }

  return defineComponent(aidTable,
    withYear,
    withCountry,
    withMeasure,
    withPCR,
    withFilter);
});

//Function to limit 350 character on map page.
var applyCharacterLengthLimit = function(mydata){
    //console.log(mydata);    //'CountryModel';    //'PCRModel';    //'OutputModel';
    var limit = 350;
    mydata.forEach(function (item, i) {
        mydata[i].tmpName = mydata[i].name;
        if(item.constructor.name != "CountryModel" ){
            if( item.name.length > limit ){
                mydata[i].name = item.name.substring(0, limit)+"...";
            }
        }
    });
    return mydata;
};
