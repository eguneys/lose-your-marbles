'use strict';

define(['phaser'], function(Phaser) {
    function BaseNumber(game, parent, preFrame, digitsLength) {
        Phaser.Group.call(this, game, parent);

        this.digitsLength = digitsLength || 1;
        
        this.preFrame = preFrame;

        this.digits = [];
    }

    BaseNumber.prototype = Object.create(Phaser.Group.prototype);
    BaseNumber.prototype.constructor = BaseNumber;

    Object.defineProperty(BaseNumber.prototype, 'width', {
        get: function() {
            return this.digits
                .map(function(item) { return item.width; })
                .reduce(function(p, c) { return p + c; }, 0);
        }
    });

    Object.defineProperty(BaseNumber.prototype, 'height', {
        get: function() {
            return this.digits
                .map(function(item) { return item.height; })
                .reduce(function(p, c) { return p + c; }, 0);
        }
    });

    BaseNumber.prototype.buildDigit = function(x, y) {
        var digit;

        digit = this.getFirstDead();

        if (!digit) {
            digit = new BaseDigit(this.game, x, y, this.preFrame);
            this.add(digit);
        }

        digit.reset(x, y);

        return digit;
    };

    BaseNumber.prototype.reset = function(x, y) {
        this.digits.map(function(digit) {
            digit.kill();
        });
        this.digits = [];
        this.x = x;
        this.y = y;
        this.alpha = 1;
        this.exists = true;
    };
    
    BaseNumber.prototype.show = function(number) {
        var tmpNumber = number;
        var digit;

        while (tmpNumber > 0) {
            digit = this.buildDigit(0, 0);
            digit.play(tmpNumber % 10);
            this.digits.push(digit);
            tmpNumber = Math.floor(tmpNumber / 10);
        }

        while (this.digits.length < this.digitsLength) {
            digit = this.buildDigit(0, 0);
            digit.play(0);
            this.digits.push(digit);
        }

        var runningWidth = 0;
        for (var i = this.digits.length - 1; i >= 0; i--) {
            digit = this.digits[i];
            digit.reset(runningWidth, 0);
            runningWidth += digit.width;
        }
    };

    BaseNumber.prototype.hide = function() {
        this.alpha = 0;
        this.exists = false;
    };

    BaseNumber.prototype.tweenCounterPos = function(x, y) {
        return this.game.add.tween(this).
            to({ x: x, y: y }, 1000, Phaser.Easing.Linear.None, true);
    };

    function BaseDigit(game, x, y, preFrame) {
        this.preFrame = preFrame;
        Phaser.Sprite.call(this, game, x, y, 'marbleatlas', this.preFrame + '1');

        for (var i = 0; i < 10; i++) {
            this.animations.add(i+ '', [this.preFrame + i]);
        }
    }

    BaseDigit.prototype = Object.create(Phaser.Sprite.prototype);
    BaseDigit.prototype.constructor = BaseDigit;
    
    return BaseNumber;
});
