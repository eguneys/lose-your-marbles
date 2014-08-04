'use strict';

define(['phaser', 'prefabs/marble_group', 'prefabs/marble_hud', 'prefabs/marbles_timer', 'prefabs/base_number', 'prefabs/marble'], function(Phaser, MarbleGroup, MarbleHud, MarblesTimer,BaseNumber, Marble) {
    function MarbleBonusMatch(game, levelData, parent, fx) {
        Phaser.Group.call(this, game, parent);

        this.fx = fx;
        
        this.levelData = levelData;

        this.status = MarbleBonusMatch.State.INITIAL;

        this.timeLeft = 90;
        this.marblesCounter = 0;
        
        var p1Info = {
            pos: { x: 0, y: 0 },
            matchColor: Marble.Color.GREEN,
            score: 10,
            skill: 1
            //skill: levelData.players[MarbleBonusMatch.Player.ONE].skill,
            //score: levelData.players[MarbleBonusMatch.Player.ONE].score
        };

        this.matchInfo = p1Info;

        var p1 = new MarbleGroup(this.game, this, this.fx);
        p1.onMarbleMatched.add(this.marbleMatched, this);
        p1.onMarbleFull.add(this.marbleFull, this);

        this.marbles = p1;

        // TODO what's this
        var hudDiff = 100;

        var p1Hud = new MarbleHud(this.game, this, this.fx, p1Info.matchColor, this.levelData.level, p1Info.score, p1.height, hudDiff);
        p1Hud.x = p1.width;
        p1Hud.onMarblePop.add(this.marblePop, this);

        this.hud = p1Hud;

        this.sideLayer = this.game.add.group(this);
        this.sideLayer.x = p1.width;
        
        this.timerTitle = this.game.add.sprite(0, 0, 'marbleatlas', 'COMMON03_TEXT_MARBLES_TIMER', this.sideLayer);

        this.timer = new MarblesTimer(this.game, this.sideLayer, this.fx);
        this.timer.x = 6;
        this.timer.y = this.timerTitle.height + 20;
        
        this.marblesTitle = this.game.add.sprite(180, 0, 'marbleatlas', 'COMMON03_TEXT_MARBLES', this.sideLayer);

        this.marblesCounter = new BaseNumber(this.game, this.sideLayer, 'COMMON03_DIGIT_', 2);
        this.marblesCounter.x = this.marblesTitle.x + 20;
        this.marblesCounter.y = this.marblesTitle.height + 20;

        
        this.marblesCounter.show(this.marblesCount);
        
        this.onMatchEnd = new Phaser.Signal();
    }
    
    MarbleBonusMatch.prototype = Object.create(Phaser.Group.prototype);
    MarbleBonusMatch.prototype.constructor = MarbleBonusMatch;

    MarbleBonusMatch.State = {
        INITIAL: 0,
        END: 1
    };

    MarbleBonusMatch.prototype.matchStart = function() {
        var m1 = this.matchInfo.skill;
        
        this.marbles.initMarbles(m1);
    };

    MarbleBonusMatch.prototype.matchEnd = function() {
        this.marbles.stopHandleInput();
    };

    MarbleBonusMatch.prototype.marbleFull = function() {
        if (this.state === MarbleBonusMatch.State.END) { return; }
        this.state = MarbleBonusMatch.State.END;
        
        this.matchEnd();

        this.tweenMatchEnd();
        
        this.game.time.events.add(2000, function() {
            this.onMatchEnd.dispatch();
        }, this);
    };
    
    MarbleBonusMatch.prototype.marbleMatched = function(color, count, streak) {
        
        if (color === this.matchInfo.matchColor) {
            this.hud.counterIncrease();
        }

        // drop when?
        if (false && streak > 0) {
            var points = Math.pow(2, streak);
            var tween = this.hud.streakShow(points);
            tween.onComplete.add(function() {
                this.marbles.dropMarblesNoAnim(points);
            }, this);
        }

        // TODO do stuff
        // if (count === 3) {
        //     if (color === this.matchInfo[player].matchColor) {
        //         this.marbles[opponent].dropMarbles(3);
        //     } else {
        //         this.marbles[opponent].dropMarbles(1);
        //     }
        // } else if (count === 4) {
        //     if (color === this.matchInfo[player].matchColor) {
        //         this.marbles[opponent].dropMarbles(4);
        //     } else {
        //         this.marbles[opponent].dropMarbles(2);
        //     }
        // } else {
        //     this.hud[player].counterDump(color);
        //     this.matchInfo[player].matchColor = color;
        // }
    };
       
    MarbleBonusMatch.prototype.marblePop = function(count) {
        count = count;
        // TODO what?
    };

    MarbleBonusMatch.prototype.handleInput = function(input) {
        this.marbles.handleInput(input);
    };

    MarbleBonusMatch.prototype.updateTimer = function() {
        var elapsed = this.game.time.elapsed;
        this.timeLeft -= elapsed / 1000;

        this.timer.show(this.timeLeft);
    };

    MarbleBonusMatch.prototype.addMarbles = function(count) {
        this.marblesCount += count;

        this.marblesCounter.show(this.marblesCount);
    };
    
    MarbleBonusMatch.prototype.tweenMatchEnd = function() {
        // TODO
    };
    
    MarbleBonusMatch.prototype.playSoundVictory = function() {
        this.fx.play('VICTORY');
    };

    MarbleBonusMatch.prototype.playSoundLoss = function() {
        this.fx.play('LOSS');
    };
    
    return MarbleBonusMatch;
});
