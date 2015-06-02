var PMP = PMP || {};

(function() {

    PMP.utils = {
        getQueryParams: function() {
            qs = window.location.search.split("+").join(" ");

            var params = {}, tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])]
                    = decodeURIComponent(tokens[2]);
            }

            return params;
        },

        getQueryParam: function(key) {
            return PMP.utils.getQueryParams()[key];
        }
    };

})();