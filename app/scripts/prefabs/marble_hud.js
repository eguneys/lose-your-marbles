'use strict';

define(['phaser', 'prefabs/marble', 'prefabs/blue_number', 'prefabs/red_number', 'prefabs/pop_number', 'prefabs/bounce_marble'], function(Phaser, Marble, BlueNumber, RedNumber, PopNumber, BounceMarble) {
    function MarbleHud(game, parent, color, height, toPosX) {
        Phaser.Group.call(this, game, parent);

        this.scPos = { x: 0, y: height * 7 / 15 };
        this.scToPos = { x: toPosX, y: 0 };

        var popPos = { x: this.scToPos.x, y: this.scToPos.y - height * 9 / 15 };
        
        this.marbleCounter = new MarbleCounter(this.game, this, color, popPos);
        this.marbleCounter.y = height * 9/15;

        this.redNumbers = this.game.add.group(this);
    }
    
    MarbleHud.prototype = Object.create(Phaser.Group.prototype);
    MarbleHud.prototype.constructor = MarbleHud;

    
    MarbleHud.prototype.buildRedNumber = function() {
        var redNumber = this.redNumbers.getFirstExists(false);

        if (!redNumber) {
            redNumber = new RedNumber(this.game, this.redNumbers);
        }
        
        return redNumber;
    };
    
    MarbleHud.prototype.streakShow = function(number) {
        var streakCounter = this.buildRedNumber();
        
        streakCounter.reset(this.scPos.x, this.scPos.y);

        streakCounter.show(number);
        
        var tween = streakCounter.tweenCounterPos(this.scToPos.x, this.scToPos.y);
        tween.onComplete.add(streakCounter.hide.bind(streakCounter));
        
        return tween;
    };
    
    MarbleHud.prototype.counterIncrease = function() {
        this.marbleCounter.counterIncrease();
    };

    MarbleHud.prototype.counterDump = function(color) {
        this.marbleCounter.counterDump(color);
    };
    
    function MarbleCounter(game, parent, color, popPos) {
        Phaser.Group.call(this, game, parent);

        this.counter = 1;

        this.popPos = popPos;

        
        this.bounceMarble = new BounceMarble(this.game, this);
        this.marble = this.buildMarble(color);
        this.times = this.create(0, this.marble.height, 'marbleatlas', 'COMMON01_TEXT_TIMES');
        this.number = new BlueNumber(this.game, this);
        this.number.x = this.times.width / 2;
        this.number.y = this.times.y + this.times.height + this.number.height / 2;
        this.number.show(this.counter);


        this.popNumber = new PopNumber(this.game, this);
        this.popNumber.x = popPos.x;
        this.popNumber.y = popPos.y;
        this.popNumber.alpha = 0;
    }

    MarbleCounter.prototype = Object.create(Phaser.Group.prototype);
    MarbleCounter.prototype.constructor = MarbleCounter;

    MarbleCounter.prototype.buildMarble = function(color) {
        var marble;
        
        this.forEachDead(function(item) {
            if (item.marbleColor === color) {
                marble = item;
            }
        }, this);

        if (!marble) {
            marble = new Marble(this.game, 0, 0, color);
            this.add(marble);
        }
        
        return marble;
    };
    
    MarbleCounter.prototype.counterIncrease = function() {
        this.counter++;
        this.number.show(this.counter);
    };

    MarbleCounter.prototype.counterDump = function(color) {
        var tween = this.bounceMarble.tweenBounce(this.marble, this.popPos.x, this.popPos.y);
        tween.onComplete.add(this.marblePop.bind(this, this.marble, this.counter));
        
        this.marble.animations.play('upfull');
        
        this.marble = this.buildMarble(color);
        this.marble.animations.stop();
        this.marble.reset(0, 0);
        this.marble.setRow(7);
        
        this.counter = 1;
        this.number.show(this.counter);
        
        return tween;
    };

    MarbleCounter.prototype.marblePop = function(marble, counter) {
        marble.kill();

        this.popNumber.alpha = 1;
        this.popCountdown(counter + 5);
    };

    MarbleCounter.prototype.popCountdown = function(count) {
        if (count <= 0) {
            this.popNumber.alpha = 0;
        }
        this.popNumber.pop(count);
        
        this.game.time.events.add(1000, this.popCountdown.bind(this, count - 1));
    };
    
    return MarbleHud;
});
