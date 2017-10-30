'use strict';

define(function (require) {
  var Vue = require('vue');

  function toggle(ev) {
    if (this.isOpen) {
      this.close(ev);
    } else {
      this.open(ev);
    }
  }

  function resize() {
    var $el = $(this.$el),
      $menu = $el.find('.dropdown-menu'),
      $items = $el.find('.menu-items'),
      $window = $(window),
      windowOffset = $window.height() + $window.scrollTop(),
      menuOffset = $el.offset().top + $el.outerHeight(),
      menuPadding = parseInt($menu.css('padding-top'), 10) +
          parseInt($menu.css('padding-bottom'), 10) +
          parseInt($menu.css('border-top-width'), 10) +
          parseInt($menu.css('border-bottom-width'), 10) +
          parseInt($menu.css('margin-top'), 10) +
          parseInt($menu.css('margin-bottom'), 10),
      menuHeight = windowOffset - menuOffset - menuPadding,
      listHeight = menuHeight;

    if (this.searchable) {
      listHeight -= $el.find('.search-box').outerHeight();
    }

    $menu.css('max-height', Math.floor(menuHeight) + 'px');
    $items.css('max-height', Math.floor(listHeight) + 'px');
  }

  function open(ev) {
    this.pattern = '';
    this.isOpen = true;

    this.resize();
    $(document).on('click', this.closeHandler);
    $(window).on('scroll', this.resize).on('resize', this.resize);
  }

  function onClick(ev) {
    if ($(ev.target).closest(this.$el).length < 1) {
      this.close();
    }
  }

  function close(ev) {
    $(document).off('click', this.closeHandler);
    $(window).off('scroll', this.resize).off('resize', this.resize);
    this.isOpen = false;
  }

  return Vue.extend({
    template: require('text!template/dropdown.html'),
    created: function () {
      this.closeHandler = onClick.bind(this);
      this.resize = resize.bind(this);
    },
    methods: {
      toggle: toggle,
      open: open,
      close: close,
    },
    beforeDestroy: function () {
      $(document).off('click', this.closeHandler);
    }
  });
});
