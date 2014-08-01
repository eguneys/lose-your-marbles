'use strict';

define([], function() {
    function Config() {
        this.options = {
            parent: 'game-area',
            paths: {
                sprites: '/data/images/sprites'
            }
        };
    };
    
    return new Config();
});
