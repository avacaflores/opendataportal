/* global d3 */
'use strict';

requirejs.config({
  baseUrl: TEMPLATE_PATH+'/bower_components',
  paths: {
    'component': '../js/component',
    'data': '../js/data',
    'mixin': '../js/mixin',
    'page': '../js/page',
    'template': '../js/template',
    'text': 'requirejs-text/text',
    'vue': 'vue/dist/vue.min',
    'lodash': 'lodash/dist/lodash',
    'moment': 'moment/moment'
  }
});

require(
  [
    'flight/lib/compose',
    'flight/lib/registry',
    'flight/lib/advice',
    'flight/lib/logger',
    'flight/lib/debug',
  ],

  function (compose, registry, advice, withLogging, debug) {
    debug.enable(false);
    compose.mixin(registry, [advice.withAdvice]);

    require(['page/flow'], function (initializeDefault) {
      initializeDefault();
    });

  }
);
