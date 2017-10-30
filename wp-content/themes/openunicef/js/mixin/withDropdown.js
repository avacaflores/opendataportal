'use strict';

define(function (require) {
  var Vue = require('vue');

  function withDropdown() {
    this.attributes({
      vm: {},
      template: '#dropdown-template',
      dropdownSelector: '.dropdown',
      optionSelector: 'a',
      changeEvent: 'uiDropdownChanged',
      payloadProperty: 'value',
      selected: ''
    });

    this.toggleVisibility = function () {
      this.attr.vm.isOpen = !this.attr.vm.isOpen;
    };

    this.selectOption = function (ev) {
      ev.preventDefault();
      ev.stopImmediatePropagation();

      var payload = {},
        $target = $(ev.target);

      payload[this.attr.payloadProperty] = $target.data('value');

      this.trigger(this.attr.changeEvent, payload);
    };

    this.updateSelection = function (value) {
      var self = this;

      this.attr.selected = value;

      this.attr.vm.options.forEach(function (opt) {
        if (opt.value === value) {
          self.updateDisplay(opt.text);
          return false;
        }
      });
    };

    this.updateDisplay = function (text) {
      this.attr.vm.text = text;
    };

    this.after('initialize', function () {
      this.$node.attr('v-class', 'open: isOpen');

      this.attr.vm.isOpen = false;

      new Vue({
        el: this.node,
        template: this.attr.template,
        data: this.attr.vm
      });

      this.on(document, this.attr.changeEvent, this.updateSelection);

      this.on('click', {
        dropdownSelector: this.toggleVisibility,
        optionSelector: this.selectOption
      });
    });
  }

  return withDropdown;
});
