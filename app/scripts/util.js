'use strict';

require([], function() {
    Array.prototype.mapConcat = function(str) {
        return this.map(function(item) {
            return str + item;
        });
    };
});
