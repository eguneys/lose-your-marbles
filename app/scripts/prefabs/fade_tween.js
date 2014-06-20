'use strict';

define(['phaser'], function(Phaser) {
    function FadeTween(game, alpha) {
        Phaser.Graphics.call(this, game, 0, 0);

        this.beginFill(0xffffff, 1);
        this.drawRect(0, 0, this.game.width, this.game.height);
        this.endFill();
        this.alpha = alpha || 0;
    }

    FadeTween.prototype = Object.create(Phaser.Graphics.prototype);
    FadeTween.prototype.constructor = FadeTween;

    return FadeTween;
});
