'use strict';

define(function (require) {

  function withYear() {
    this.attributes({
      year: null
    });

    this.yearChanged = function (ev, data) {
      this.attr.year = data.year;
    };

    this.after('initialize', function () {
      this.on(document, 'uiYearChanged', this.yearChanged);
    });
  }

  return withYear;
});
