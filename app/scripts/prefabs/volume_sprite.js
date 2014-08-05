'use strict';

define(['phaser'], function(Phaser) {
    function VolumeSprite(game, initialVolume) {
        Phaser.Group.call(this, game);

        this.maxVolume = 10;
        this.volume = initialVolume;

        this.bg = this.create(0, 0, 'marbleatlas',
                              'OPTIONS_MENU_VOLUME_BG');
        this.fg = this.create(6, 6, 'marbleatlas',
                              'OPTIONS_MENU_VOLUME_FG');

        this.fgMask = new Phaser.Graphics(this.game, 6, 6);

        this.add(this.fgMask);

        this.fg.mask = this.fgMask;

        this.updateMask();
    }

    VolumeSprite.prototype = Object.create(Phaser.Group.prototype);
    VolumeSprite.prototype.constructor = VolumeSprite;

    VolumeSprite.prototype.volumeUp = function() {
        if (this.volume >= 10) { return this.volume; }
        this.volume++;

        this.updateMask();

        return this.volume;
    };

    VolumeSprite.prototype.volumeDown = function() {
        if (this.volume <= 0) { return this.volume; }
        this.volume--;

        this.updateMask();

        return this.volume;
    };

    VolumeSprite.prototype.updateMask = function() {
        this.fgMask.clear();
        this.fgMask.beginFill(0xffffff);

        var width = this.fg.width * (this.volume / 10);
        
        this.fgMask.drawRect(0, 0, width, 15);
    };
    
    return VolumeSprite;
});
