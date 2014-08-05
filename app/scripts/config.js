'use strict';

define([], function() {
    function Config() {
        this.options = {
            parent: 'game-area',
            paths: {
                sprites: '/data/images/sprites',
                audio: '/data/audio/sprites'
            },
            sfxVolume: 1,
            musicVolume: 0.8,
            onGameEnd: function(levelData) {
                console.log('Congratz, you finished all the levels.');
            }
        };
    }

    Config.prototype.setMusicVolume = function(volume) {
        this.options.musicVolume = volume;
    };

    Config.prototype.setSfxVolume = function(volume) {
        this.options.sfxVolume = volume;
    };
    
    return new Config();
});
