define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */
  var Sankey = require('component/sankey');
  var Sentence = require('component/flowSentence');
  var Tooltip = require('component/tooltip');
  var lastUpdated = require('text!template/last-updated.html');
  var flowModel = require('data/flow');
  var Vue = require('vue');

  // Install vue filters
  require('component/vue-filters');

  /**
   * Module exports
   */

  return initialize;

  /**
   * Module function
   */

  function initialize() {
    var year = (new Date()).getFullYear();

    Tooltip.attachTo(document, { width: 300 });
    Sentence.attachTo('#sentence');
    Sankey.attachTo('#chart', {
      margin: { top: 10, right: 250, bottom: 50, left: 200 },
      width: 1100,
      height: 1300,
      year: year,
      fill: function (d) { return d.color; }
    });

    flowModel(year).done(function (data) {
      new Vue({
        el: '.last-updated',
        template: lastUpdated,
        data: { updated: data.asOf }
      });
    });
  }

});
