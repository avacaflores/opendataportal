'use strict';

define(function (require) {

    function withCountry() {
        this.attributes({
            country: null
        });

        this.countryChanged = function (ev, data) {
            this.attr.country = data.country;
            if (typeof (SEARCH_FOR) != 'undefined' && SEARCH_FOR == 'country') {
                try{
                    window.history.pushState(null, null, '?k=country&q=' + urlEncoder(data.country));
                } catch(e){}
            }
        };

        this.after('initialize', function () {
            this.on(document, 'uiCountryChanged', this.countryChanged);
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
    return withCountry;
});
