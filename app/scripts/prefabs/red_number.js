'use strict';

define(['phaser'], function(Phaser) {
    function RedNumber(game, parent) {
        Phaser.Group.call(this, game, parent);
        
        this.digit = this.create(0, 0, 'marbleatlas', 'COMMON02_DIGIT_11');

        this.frameRate = 7 * 1.5;
        
        this.digit.animations.add('1', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_1'), this.frameRate, true);
        this.digit.animations.add('2', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_2'), this.frameRate, true);
        this.digit.animations.add('3', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_3'), this.frameRate, true);
        this.digit.animations.add('4', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_4'), this.frameRate, true);
        this.digit.animations.add('5', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_5'), this.frameRate, true);
        this.digit.animations.add('6', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_6'), this.frameRate, true);
        this.digit.animations.add('7', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_7'), this.frameRate, true);
        this.digit.animations.add('8', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_8'), this.frameRate, true);
        this.digit.animations.add('9', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_9'), this.frameRate, true);
        this.digit.animations.add('0', [1, 2, 3, 4, 5, 6, 7].mapConcat('COMMON02_DIGIT_0'), this.frameRate, true);
    }

    RedNumber.prototype = Object.create(Phaser.Group.prototype);
    RedNumber.prototype.constructor = RedNumber;

    Object.defineProperty(RedNumber.prototype, 'width', {
        get: function() {
            return this.digit.width;
        }
    });

    Object.defineProperty(RedNumber.prototype, 'height', {
        get: function() {
            return this.digit.height;
        }
    });

    RedNumber.prototype.reset = function(x, y) {
        this.digit.reset(0, 0);
        this.x = x;
        this.y = y;
        this.alpha = 1;
        this.exists = true;
    };
    
    RedNumber.prototype.show = function(number) {
        this.digit.play(number + '');
    };

    RedNumber.prototype.hide = function() {
        this.alpha = 0;
        this.exists = false;
    };

    RedNumber.prototype.tweenCounterPos = function(x, y) {
        return this.game.add.tween(this).
            to({ x: x, y: y }, 1000, Phaser.Easing.Linear.None, true);
    };
    
    return RedNumber;
});
