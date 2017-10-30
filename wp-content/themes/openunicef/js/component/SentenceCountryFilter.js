'use strict';

define(function (require) {
  var defineComponent = require('flight/lib/component');

  var iatiData = require('data/iatiData');

  var withDropdown = require('mixin/withDropdown');

  function SentenceCountryFilter() {

    this.worldDataChanged = function (ev, data) {
      var options = data.data.map(function (c) {
        return { value: c.name, text: c.name };
      });

      options.sort(function (a, b) { return (a.text < b.text) ? -1 :
          (a.text > b.text) ? 1 : 0; });

      this.countryCount = data.data.length + ' countr' +
          ((data.data.length === 1) ? 'y' : 'ies');

      this.attr.vm.options = [{ value: 'all', text: 'All Countries'}].concat(options);

      this.updateDisplay(this.attr.selected, this.attr.selected);
    };

    this.formatName = function (updateDisplay, text, value) {
      updateDisplay((value === 'all') ? this.countryCount : text);
    };

    this.after('initialize', function () {
      
      // Override the dropdown attributes.
      this.attr.dropdownSelector = '.dropdown.country';
      this.attr.changeEvent = 'uiCountryChanged';
      this.attr.payloadProperty = 'country';
      this.attr.selected = 'all';

      this.around('updateDisplay', this.formatName);
    });
  }

  return defineComponent(SentenceCountryFilter,
      withDropdown);
});
