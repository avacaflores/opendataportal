'use strict';

define(function (require) {
  var _ = require('lodash');

  function PCRModel(data, measure, filter) {
    if (!(this instanceof PCRModel)) {
      return new PCRModel(data, measure, filter);
    }

    filter = filter || 'all';

    _.extend(this, _.pick(data, 'name', 'sdt', 'edt'));
    
    this.id = data.pcr_id;

    if (measure === 'c' || measure === 'e') {

      var prop = (measure === 'c') ? 'dnr' : 'sct',
        v = 0,
        n = 0;

      data.outputs.forEach(function (o) {
        if (o.hasOwnProperty(prop)) {

          if (o[prop].hasOwnProperty(filter)) {
            v += o[prop][filter];
            ++n;
          }

        }
      });

      this[measure] = v;
      this.otc_n = n;
    } else {
      this.otc_n = data.outputs.length;

      var b = 0,
        c = 0,
        e = 0;

      data.outputs.forEach(function (o) {
        if (typeof(o.b) != "undefined" && !isNaN(o.b)) b += o.b;
        if (typeof(o.dnr.all) != "undefined" && !isNaN(o.dnr.all)) c += o.dnr.all;
        if (typeof(o.sct.all) != "undefined" && !isNaN(o.sct.all)) e += o.sct.all;
      });

      this.b = b;
      this.c = c;
      this.e = e;
    }
  }

  return PCRModel;
});
