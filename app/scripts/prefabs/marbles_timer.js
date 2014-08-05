'use strict';

define(['phaser', 'util', 'prefabs/base_number'], function(Phaser, Util, BaseNumber) {
    function MarblesTimer(game, parent, fx) {
        Phaser.Group.call(this, game, parent);

        this.fx = fx;

        this.minutes = new BaseNumber(this.game, this, 'COMMON03_DIGIT_');
        this.seconds = new BaseNumber(this.game, this, 'COMMON03_DIGIT_', 2);
        
        this.seperator = this.create(0, 0, 'marbleatlas', 'COMMON03_TEXT_MARBLES_TIMER_SEPERATE');

        this.minutes.show(0);
        this.seconds.show(0);
        
        this.seperator.x = this.minutes.width;
        this.seconds.x = this.seperator.x + this.seperator.width;
    }

    MarblesTimer.prototype = Object.create(Phaser.Group.prototype);
    MarblesTimer.prototype.constructor = MarblesTimer;

    MarblesTimer.prototype.show = function(seconds) {
        var minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);

        this.minutes.reset(this.minutes.x, this.minutes.y);
        this.seconds.reset(this.seconds.x, this.seconds.y);
        
        this.minutes.show(minutes);
        this.seconds.show(seconds);
    };
    
    return MarblesTimer;
});
