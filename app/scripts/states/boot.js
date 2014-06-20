'use strict';

define([], function() {
    function Boot() {}

    Boot.prototype = {
        preload: function() {
            
        },

        create: function() {
            this.game.state.start('preload');
        }
    };

    return Boot;
});
