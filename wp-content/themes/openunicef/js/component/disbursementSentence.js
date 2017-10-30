'use strict';

define(function (require) {
  var defineComponent = require('flight/lib/component');
  var moment = require('moment');

  var SentenceYearFilter = require('component/SentenceYearFilter');
  var SentenceCountryFilter = require('component/SentenceCountryFilter');

  var withSentence = require('mixin/withSentence');

  function DisbursementSentence() {
    this.attributes({
      measure: 'b',
      template: '#sentence-disbursement'
    });

    this.after('initialize', function () {
      var self = this;

      this.attr.vm.plans = 'plans';

      this.on('uiSentenceReady', function () {
        SentenceYearFilter.attachTo('.dropdown.year');
        SentenceCountryFilter.attachTo('.dropdown.country');
      });

      this.after('updateViewModel', function (ev, data) {
        if (data.year) {
          var current = moment().year() === Number(data.year);

          self.attr.vm.plans = current ? 'plans' : 'planned';
        }
      });
    });

    this.before('teardownAll', function () {
      SentenceYearFilter.teardownAll();
      SentenceCountryFilter.teardownAll();
    });
  }

  return defineComponent(DisbursementSentence,
    withSentence);
});
