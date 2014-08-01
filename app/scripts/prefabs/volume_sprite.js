'use strict';

define(['phaser'], function(Phaser) {
    function VolumeSprite(game) {
        Phaser.Group.call(this, game);

        this.bg = this.create(0, 0, 'marbleatlas',
                              'OPTIONS_MENU_VOLUME_BG');
        this.fg = this.create(6, 6, 'marbleatlas',
                              'OPTIONS_MENU_VOLUME_FG');
    }

    VolumeSprite.prototype = Object.create(Phaser.Group.prototype);
    VolumeSprite.prototype.constructor = VolumeSprite;

    VolumeSprite.prototype.volumeLevel = function() {
        
    };
    
    return VolumeSprite;
});
