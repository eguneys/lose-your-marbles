'use strict';

define(['phaser'], function(Phaser) {
    function LevelSplash(game, level, parent) {
        Phaser.Group.call(this, game, parent);

        this.levelText = this.create(0, 0, 'marbleatlas', 'DIALOG_TEXT_LEVEL');

        this.levelDigit = this.create(0, 0, 'marbleatlas', 'DIALOG_TEXT_DIGITS');
        this.levelDigit.animations.add('0', ['DIALOG_TEXT_DIGITS0']);
        this.levelDigit.animations.add('1', ['DIALOG_TEXT_DIGITS1']);
        this.levelDigit.animations.add('2', ['DIALOG_TEXT_DIGITS2']);
        this.levelDigit.animations.add('3', ['DIALOG_TEXT_DIGITS3']);
        this.levelDigit.animations.add('4', ['DIALOG_TEXT_DIGITS4']);
        this.levelDigit.animations.add('5', ['DIALOG_TEXT_DIGITS5']);
        this.levelDigit.animations.add('6', ['DIALOG_TEXT_DIGITS6']);
        this.levelDigit.animations.add('7', ['DIALOG_TEXT_DIGITS7']);
        this.levelDigit.animations.add('8', ['DIALOG_TEXT_DIGITS8']);
        this.levelDigit.animations.add('9', ['DIALOG_TEXT_DIGITS9']);
        
        this.levelDigit.x = this.levelText.width;

        this.levelDigit.animations.play(level);

        this.width = this.levelText.width;
        this.height = this.levelText.height;
    }

    LevelSplash.prototype = Object.create(Phaser.Group.prototype);
    LevelSplash.prototype.constructor = LevelSplash;

    return LevelSplash;
});
