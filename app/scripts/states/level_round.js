'use strict';

define(['phaser', 'prefabs/round_foreground', 'prefabs/marble_group', 'prefabs/marble_match', 'bot/bot_ai'], function(Phaser, RoundForeground, MarbleGroup, MarbleMatch, BotAI) {
    function LevelRoundState() {}

    LevelRoundState.prototype = {
        init: function(args) {
            this.levelData = args;
        },
        
        create: function() {
            
            this.renderLayer = this.game.add.group();
            
            this.background = this.game.add.sprite(0, 0, 'marbleatlas2', 'LEVEL1BG.png', this.renderLayer);

            this.foreground = new RoundForeground(this.game, this.levelData.round, this.renderLayer);

            this.match = new MarbleMatch(this.game, this.levelData, this.renderLayer);
            this.match.x = 53;
            this.match.y = 20;
            this.match.alpha = 0;
            
            this.match.onMatchEnd.add(this.roundEnd, this);
            
            this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.shiftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            
            this.foreground.startCountdown(this.roundStart ,this);

            this.botAI = new BotAI();
            this.botAI2 = new BotAI();
        },

        update: function() {
            this.botAI.update(this.match.queryGameState(MarbleMatch.Player.TWO));
            this.botAI2.update(this.match.queryGameState(MarbleMatch.Player.ONE));

            if (this.filter) {
                this.filter.update();
            }
        },
        
        roundStart: function() {
            this.foreground.alpha = 0;
            this.match.alpha = 1;
            this.match.matchStart();
            
            this.upKey.onDown.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.UP));
            this.downKey.onDown.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.DOWN));
            this.leftKey.onDown.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.LEFT));
            this.rightKey.onDown.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.RIGHT));
            this.shiftKey.onDown.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.SHIFT));

            
            // this.botAI2.upPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.UP));
            // this.botAI2.downPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.DOWN));
            // this.botAI2.leftPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.LEFT));
            // this.botAI2.rightPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.RIGHT));
            // this.botAI2.shiftPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.SHIFT));
            
            this.botAI.upPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.TWO, MarbleGroup.Input.UP));
            this.botAI.downPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.TWO, MarbleGroup.Input.DOWN));
            this.botAI.leftPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.TWO, MarbleGroup.Input.LEFT));
            this.botAI.rightPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.TWO, MarbleGroup.Input.RIGHT));
            this.botAI.shiftPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.TWO, MarbleGroup.Input.SHIFT));
        },
        
        roundEnd: function(winner) {
            this.levelData.round++;
            this.levelData.players[winner].score++;
            
            var tweenEnd = this.game.add.tween(this.renderLayer)
                .to({y: this.background.height}, 1000, Phaser.Easing.Linear.None, true);

            tweenEnd.onComplete.add(this.nextRound, this);
        },

        nextRound: function() {
            this.game.state.start('level-round', true, false, this.levelData);
        },
        
    };

    return LevelRoundState;
});
