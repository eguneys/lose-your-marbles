'use strict';

define([], function() {
    function Config() {
        this.options = {
            env: 'development',
            parent: 'game-area',
            paths: {
                sprites: '/data/images/sprites',
                audio: '/data/audio/sprites'
            },
            sfxVolume: 1,
            musicVolume: 0.8,
            onGameEnd: function(levelData) {
                console.log('Congratz, you finished all the levels.');
            },
            onGameQuit: function() {
                console.log('Bye.');
            },
            onLoadUpdate: function(progress) {
                console.log('Load: ' + progress);
            },
            onLoadComplete: function() {
                console.log('Load: 100');
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
