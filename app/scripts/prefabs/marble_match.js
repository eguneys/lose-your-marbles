'use strict';

define(['phaser', 'prefabs/marble_group', 'prefabs/marble_hud', 'prefabs/marble'], function(Phaser, MarbleGroup, MarbleHud, Marble) {
    function MarbleMatch(game, parent) {
        Phaser.Group.call(this, game, parent);

        this.matchInfo = [];
        this.marbles = [];
        this.hud = [];
        
        var p1Info = {
            pos: { x: 0, y: 0 },
            matchColor: Marble.Color.GREEN,
        };

        this.matchInfo[MarbleMatch.Player.ONE] = p1Info;

        var p1 = new MarbleGroup(this.game, this);

        p1.onMarbleMatched.add(this.marbleMatched.bind(this, MarbleMatch.Player.ONE));

        this.marbles[MarbleMatch.Player.ONE] = p1;

        var p2Info = {
            pos: { x: 640 - 53 - 50 - (p1.width * 5/6), y: 0 },
            matchColor: Marble.Color.GREEN
        };

        this.matchInfo[MarbleMatch.Player.TWO] = p2Info;

        var p2 = new MarbleGroup(this.game, this);
        p2.x = p2Info.pos.x;
        p2.y = p2Info.pos.y;
        p2.onMarbleMatched.add(this.marbleMatched.bind(this, MarbleMatch.Player.TWO));

        this.marbles[MarbleMatch.Player.TWO] = p2;

        var hudDiff = p2Info.pos.x - (p1Info.pos.x + p1.width) - 50;
        
        var p1Hud = new MarbleHud(this.game, this, p1Info.matchColor, p1.height, hudDiff);
        p1Hud.x = p1.width;

        this.hud[MarbleMatch.Player.ONE] = p1Hud;

    }

    MarbleMatch.prototype = Object.create(Phaser.Group.prototype);
    MarbleMatch.prototype.constructor = MarbleMatch;

    MarbleMatch.Player = {
        ONE: 0,
        TWO: 1
    };

    MarbleMatch.prototype.matchStart = function() {
        this.marbles[MarbleMatch.Player.ONE].initMarbles();
        this.marbles[MarbleMatch.Player.TWO].initMarbles();
    };
    
    MarbleMatch.prototype.marbleMatched = function(player, color, count, streak) {
        if (color === this.matchInfo[player].matchColor) {
            this.hud[player].counterIncrease();
        }

        if (streak > 0) {
            var opponent = (player + 1) % 2;
            this.hud[player].streakShow(Math.pow(2, streak));
        }

        if (count === 5) {
            this.hud[player].counterDump(color);

            this.matchInfo[player].matchColor = color;
        }
    };

    MarbleMatch.prototype.handleInput = function(player, input) {
        this.marbles[player].handleInput(input);
    };
    
    return MarbleMatch;
});
