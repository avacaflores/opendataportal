'use strict';

define(function (require) {

  function withPCR() {
    this.attributes({
      pcr: null
    });

    this.pcrChanged = function (ev, data) {
      this.attr.pcr = data.pcr;
    };

    this.after('initialize', function () {
      this.on(document, 'uiPCRChanged', this.pcrChanged);

      // PCRs are always invalidated when the measure changes.
      this.on(document, 'uiMeasureChanged', function () {
        if (this.attr.pcr !== 'all') {
          this.trigger('uiPCRChanged', { pcr: 'all' });
        }
      });
    });
  }

  return withPCR;
});
