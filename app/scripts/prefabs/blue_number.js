'use strict';

define(['phaser', 'util'], function(Phaser, Util) {
    function BlueNumber(game, parent, fx) {
        Phaser.Group.call(this, game, parent);

        this.fx = fx;

        this.digit = this.create(0, 0, 'marbleatlas', 'COMMON03_DIGIT_0');
        this.digit.animations.add('0', ['COMMON03_DIGIT_0']);
        this.digit.animations.add('1', ['COMMON03_DIGIT_1']);
        this.digit.animations.add('2', ['COMMON03_DIGIT_2']);
        this.digit.animations.add('3', ['COMMON03_DIGIT_3']);
        this.digit.animations.add('4', ['COMMON03_DIGIT_4']);
        this.digit.animations.add('5', ['COMMON03_DIGIT_5']);
        this.digit.animations.add('6', ['COMMON03_DIGIT_6']);
        this.digit.animations.add('7', ['COMMON03_DIGIT_7']);
        this.digit.animations.add('8', ['COMMON03_DIGIT_8']);
        this.digit.animations.add('9', ['COMMON03_DIGIT_9']);
        this.digit.animations.add('go', ['COMMON03_TEXT_GO']);
    }

    BlueNumber.prototype = Object.create(Phaser.Group.prototype);
    BlueNumber.prototype.constructor = BlueNumber;

    Object.defineProperty(BlueNumber.prototype, 'width', {
        get: function() {
            return this.digit.width;
        }
    });

    Object.defineProperty(BlueNumber.prototype, 'height', {
        get: function() {
            return this.digit.height;
        }
    });
    
    BlueNumber.prototype.show = function(number) {
        this.digit.play(number + '');
        
        this.pivot = { x: this.width / 2, y: this.height / 2 };
    };

    BlueNumber.prototype.playSound = function() {
        Util.playSfx(this.fx, 'SELECT2');
    };

    BlueNumber.prototype.playSoundGo = function() {
        Util.playSfx(this.fx, 'GO');
    };
    
    return BlueNumber;
});
