'use strict';

define(['phaser'], function(Phaser) {
    function Marble(game, row, column, color) {
        this.marbleColor = color;
        
        var colorString = Marble.ColorStrings[this.marbleColor];
        
        this.preFrame = 'COMMON01_BALL_' + colorString;

        var y = row * Marble.HEIGHT + Marble.HEIGHT / 2;
        var x = column * Marble.WIDTH + Marble.WIDTH / 2;

        Phaser.Sprite.call(this, game, x, y,
                           'marbleatlas', this.preFrame + '1');

        this.frameRate = 4 / (Marble.MOVE_DURATION/1000);
        
        var pofFrame = 'COMMON01_BALL_CRASH_' + colorString;

        this.animations.add('up2',
                            [1, 2, 3, 4].mapConcat(this.preFrame), this.frameRate);
        this.animations.add('up1',
                            [5, 6, 7, 8].mapConcat(this.preFrame), this.frameRate);
        this.animations.add('up0',
                            [9, 10, 11, 12].mapConcat(this.preFrame), this.frameRate);
        this.animations.add('down1',
                            [11, 10, 9, 8].mapConcat(this.preFrame), this.frameRate);
        this.animations.add('down2',
                            [7, 6, 5, 4].mapConcat(this.preFrame), this.frameRate);
        this.animations.add('down0',
                            [3, 2, 1, 12].mapConcat(this.preFrame), this.frameRate);
        this.animations.add('left',
                            [13, 14, 15, 12].mapConcat(this.preFrame), this.frameRate);
        this.animations.add('pof',
                            [1, 2, 3, 4, 5, 6].mapConcat(pofFrame));
        this.animations.add('upfull', [1,2,3,4,5,6,7,8,9,10,11,12].mapConcat(this.preFrame), this.frameRate, true);

        this.setRow(row);

        this.canRecycle = false;

        this.anchor = { x: 0.5, y: 0.5 };
    }

    Marble.prototype = Object.create(Phaser.Sprite.prototype);
    Marble.prototype.constructor = Marble;
    
    Marble.Color = {
        GREEN: 0,
        YELLOW: 1,
        BLACK: 2,
        RED: 3,
        BLUE: 4
    };

    Marble.ColorStrings = ['GREEN', 'YELLOW', 'BLACK', 'RED', 'BLUE'];

    Marble.WIDTH = 32;
    Marble.HEIGHT = 29;

    // TODO increase this to fix input allow bug
    // value 100 causes a strange bug
    // probably fixed now
    Marble.MOVE_DURATION = 150;

    Marble.prototype.reset = function(row, column) {
        var y = row * Marble.HEIGHT + Marble.HEIGHT / 2;
        var x = column * Marble.WIDTH + Marble.WIDTH / 2;
        
        Phaser.Sprite.prototype.reset.call(this, x, y);
        this.setRow(row);
        this.canRecycle = false;
    };

    Marble.prototype.setRow = function(row) {
        // tweak so 7th row ends up 0
        var index = (- row + 7 + 12) % 3;
        this.frameName = ([12, 4, 8].mapConcat(this.preFrame))[index];
    };

    Marble.prototype.allowRecycle = function() {
        this.canRecycle = true;
    };
    
    Marble.prototype.up = function(i) {
        var index = (i - 7 + 12) % 3;
        this.animations.play('up' + index);
        
        return this.tweenMarblePosY(i);
    };

    Marble.prototype.down = function(i) {
        var index = (i - 7 + 12) % 3;
        this.animations.play('down' + index);

        return this.tweenMarblePosY(i);
    };

    Marble.prototype.shift = function(i) {
        this.animations.play('left');

        return this.tweenMarblePosX(i);
    };

    Marble.prototype.shiftRightMost = function(i) {
        this.animations.play('left');

        var tween = this.tweenMarblePosX(i);
        
        tween.onComplete.add(function() {
            this.x = 0 + Marble.WIDTH / 2;
        }, this);

        return tween;
    };

    Marble.prototype.syncMarble = function(i, marble) {
        var aindex = (i - 7 + 12) % 3;

        // What's the difference between these they don't match
        //console.log(this.animations.currentFrame);
        //console.log(this.animations.currentAnim.currentFrame);

        // save the previous animation frame
        var cf = this.animations.currentAnim.currentFrame;
        
        // stop the current animation
        this.animations.currentAnim.stop();
        
        if (marble.animations.currentAnim.isPlaying) {
            // animation to be played
            //var a = this.animations.getAnimation('down' + aindex);
            var syncAnim = marble.animations.currentAnim.name;
            syncAnim = syncAnim.replace(/\d+/g, '') + aindex;
            
            var a = this.animations.getAnimation(syncAnim);

            // this is bad
            //a.play();

            // call the animation manager to play
            this.animations.play(syncAnim);
            
            if (cf) {
                // currentAnim is changed
                //a.setFrame(this.animations.currentAnim.currentFrame.name);
                a.setFrame(cf.name);
                
                // calling set frame with a number doesn't work
                //a.setFrame(10);
                // a local index can be used
                //a.setFrame(10, true);
            }
        }

        return this.tweenMarblePosYDurationTweak(i);
    };

    Marble.prototype.calculateOverlap = function(marble) {
        return Math.abs(this.y - marble.y) <= Marble.HEIGHT;
    };

    Marble.prototype.playBlink = function() {
        var tween = this.tweenMarbleBlink();

        return tween;
    };
    
    Marble.prototype.playKill = function() {
        this.bringToTop();
        var frameRate = 6 / (Marble.MOVE_DURATION / 1000);
        this.animations.play('pof', frameRate , false, true);
    };

    Marble.prototype.tweenMarbleBlink = function() {
        var tweenOff = this.game.add.tween(this)
            .to({ alpha: 0 }, 100, Phaser.Easing.Bounce.In);
        var tweenOn = this.game.add.tween(this)
            .to({ alpha: 1}, 100, Phaser.Easing.Bounce.In);

        tweenOff.chain(tweenOn);

        tweenOff.start();

        return tweenOn;
    };
    
    Marble.prototype.tweenMarblePos = function(x, y) {
        return this.game.add.tween(this).
            to({x: x * Marble.WIDTH + this.width / 2, y: y * Marble.HEIGHT + this.height / 2 }, Marble.MOVE_DURATION, Phaser.Easing.Linear.None, true);
    };

    Marble.prototype.tweenMarblePosX = function(x) {
        return this.game.add.tween(this).
            to({x: x * Marble.WIDTH + this.width / 2 }, Marble.MOVE_DURATION, Phaser.Easing.Linear.None, true);
    };

    Marble.prototype.tweenMarblePosY = function(y) {
        return this.game.add.tween(this).
            to({y: y * Marble.HEIGHT + this.height / 2 }, Marble.MOVE_DURATION, Phaser.Easing.Linear.None, true);
    };

    Marble.prototype.tweenMarblePosYDurationTweak = function(y) {
        y = y * Marble.HEIGHT + this.height / 2;
        
        var distance = Math.abs(this.y - y);
        var ratio = distance / this.height;
        var duration = Marble.MOVE_DURATION * ratio;

        // if duration == 0 defaults to 1000
        duration = duration || 1;
        
        return this.game.add.tween(this).
            to({ y: y }, duration, Phaser.Easing.Linear.None, true);
    };
    
    return Marble;
});
