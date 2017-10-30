/* global d3 */
'use strict';

define(function (require) {

    var defineComponent = require('flight/lib/component');

    var Vue = require('vue');
    var _ = require('lodash');

    var sentence = {
        donors: Vue.extend({
          //  template: '{{ breakdown.length }} resource {{ breakdown.length | pluralize partner }} contributed a total of {{ amount | usd }} UNICEF programmes.'
		   template: 'UNICEF allocated a total of {{ amount | usd }} received from {{ breakdown.length }} resource {{ breakdown.length | pluralize partner }}.'
        }),
        regionCommitment: Vue.extend({
            //template: '{{ breakdown.length }} {{ breakdown.length | pluralize country countries }} in {{ name | strip \\([CE]\\)$ }} received a total of {{ amount | usd }} programme funds.'
			 template: 'UNICEF allocated a total of {{ amount | usd }} to programmes in {{ breakdown.length }} {{ breakdown.length | pluralize country countries }} in {{ name | strip \\([CE]\\)$ }}.'
		}),
        regionExpense: Vue.extend({
            template: '{{ breakdown.length }} {{ breakdown.length | pluralize country countries }} in {{ name | strip \\([CE]\\)$ }} spent a total of {{ amount | usd }}.'
        }),
        sectors: Vue.extend({
            template: 'A total of {{ amount | usd }} was spent on {{ name }}.'
        })
    };

    var dragData = {
        x: 0,
        y: 0
    };

    function Tooltip() {
        this.attributes({
            width: null
        });

        this.show = function (ev, data) {
            if (typeof (data.type) != 'undefined' && data.type == 'donor') { // Refine results for donors, By Rahul D. @13July15
                if (typeof (data.data.breakdown) != 'undefined' && (data.data.breakdown).length > 0) {
                    for (var iter in data.data.breakdown) {
                        if (typeof (data.data.breakdown[iter].name) != 'undefined') {
                            if ((data.data.breakdown[iter].name).indexOf('(donor name - original)') >= 0) {
                                data.data.breakdown[iter].name = (data.data.breakdown[iter].name).replace('(donor name - original)', '');
                            }
                        }
                    }
                }
            } // end - Refine results
            if (this.showing === data.id && this.tooltip) {
                // commented by Rahul D. @14JUly15, pop-up window and the flow chart will be frozen between mouse clicks
                /*_.assign(this.tooltip.$data, _.omit(data.data, 'x', 'y'));
                return;*/

            }

            if (!data.force && this.tooltip && this.tooltip.$data.pinned) {
                return;
            }

            if (this.tooltip) {
                this.tooltip.$remove();
                this.tooltip.$destroy();
            }

            // Clear out any leftover tooltips that sometimes end up in the DOM as a
            // result of rapid mouse movements.
            $('.tooltip.v-leave').remove();

            this.showing = data.id;

            // Create a copy of the data object in case anyone else is listening.
            // Default is not to replace the root element.
            var config = _.defaults({}, data, { replace: false, dragging: false, dragged: false });

            _.defaults(config.data, { closeBtn: 'hidden' });

            var sentenceComp;
            if (config.data.name) {
                switch (data.type) {
                    case 'donor':
                        sentenceComp = sentence.donors;
                        break;
                    case 'country':
                        sentenceComp = (/\(E\)$/.test(data.data.name)) ? sentence.regionExpense : sentence.regionCommitment;
                        break;
                    default:
                        sentenceComp = sentence.sectors;
                        break;
                }
            }

            // Add our computed properties.
            _.extend(config, {
                computed: this.computed,
                methods: {
                    unpin: this.unpin.bind(this),
                    startDrag: this.startDrag.bind(this),
                    drag: this.drag.bind(this),
                    stopDrag: this.stopDrag.bind(this)
                },
                components: {
                    'tooltip-sentence': sentenceComp
                },
                filters: {
                    count: function (v) {
                        return v + ' ' + data.units[v === 1 ? 0 : 1];
                    }
                },
                attached: function () {
                    // Trigger recalculation of position on attach.
                    this.$data.x = this.$data.x;
                    this.$data.y = this.$data.y;

                    this.initialOrientation = this.orient;
                }
            });

            // By vijay--> client disable functionality tmp 
            if(data.type != 'donor'){  
                this.tooltip = new Vue(config);
                this.tooltip.$appendTo('body');
                var self = this;
                $(this.tooltip.$el).mouseout(function (ev) {
                    self.hide(null, { id: data.id });
                });
            }

        };

        this.update = function (ev, data) {
            if (this.tooltip && this.showing === data.id) {
                _.extend(this.tooltip.$data, data.id);
            }
        };

        this.hide = function (ev, data) {
            var self = this;

            this.timer = setTimeout(function () {
                self.timer = null;

                if (self.tooltip && !self.tooltip.$data.pinned && self.showing === data.id) {
                    self.tooltip.$remove();
                    self.tooltip.$destroy();
                    self.tooltip = null;
                }

            }, data.delay || 0);
        };

        this.pin = function (ev, data) {
            if (this.tooltip && this.showing === data.id) {
                this.cancelHide();
                this.tooltip.$data.pinned = true;
            }
        };

        this.unpin = function () {
            if (this.tooltip && this.tooltip.$data) {
                this.tooltip.$data.pinned = false;
            }

            this.trigger('uiTooltipUnpinned');
            this.trigger('uiTooltipHide', { id: this.showing });
        };

        this.cancelHide = function () {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
        };

        this.startDrag = function (ev) {
            $(document).on('mousemove.tooltip', { component: this }, this.drag)
        .on('mouseup.tooltip', { component: this }, this.stopDrag);

            $('body').addClass('dragging');

            dragData.x = ev.pageX;
            dragData.y = ev.pageY;
            this.tooltip.dragging = this.tooltip.dragged = true;
        };

        this.drag = function (ev) {
            ev.data.component.tooltip.x += ev.pageX - dragData.x;
            ev.data.component.tooltip.y += ev.pageY - dragData.y;

            dragData.x = ev.pageX;
            dragData.y = ev.pageY;
        };

        this.stopDrag = function (ev) {
            $(document).off('mousemove.tooltip')
        .off('mouseup.tooltip');

            $('body').removeClass('dragging');

            ev.data.component.tooltip.dragging = false;
        };

        this.after('initialize', function () {
            var self = this;

            this.computed = {
                orient: function () {
                    if (this.dragged) {
                        return this.initialOrientation;
                    }

                    return this.x < window.innerWidth / 2 ? 'right' : 'left';
                },

                left: function () {
                    if (this.orient === 'left') {
                        return this.x - $(this.$el).outerWidth(true);
                    }

                    return this.x + this.offsetX;
                },

                top: function () {
                    var top = this.$data.y + this.$data.offsetY;

                    if (this.dragged) {
                        return top;
                    }

                    return top +
                Math.min(0, window.innerHeight + window.pageYOffset - this.$data.y - $(this.$el).outerHeight(true));
                },

                width: function () {
                    return self.attr.width;
                }
            };

            this.on(document, 'uiTooltipShow', this.show);
            this.on(document, 'uiTooltipUpdate', this.update);
            this.on(document, 'uiTooltipHide', this.hide);
            this.on(document, 'uiTooltipPin', this.pin);

            this.on(document, 'keyup', function (ev) {
                // On ESC
                if (ev.which === 27) {
                    this.unpin();
                }
            });
        });
    }

    return defineComponent(Tooltip);

});
