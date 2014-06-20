'use strict';

define(['phaser'], function(Phaser) {
    function LevelForeground(game) {
        Phaser.Group.call(this, game);

        this.rect1 = new Phaser.Rectangle(10, 0, 180, 480);
        this.rect2 = new Phaser.Rectangle(610 - 180 - 40, 0, 170, 480);
        
        this.beginDraw = false;
        
        this.foreground = this.create(0, 0, 'marbleatlas2', 'LEVEL1BG.png');

        this.foregroundMask = new RectGroup(this.game);
        
        this.foreground.mask = this.foregroundMask;
    }

    LevelForeground.prototype = Object.create(Phaser.Group.prototype);
    LevelForeground.prototype.constructor = LevelForeground;

    LevelForeground.prototype.getDrawTweens = function() {
        var tween1 = this.tweenRect(this.rect1);
        var tween2 = this.tweenRect(this.rect2);
        
        tween1.last.onComplete.add(function() {
            tween2.first.start();
        });

        return { first: tween1.first, last: tween2.last };
    };

    LevelForeground.prototype.updateMask = function() {
        this.foregroundMask.updateLines();
    };

    LevelForeground.prototype.tweenRect = function(rect) {

        var thickness = 70;
        
        var line1 = new Phaser.Rectangle(rect.left, rect.top, thickness, 0);
        var line2 = new Phaser.Rectangle(rect.left + thickness, rect.bottom - thickness, 0, thickness);
        var line3 = new Phaser.Rectangle(rect.right, rect.bottom - thickness, thickness, 0);
        var line4 = new Phaser.Rectangle(rect.right, rect.top, 0, thickness);
        var line5 = new Phaser.Rectangle(rect.left + thickness, rect.centerY - thickness / 2, 0, thickness / 2);
        var line6 = new Phaser.Rectangle(rect.left + thickness, rect.centerY, 0, thickness / 2);

        this.foregroundMask.addRect(line1);
        
        var tween1 = this.game.add.tween(line1)
            .to({ height: rect.height }, 1000);
        
        tween1.onComplete.add(function() {
            this.foregroundMask.addRect(line2);
        }, this);

        var tween2 = this.game.add.tween(line2)
            .to({ width: rect.width } , 300);

        tween2.onComplete.add(function() {
            this.foregroundMask.addRect(line3);
        }, this);
        
        var tween3 = this.game.add.tween(line3)
            .to({ height: - (rect.height - thickness) }, 1000);

        tween3.onComplete.add(function() {
            this.foregroundMask.addRect(line4);
        }, this);
        
        var tween4 = this.game.add.tween(line4)
            .to({ width: - (rect.width - thickness) }, 300);

        tween4.onComplete.add(function() {
            this.foregroundMask.addRect(line5);
        }, this);
        
        var tween5 = this.game.add.tween(line5)
            .to({ width: rect.width - thickness}, 300);

        tween5.onComplete.add(function() {
            this.foregroundMask.addRect(line6);
        }, this);
        
        var tween6 = this.game.add.tween(line6)
            .to({ width: rect.width - thickness}, 300);
        
        tween1.chain(tween2);
        tween2.chain(tween3);
        tween3.chain(tween4);
        tween4.chain(tween5);
        tween5.chain(tween6);
        
        tween1.onUpdateCallback(this.updateMask, this);
        tween2.onUpdateCallback(this.updateMask, this);
        tween3.onUpdateCallback(this.updateMask, this);
        tween4.onUpdateCallback(this.updateMask, this);
        tween5.onUpdateCallback(this.updateMask, this);
        tween6.onUpdateCallback(this.updateMask, this);

        return { first: tween1, last: tween6 };
    };

    function RectGroup(game) {
        Phaser.Graphics.call(this, game, 0, 0);

        this.rects = [];
        this.lastRect = null;
    }

    RectGroup.prototype = Object.create(Phaser.Graphics.prototype);
    RectGroup.prototype.constructor  = Object.create(RectGroup);
    
    RectGroup.prototype.addRect = function(rect) {
        if (this.lastRect !== null) {
            this.rects.push(this.lastRect);
        }

        this.lastRect = rect;
    };

    RectGroup.prototype.updateLines = function() {
        this.clear();
        this.beginFill(0xffffff);
        for (var i = 0; i < this.rects.length; i++) {
            this.drawRect(this.rects[i].x, this.rects[i].y, this.rects[i].width, this.rects[i].height);
        }
        
        this.drawRect(this.lastRect.x, this.lastRect.y, this.lastRect.width, this.lastRect.height);
    };

    
    
    return LevelForeground;
});
