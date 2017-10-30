'use strict';

define(function (require) {
  var defineComponent = require('flight/lib/component');
  var moment = require('moment');

  var withDropdown = require('mixin/withDropdown');

  function SentenceYearFilter() {
    this.formatYear = function (updateDisplay, text) {
      var now = moment();

      updateDisplay((now.year() === Number(text)) ?
          now.format('MMM YYYY') :
          text);
    };

    this.after('initialize', function () {
      var self = this;

      this.attr.vm.text = moment().format('MMM YYYY');
      this.attr.dropdownSelector = '.dropdown.year';
      this.attr.changeEvent = 'uiYearChanged';
      this.attr.payloadProperty = 'year';

      $.ajax({
        url: TEMPLATE_PATH+'/json/table/years.json',
        dataType: 'json',
        success: function (years) {
          var now = moment().year();

          years.sort(function (a, b) { return b - a; });
          self.attr.vm.options = years.filter(function (v) { return Number(v) <= now; })
              .map(function (v) { return { value: v, text: v }; });
        }
      });

      this.around('updateDisplay', this.formatYear);
    });
  }

  return defineComponent(SentenceYearFilter, withDropdown);
});
