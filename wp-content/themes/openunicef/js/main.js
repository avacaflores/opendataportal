'use strict';

requirejs.config({
  baseUrl: TEMPLATE_PATH+'/bower_components',
  paths: {
    'component': '../js/component',
    'data': '../js/data',
    'mixin': '../js/mixin',
    'page': '../js/page',
    'template': '../js/template',
    'd3': 'd3/d3.min',
    'mustache': 'mustache/mustache',
    'text': 'requirejs-text/text',
    'stache': 'requirejs-mustache/stache',
    'moment': 'moment/moment',
    'vue': 'vue/dist/vue.min',
    'lodash': 'lodash/dist/lodash'
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

  function(compose, registry, advice, withLogging, debug) {
    debug.enable(false);
    compose.mixin(registry, [advice.withAdvice]);

    require(['page/default'], function (initializeDefault) {
      initializeDefault();
    });
  }
);
