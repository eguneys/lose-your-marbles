'use strict';

define(['phaser', 'prefabs/round_splash', 'prefabs/blue_number'], function(Phaser, RoundSplash, BlueNumber) {
    function RoundForeground(game, round, parent) {
        Phaser.Group.call(this, game, parent);
        
        this.roundSplash = new RoundSplash(this.game, round, this);

        this.roundSplash.x = (this.game.width - this.roundSplash.width) / 2;
        this.roundSplash.y = (this.game.height / 2) - this.roundSplash.height;
        
        this.countdown1 = new BlueNumber(this.game, this);
        this.countdown1.alpha = 0;
        this.countdown1.x = 130;
        this.countdown1.y = 60;

        this.countdown2 = new BlueNumber(this.game, this);
        this.countdown2.alpha = 0;
        this.countdown2.x = 640 - 130;
        this.countdown2.y = 60;
        
        this.counter = 3;
    }

    RoundForeground.prototype = Object.create(Phaser.Group.prototype);
    RoundForeground.prototype.constructor = RoundForeground;

    RoundForeground.prototype.startCountdown = function(callback, callbackContext) {
        this._onGoCallback = callback;
        this._onGoCallbackContext = callbackContext;
        
        this.game.time.events.repeat(Phaser.Timer.SECOND, 5, this.doCountdown, this);
    };
    
    RoundForeground.prototype.doCountdown = function() {
        this.countdown1.alpha = 1;
        this.countdown2.alpha = 1;

        if (this.counter > 0) {
            this.countdown1.show(this.counter);
            this.countdown2.show(this.counter);
        } else if (this.counter === 0) {
            this.countdown1.show('go');
            this.countdown2.show('go');
        } else {
            if (this._onGoCallback) {
                this._onGoCallback.call(this._onGoCallbackContext, this);
            }
        }
        --this.counter;
    };

    return RoundForeground;
});
