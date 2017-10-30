'use strict';

define(function (require) {

  function withMeasure() {
    this.attributes({
      measure: null,
    });

    this.measureChanged = function (ev, data) {
      this.attr.measure = data.measure;
    };

    this.after('initialize', function () {
      this.on(document, 'uiMeasureChanged', this.measureChanged);
    });
  }

  return withMeasure;
});
