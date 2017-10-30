'use strict';

define(function (require) {
  var defineComponent = require('flight/lib/component');

  function Tabs() {
    this.selectTab = function (ev) {
      this.$node.find('.selected').removeClass('selected');

      var measure = $(ev.currentTarget).addClass('selected')
          .data('measure');

      this.trigger('uiMeasureChanged', { measure: measure });
    };

    this.after('initialize', function () {
      this.on(this.$node.find('li'), 'click', this.selectTab);
    });
  }

  return defineComponent(Tabs);
});
