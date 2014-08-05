'use strict';

define(['phaser', 'util'], function(Phaser, Util) {
    
    function RedMarble(game, parent, fx) {
        Phaser.Group.call(this, game, parent);

        this.fx = fx;
        
        this.redPoint = this.create(0, 0, 'marbleatlas', 'DIALOG_RED_POINT1');
        this.redPoint.animations
            .add('point', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].mapConcat('DIALOG_RED_POINT'),
                 12, true);
        this.redPoint.animations
            .add('jump', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].mapConcat('DIALOG_RED_JUMP'),
                 15, true);
        
        this.redPoint.animations
            .add('smack', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1].mapConcat('COMMON04_RED_SMACK'),
                 15, false);
        
        this.redPoint.animations
            .add('cry', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].mapConcat('DIALOG_RED_CRY'), 11, true);
        

        this.redLeftHand = this.create(0, 0, 'marbleatlas', 'DIALOG_RED_CRY_LEFT_HAND1');
        this.redLeftHand.alpha = 0;
        this.redLeftHand.animations
            .add('still', [2, 3, 4].mapConcat('DIALOG_RED_CRY_LEFT_HAND'), 3, true);
        this.redLeftHand.animations
            .add('move', [1, 2, 3, 4].mapConcat('DIALOG_RED_CRY_LEFT_HAND'), 4, false)
            .onComplete.add(function() {
                this.redLeftHand.animations.play('still');
            }, this);

        this.redRightHand = this.create(0, 0, 'marbleatlas', 'DIALOG_RED_CRY_RIGHT_HAND1');
        this.redRightHand.alpha = 0;
        this.redRightHand.animations
            .add('wave', [5, 6, 7, 8].mapConcat('DIALOG_RED_CRY_RIGHT_HAND'), 3, true);
        this.redRightHand.animations
            .add('raise', [1, 2, 3, 4].mapConcat('DIALOG_RED_CRY_RIGHT_HAND'), 5, false)
            .onComplete.add(function() {
                this.redRightHand.animations.play('wave');
            }, this);

        this.redRightHand.x = 5;
        
        this.width = this.redPoint.width;
        this.height = this.redPoint.height;
    }

    RedMarble.prototype = Object.create(Phaser.Group.prototype);
    RedMarble.prototype.constructor = RedMarble;

    RedMarble.prototype.playPlay = function() {
        this.redPoint.animations.play('jump');
    };

    RedMarble.prototype.playQuit = function() {
        this.redPoint.animations.play('cry');
        this.redLeftHand.alpha = 1;
        this.redRightHand.alpha = 1;
        this.redLeftHand.animations.play('move');
        this.redRightHand.animations.play('raise');
    };

    RedMarble.prototype.playPoint = function() {
        this.redPoint.animations.play('point');
    };

    RedMarble.prototype.playSmack = function() {
        // fix red marble offset bug.
        this.y -= 13;
        this.redPoint.animations.play('smack');
    };

    RedMarble.prototype.clearQuitHands = function() {
        this.redRightHand.alpha = 0;
        this.redLeftHand.alpha = 0;
    };

    RedMarble.prototype.playSoundPlay = function() {
        this.currentSound = 'BOING';
        this.loopSound = 'BOING';
        this.soundTimer = 1200;
        this.soundInitial = true;
    };

    RedMarble.prototype.playSoundSad = function() {
        this.currentSound = 'SAD';
        this.loopSound = 'SADRPT';
        this.soundTimer = 1200;
        this.soundInitial = true;
    };

    RedMarble.prototype.playSoundHappy = function() {
        this.currentSound = 'HAPPY';
        this.soundInitial = true;
    };

    RedMarble.prototype.stopSound = function() {
        this.currentSound = '';
    };

    RedMarble.prototype.update = function() {
        if (this.currentSound !== '') {
            if (this.soundInitial) {
                this.soundInitial = false;
                Util.playSfx(this.fx, this.currentSound);
            } else if (this.loopSound !== '') {
                this.soundTimer -= this.game.time.elapsed;

                if (this.soundTimer <= 0) {
                    this.soundTimer = 1000;
                    Util.playSfx(this.fx, this.loopSound);
                }
            }
        }
    };

    return RedMarble;
});
