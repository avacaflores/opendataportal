/* global d3 */
'use strict';

define(function (require) {

  var Vue = require('vue');
  var moment = require('moment');

  Vue.filter('usd', function (value) {
    if (!isNaN(Number(value))) {
      return d3.format('$,.0f')(value);
    }

    return '--';
  });
  
  Vue.filter('numberformat', function (value) {
    if (!isNaN(Number(value))) {
      return d3.format(',.0f')(value);
    }

    return value;
  });

  Vue.filter('date', function (value) {
    return moment(value, 'YYYY-MM-DD').format('MMM YYYY');
  });

  Vue.filter('pct', d3.format('.1%'));
  Vue.filter('strip', function strip(value, pattern) {
    return value.replace(new RegExp(pattern), '');
  });
});
