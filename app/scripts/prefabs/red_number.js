'use strict';

define(['phaser'], function(Phaser) {
    function RedNumber(game, parent) {
        Phaser.Group.call(this, game, parent);

        this.digits = [];
    }

    RedNumber.prototype = Object.create(Phaser.Group.prototype);
    RedNumber.prototype.constructor = RedNumber;

    Object.defineProperty(RedNumber.prototype, 'width', {
        get: function() {
            return this.digits
                .map(function(item) { return item.width; })
                .reduce(function(p, c) { return p + c; }, 0);
        }
    });

    Object.defineProperty(RedNumber.prototype, 'height', {
        get: function() {
            return this.digits
                .map(function(item) { return item.height; })
                .reduce(function(p, c) { return p + c; }, 0);
        }
    });

    RedNumber.prototype.buildDigit = function(x, y) {
        var digit;

        digit = this.getFirstDead();

        if (!digit) {
            digit = new RedDigit(this.game, x, y);
            this.add(digit);
        }

        digit.reset(x, y);

        return digit;
    };

    RedNumber.prototype.reset = function(x, y) {
        this.digits.map(function(digit) {
            digit.kill();
        });
        this.digits = [];
        this.x = x;
        this.y = y;
        this.alpha = 1;
        this.exists = true;
    };
    
    RedNumber.prototype.show = function(number) {
        var tmpNumber = number;
        var digit;

        while (tmpNumber > 0) {
            digit = this.buildDigit(0, 0);
            digit.play(tmpNumber % 10);
            this.digits.push(digit);
            tmpNumber = Math.floor(tmpNumber / 10);
        }

        var runningWidth = 0;
        for (var i = this.digits.length - 1; i >= 0; i--) {
            digit = this.digits[i];
            digit.reset(runningWidth, 0);
            runningWidth += digit.width;
        }
    };

    RedNumber.prototype.hide = function() {
        this.alpha = 0;
        this.exists = false;
    };

    RedNumber.prototype.tweenCounterPos = function(x, y) {
        return this.game.add.tween(this).
            to({ x: x, y: y }, 1000, Phaser.Easing.Linear.None, true);
    };

    function RedDigit(game, x, y) {
        this.preFrame = 'COMMON02_DIGIT_';
        Phaser.Sprite.call(this, game, x, y, 'marbleatlas', this.preFrame + '11');
                
        this.frameRate = 7 * 1.5;

        for (var i = 0; i < 10; i++) {
            this.animations.add(i + '', [1, 2, 3, 4, 5, 6, 7].mapConcat(this.preFrame + i), this.frameRate, true);
        }
    }

    RedDigit.prototype = Object.create(Phaser.Sprite.prototype);
    RedDigit.prototype.constructor = RedDigit;
    
    return RedNumber;
});
