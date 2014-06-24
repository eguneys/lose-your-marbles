'use strict';

define(['phaser', 'prefabs/marble_group', 'prefabs/marble_hud', 'prefabs/marble'], function(Phaser, MarbleGroup, MarbleHud, Marble) {
    function MarbleMatch(game, levelData, parent) {
        Phaser.Group.call(this, game, parent);

        this.levelData = levelData;
        
        this.matchInfo = [];
        this.marbles = [];
        this.hud = [];
        
        var p1Info = {
            pos: { x: 0, y: 0 },
            matchColor: Marble.Color.GREEN,
            skill: levelData.players[MarbleMatch.Player.ONE].skill,
            score: levelData.players[MarbleMatch.Player.ONE].score
        };

        this.matchInfo[MarbleMatch.Player.ONE] = p1Info;

        var p1 = new MarbleGroup(this.game, this);
        p1.onMarbleMatched.add(this.marbleMatched.bind(this, MarbleMatch.Player.ONE));
        p1.onMarbleFull.add(this.marbleFull.bind(this, MarbleMatch.Player.ONE));

        this.marbles[MarbleMatch.Player.ONE] = p1;

        var p2Info = {
            pos: { x: 640 - 53 - 50 - (p1.width * 5/6), y: 0 },
            matchColor: Marble.Color.GREEN,
            skill: levelData.players[MarbleMatch.Player.TWO].skill,
            score: levelData.players[MarbleMatch.Player.TWO].score
        };

        this.matchInfo[MarbleMatch.Player.TWO] = p2Info;

        var p2 = new MarbleGroup(this.game, this);
        p2.x = p2Info.pos.x;
        p2.y = p2Info.pos.y;
        p2.onMarbleMatched.add(this.marbleMatched.bind(this, MarbleMatch.Player.TWO));
        p2.onMarbleFull.add(this.marbleFull.bind(this, MarbleMatch.Player.TWO));
        
        this.marbles[MarbleMatch.Player.TWO] = p2;

        var hudDiff = p2Info.pos.x - (p1Info.pos.x + p1.width) - 50;
        
        var p1Hud = new MarbleHud(this.game, this, p1Info.matchColor, this.levelData.level, p1Info.score, p1.height, hudDiff);
        p1Hud.x = p1.width;
        p1Hud.onMarblePop.add(this.marblePop.bind(this, MarbleMatch.Player.ONE));

        this.hud[MarbleMatch.Player.ONE] = p1Hud;

        var p2Hud = new MarbleHud(this.game, this, p2Info.matchColor, this.levelData.level, p2Info.score, p2.height, -hudDiff);
        p2Hud.x = p2Info.pos.x - Marble.WIDTH * 2;
        p2Hud.onMarblePop.add(this.marblePop.bind(this, MarbleMatch.Player.TWO));
        this.hud[MarbleMatch.Player.TWO] = p2Hud;

        this.onMatchEnd = new Phaser.Signal();
    }

    MarbleMatch.prototype = Object.create(Phaser.Group.prototype);
    MarbleMatch.prototype.constructor = MarbleMatch;

    MarbleMatch.Player = {
        ONE: 0,
        TWO: 1
    };

    MarbleMatch.prototype.matchStart = function() {
        var m1 = this.matchInfo[MarbleMatch.Player.ONE].skill;
        var m2 = this.matchInfo[MarbleMatch.Player.TWO].skill;
        
        this.marbles[MarbleMatch.Player.ONE].initMarbles(m1);
        this.marbles[MarbleMatch.Player.TWO].initMarbles(m2);
    };

    MarbleMatch.prototype.matchEnd = function() {
        this.marbles[MarbleMatch.Player.ONE].stopHandleInput();
        this.marbles[MarbleMatch.Player.TWO].stopHandleInput();
    };

    MarbleMatch.prototype.marbleFull = function(loser) {
        var winner = (loser + 1) % 2;
        this.matchEnd(winner);

        var tween = this.tweenMatchEnd(loser);

        this.game.time.events.add(2000, function() {
            this.onMatchEnd.dispatch(winner);
        }, this);
    };
    
    MarbleMatch.prototype.marbleMatched = function(player, color, count, streak) {
        this.marbleFull(player);
        return;
        
        var opponent = (player + 1) % 2;

        if (color === this.matchInfo[player].matchColor) {
            this.hud[player].counterIncrease();
        }

        if (streak > 0) {
            var points = Math.pow(2, streak);
            var tween = this.hud[player].streakShow(points);
            tween.onComplete.add(function() {
                this.marbles[opponent].dropMarblesNoAnim(points);
            }, this);
        }

        if (count === 3) {
            if (color === this.matchInfo[player].matchColor) {
                this.marbles[opponent].dropMarbles(3);
            } else {
                this.marbles[opponent].dropMarbles(1);
            }
        } else if (count === 4) {
            if (color === this.matchInfo[player].matchColor) {
                this.marbles[opponent].dropMarbles(4);
            } else {
                this.marbles[opponent].dropMarbles(2);
            }
        } else {
            this.hud[player].counterDump(color);
            this.matchInfo[player].matchColor = color;
        }
    };
       
    MarbleMatch.prototype.marblePop = function(player, count) {
        var opponent = (player + 1) % 2;
        
        count = count;
        
        this.marbles[opponent].dropMarbles(3);
    };

    MarbleMatch.prototype.handleInput = function(player, input) {
        this.marbles[player].handleInput(input);
    };

    MarbleMatch.prototype.queryGameState = function(player) {
        if (this.marbles[player].allowInput) {
            var state =  this.marbles[player].queryGameState();
            state.matchColor = this.matchInfo[player].matchColor;
            return state;
        }
        
        return null;
    };

    MarbleMatch.prototype.tweenMatchEnd = function(loser) {
        var winner = (loser + 1) % 2;
        var Y = 100;
        var winX = this.matchInfo[winner].pos.x;
        var loseX = this.matchInfo[loser].pos.x;

        this.winS = this.create(winX, Y, 'marbleatlas', 'COMMON03_TEXT_WIN');
        this.loseS = this.create(loseX, Y, 'marbleatlas', 'COMMON03_TEXT_LOSE');

        var obj = { angle: 2 * Math.PI };
        var tweenCircle = this.game.add.tween(obj)
            .to({ angle: 0 }, 500, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE);

        tweenCircle.onUpdateCallback(this.winCircleTweenUpdate.bind(this, winX, loseX, Y, obj));

        return tweenCircle;
    };

    MarbleMatch.prototype.winCircleTweenUpdate = function(winX, loseX, Y, obj) {
        var r = 5;
        var cX = Math.cos(obj.angle) * r;
        var cY = Math.sin(obj.angle) * r;
        
        this.winS.x = winX + cX;
        this.winS.y = Y + cY;

        this.loseS.x = loseX + cX;
        this.loseS.y = Y + cY;
    };
    
    return MarbleMatch;
});
