'use strict';

define(['phaser'], function(Phaser) {
    function RoundScore(game, x, y, level, score) {
        score = score || 1;
        this.preFrame = 'LEVEL-0' + level + '_SCORE';
        Phaser.Sprite.call(this, game, x, y, 'marbleatlas', this.preFrame + score);
    }

    RoundScore.prototype = Object.create(Phaser.Sprite.prototype);
    RoundScore.prototype.constructor = RoundScore;
    
    return RoundScore;
});
