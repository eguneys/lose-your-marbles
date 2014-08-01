'use strict';

define(['phaser'], function(Phaser) {
    function ToggleSprite(game, x, y, atlas, keyOn, keyOff) {
        Phaser.Sprite.call(this, game, x, y,
                           atlas, keyOff);

        this.animations.add('on', [keyOn]);
        this.animations.add('off', [keyOff]);
    }

    ToggleSprite.prototype = Object.create(Phaser.Sprite.prototype);
    ToggleSprite.prototype.constructor = ToggleSprite;
    
    return ToggleSprite;
});
