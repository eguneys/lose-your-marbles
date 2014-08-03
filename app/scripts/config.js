'use strict';

define([], function() {
    function Config() {
        this.options = {
            parent: 'game-area',
            paths: {
                sprites: '/data/images/sprites',
                audio: '/data/audio/sprites'
            }
        };
    }
    
    return new Config();
});
