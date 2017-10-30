'use strict';

define(function (require) {
  var _ = require('lodash');

  function CountryModel(data, measure, filter) {
    if (!(this instanceof CountryModel)) {
      return new CountryModel(data, measure, filter);
    }

    _.extend(this, _.pick(data, 'name', 'sdt', 'edt'));

    this.lat = Number(data.lat);
    this.lng = Number(data.lng);

    if (measure === 'c' || measure === 'e') {
      if (!filter || filter === 'all') {
        _.extend(this, _.pick(data.all, measure, 'otc_n'));
      } else {
        var prop = (measure === 'c') ? 'dnr' : 'sct';

        try {
          _.extend(this, data[prop][filter]);
        } catch (e) {
          console.log('Unable to retrieve ' + filter + ' for measure ' + measure + ' from ' + this.name);
        }
      }
    } else {
      // Default to the totals for this country.
      _.extend(this, data.all);
    }
  }

  return CountryModel;
});
