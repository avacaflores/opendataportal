'use strict';

define(function (require) {

  var defineComponent = require('flight/lib/component');

  function navTooltip() {
    this.after('initialize', function () {
      var $nav = this.$node;

      $nav.find('li').hover(function(){
        var $li = $(this);

        $nav.find('div.tip').text($li.find('.tip.text').text()).css({
            'display': 'block',
            'margin-left': '160px'
          });
      },
      function(){
        $('.tip').css({
            'display': 'none',
            'margin': '0px'
          });
      });

    });
  }

  return defineComponent(navTooltip);

});
