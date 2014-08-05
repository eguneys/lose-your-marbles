'use strict';

define(['phaser', 'config'], function(Phaser, Config) {
    function GameEndState() {}

    GameEndState.prototype = {
        init: function() {
            
        },
        preload: function() {
            
        },

        create: function() {
            Config.options.onGameEnd.call(Config, this.levelData);
            this.game.state.start('main-menu');
        }
    };

    return GameEndState;
});
