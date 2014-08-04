'use strict';

define(['phaser', 'config'], function(Phaser, config) {
    function Preload() {}

    Preload.prototype = {
        preload: function() {

            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.scale.setScreenSize(true);

            var paths = config.options.paths;
            
            this.game.load.atlas('marbleatlas', paths.sprites + '/sprites.png', paths.sprites + '/sprites.json', null, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
            this.game.load.atlas('marbleatlas2', paths.sprites + '/spritesbg.png', paths.sprites + '/spritesbg.json', null, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);


            this.game.load.json('audiosprite', paths.audio + '/sfx.json');
            this.game.load.audio('sfx', ['ogg', 'm4a', 'mp3', 'ac3'].mapConcat(paths.audio + '/sfx.'));
        },

        create: function() {
            this.game.state.start('level-master');
            //this.game.state.start('main-intro');
        }
    };

    return Preload;
});
