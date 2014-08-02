'use strict';

define(['phaser'], function(Phaser) {
    function SelectSprite(game, x, y, atlas, selections, initial) {
        Phaser.Sprite.call(this, game, x, y,
                           atlas, selections[initial]);

        this.selection = initial;
        
        for (var key in selections) {
            this.animations.add(key, [selections[key]]);
        }
    }

    SelectSprite.prototype = Object.create(Phaser.Sprite.prototype);
    SelectSprite.prototype.constructor = SelectSprite;

    SelectSprite.prototype.select = function(value) {
        this.selection = value;
        this.play(this.selection);
    };
    
    SelectSprite.prototype.getSelection = function() {
        return this.selection;
    };
    
    return SelectSprite;
});
