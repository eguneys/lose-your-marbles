'use strict';

define(['phaser'], function(Phaser) {
    function FadeTween(game, color, alpha) {
        Phaser.Graphics.call(this, game, 0, 0);

        color = color || 0;
        alpha = alpha || 0;
        
        this.beginFill(color, alpha);
        this.drawRect(0, 0, this.game.width, this.game.height);
        this.endFill();
    }

    FadeTween.prototype = Object.create(Phaser.Graphics.prototype);
    FadeTween.prototype.constructor = FadeTween;

    FadeTween.prototype.tweenFadeOn = function() {
        var tween = this.game.add.tween(this)
                .to({alpha: 1}, 2000, Phaser.Easing.Linear.None, true);

        return tween;
    };

    return FadeTween;
});
