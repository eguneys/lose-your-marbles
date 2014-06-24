'use strict';

define(['phaser'], function(Phaser) {
    function Preload() {}

    Preload.prototype = {
        preload: function() {

            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.scale.setScreenSize(true);
            
            this.game.load.atlas('marbleatlas', 'data/images/sprites/sprites.png', 'data/images/sprites/sprites.json', null, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
            this.game.load.atlas('marbleatlas2', 'data/images/sprites/spritesbg.png', 'data/images/sprites/spritesbg.json', null, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        },

        create: function() {
            var levelData = { level: 1, players: [{score: 0}, {score:0}] };
            this.game.state.start('level-round', true, false, levelData);
        }
    };

    return Preload;
});
