'use strict';

define(function (require) {

  var Vue = require('vue');

  var breadcrumbs = Vue.extend({
    methods: {
      pop: function (ev, idx) {
        ev.preventDefault();
        ev.stopImmediatePropagation();

        this.crumbs.splice(idx, this.crumbs.length - idx);
        this.$dispatch('uiBreadcrumbsChanged');

        return false;
      }
    }
  });

  Vue.component('vue-breadcrumbs', breadcrumbs);

  return breadcrumbs;
});
