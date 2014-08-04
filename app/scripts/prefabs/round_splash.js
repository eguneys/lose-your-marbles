'use strict';

define(['phaser', 'prefabs/blue_number'], function(Phaser, BlueNumber) {
    function RoundSplash(game, round, parent) {
        Phaser.Group.call(this, game, parent);

        this.roundText = this.create(0, 0, 'marbleatlas', 'COMMON03_TEXT_ROUND');

        this.roundNumber = new BlueNumber(this.game, this);

        this.roundNumber.x = this.roundText.width / 2;
        this.roundNumber.y = this.roundText.height + this.roundNumber.height / 2;

        this.roundNumber.show(round);
        
        this.width = this.roundText.width;
        this.height = this.roundText.height + this.roundNumber.height;
    }

    RoundSplash.prototype = Object.create(Phaser.Group.prototype);
    RoundSplash.prototype.constructor = RoundSplash;

    return RoundSplash;
});
