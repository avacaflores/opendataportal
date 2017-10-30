/* global d3 */
'use strict';

define(function (require) {

  var _ = require('lodash');

  var cache = d3.map();

  function fetch(year) {
    return $.ajax({
      url: TEMPLATE_PATH+'/json/flow/' + year + '_details.json',
      dataType: 'json'
    });
  }

  function process(deets, breakdown) {
    var obj = _.pick(deets, 'name', 'amount', 'pct_of_total');

    obj.breakdown = (breakdown && deets.hasOwnProperty(breakdown)) ? deets[breakdown] : [];

    return obj;
  }

  function type(node) {
    if (node.type === 'country') {
      return (/\(E\)$/.test(node.name)) ? 'expense' : 'commitment';
    }

    return node.type;
  }

  function details (year, node) {
    var t = type(node);

    return fetch(year).then(function (data) {
      var deets = {},
        breakdown;

      switch (t) {
      case 'expense':
        deets = data.expense_regions;
        breakdown = 'countries';
        break;
      case 'commitment':
        deets = data.donor_regions;
        breakdown = 'countries';
        break;
      case 'sector':
        deets = data.sectors;
        break;
      case 'donor':
        deets = data.donor_categories;
        breakdown = 'donors';
        break;
      default:
        break;
      }

      return process(deets[node.id], breakdown);
    });
  }

  return details;
});
