'use strict';

define(function (require) {
    function withFilter() {
        this.attributes({
            filter: null
        });

        this.filterChanged = function (ev, data) {
            this.attr.filter = data.filter;
            if (typeof (SEARCH_FOR) != 'undefined' && typeof (PROGRAMME_CODES_AREAS_OBJ[data.filter]) != 'undefined' && SEARCH_FOR == 'programme') {
                console.log(PROGRAMME_CODES_AREAS_OBJ[data.filter]);
                try {
                    window.history.pushState(null, null, '?k=programme&q=' + urlEncoder(PROGRAMME_CODES_AREAS_OBJ[data.filter]));
                } catch (e) { }
            }
        };

        this.after('initialize', function () {
            this.on(document, 'uiFilterChanged', this.filterChanged);

            // Filters are always invalidated when the measure changes.
            this.on(document, 'uiMeasureChanged', function () {
                if (this.attr.filter !== 'all') {
                    this.trigger('uiFilterChanged', { filter: 'all' });
                }
            });
        });
    }
    function urlEncoder(str) {
        str = (str + '')
        .toString();
        return encodeURI(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/&/g, '%26')
        .replace(/\*/g, '%2A')
        .replace(/#/g, '%23')
        .replace(/%20/g, '+');
    }
    return withFilter;
});
