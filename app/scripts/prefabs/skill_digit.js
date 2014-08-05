'use strict';

define(['phaser', 'util'], function(Phaser, Util) {
    function SkillDigit(game, x, y, digit, fx) {
        this.digit = digit;

        this.fx = fx;

        this.preFrame = 'COMMON04_DIGITS' + digit;
        
        Phaser.Sprite.call(this, game, x, y, 'marbleatlas', this.preFrame + '1');

        this.frameRate = 26 * 10;

        this.animations.add('whirl',
                            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                             12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].mapConcat(this.preFrame), this.frameRate, false)
            .onComplete.add(this.whirlDecrease, this);

        this.onWhirlDone = new Phaser.Signal();
    }

    SkillDigit.prototype = Object.create(Phaser.Sprite.prototype);
    SkillDigit.prototype.constructor = SkillDigit;

    SkillDigit.prototype.whirl = function() {
        this.animations.play('whirl');
    };

    SkillDigit.prototype.playWhirlSound = function() {
        Util.playSfx(this.fx, 'NUSPIN');
    };
    
    SkillDigit.prototype.whirlDecrease = function() {
        var anim = this.animations.currentAnim;
        
        if (anim.speed <= 26) {
            anim.stop(false, false);
            this.onWhirlDone.dispatch();
        } else {
            anim.play(anim.speed - 26); // * 0.98076923076923120);
        }
    };

    return SkillDigit;
});
