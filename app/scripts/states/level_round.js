'use strict';

define(['phaser',
        'states/level_master',
        'prefabs/round_foreground',
        'prefabs/pause_menu',
        'prefabs/fade_tween',
        'prefabs/marble_group', 'prefabs/marble_match', 'bot/bot_ai', 'util'],
       function(Phaser,
                LevelMasterState,
                RoundForeground,
                PauseMenu,
                FadeTween,
                MarbleGroup, MarbleMatch, BotAI, Util) {
    function LevelRoundState() {}

    LevelRoundState.States = {
        INTRO: 'intro',
        PLAYING: 'playing',
        ROUND_END: 'round_end',
        OUTRO: 'outro',
        PAUSED_TRANSITION: 'pause_transition',
        PAUSED: 'pause',
        EXIT_TRANSITION: 'exit_transition'
    };
    
    LevelRoundState.prototype = {
        init: function(levelData, transitionData) {
            this.levelData = levelData;
            this.transitionData = transitionData;
        },
        
        create: function() {
            this.fx = Util.parseAudioSprite(this.game);

            this.roundState = LevelRoundState.States.INTRO;
            
            var level = this.levelData.level;
            
            this.renderLayer = this.game.add.group();
            
            this.background = this.game.add.sprite(0, 0, 'marbleatlas2', 'LEVEL' + level + 'BG.png', this.renderLayer);

            this.foreground = new RoundForeground(this.game, this.levelData.round, this.renderLayer, this.fx);

            this.match = new MarbleMatch(this.game, this.levelData, this.renderLayer, this.fx);
            this.match.x = 53;
            this.match.y = 20;
            this.match.alpha = 0;
            
            this.match.onMatchEnd.add(function(winner) {
                this.roundState = LevelRoundState.States.ROUND_END;
                this.roundWinner = winner;
            }, this);

            this.pauseMenu = new PauseMenu(this.game, this.renderLayer, level, this.fx);

            this.fadeBg = new FadeTween(this.game, 0xffffff, 1);
            this.game.add.existing(this.fadeBg);
            this.fadeBg.alpha = 0;
            // set alpha to 0 afterwards otherwise it doesn't work :S
            
            this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.shiftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            
            this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            this.escKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
            
            this.botAI = new BotAI();
            this.botAI2 = new BotAI();

            this.roundStart();
        },

        update: function() {
            if (this.roundState === LevelRoundState.States.PLAYING) {
                this.botAI.update(this.match.queryGameState(MarbleMatch.Player.TWO));
                this.botAI2.update(this.match.queryGameState(MarbleMatch.Player.ONE));
            }
        },
        
        roundStart: function() {
            this.tweenIntro();
        },
        
        roundEnd: function(winner) {
            this.levelData.players[winner].score++;

            this.tweenOutro();
        },

        roundPause: function() {
            this.roundStateResume = this.roundState;
            this.roundState = LevelRoundState.States.PAUSED_TRANSITION;

            this.tweenPauseMenuShow();
            this.playSoundZoomIn();
        },

        roundResume: function() {
            this.roundState = LevelRoundState.States.PAUSED_TRANSITION;
            this.tweenPauseMenuHide();
            this.playSoundZoomIn();
        },

        roundExit: function() {
            this.roundState = LevelRoundState.States.EXIT_TRANSITION;
            this.tweenRoundExit();
        },

        matchCountdown: function() {
            this.foreground.startCountdown(this.matchStart ,this);
        },

        matchStart: function() {
            this.foreground.alpha = 0;
            this.match.alpha = 1;

            this.roundState = LevelRoundState.States.PLAYING;
            
            this.match.matchStart();
            
            this.upKey.onDown.add(this.handleInput.bind(this, MarbleMatch.Player.ONE, MarbleGroup.Input.UP));
            this.downKey.onDown.add(this.handleInput.bind(this, MarbleMatch.Player.ONE, MarbleGroup.Input.DOWN));
            this.leftKey.onDown.add(this.handleInput.bind(this, MarbleMatch.Player.ONE, MarbleGroup.Input.LEFT));
            this.rightKey.onDown.add(this.handleInput.bind(this, MarbleMatch.Player.ONE, MarbleGroup.Input.RIGHT));
            this.shiftKey.onDown.add(this.handleInput.bind(this, MarbleMatch.Player.ONE, MarbleGroup.Input.SHIFT));

            this.enterKey.onDown.add(this.handleEnter, this);
            this.escKey.onDown.add(this.handlePause, this);
            
            // this.botAI2.upPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.UP));
            // this.botAI2.downPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.DOWN));
            // this.botAI2.leftPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.LEFT));
            // this.botAI2.rightPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.RIGHT));
            // this.botAI2.shiftPress.add(this.match.handleInput.bind(this.match, MarbleMatch.Player.ONE, MarbleGroup.Input.SHIFT));
            
            this.botAI.upPress.add(this.handleInput.bind(this, MarbleMatch.Player.TWO, MarbleGroup.Input.UP));
            this.botAI.downPress.add(this.handleInput.bind(this, MarbleMatch.Player.TWO, MarbleGroup.Input.DOWN));
            this.botAI.leftPress.add(this.handleInput.bind(this, MarbleMatch.Player.TWO, MarbleGroup.Input.LEFT));
            this.botAI.rightPress.add(this.handleInput.bind(this, MarbleMatch.Player.TWO, MarbleGroup.Input.RIGHT));
            this.botAI.shiftPress.add(this.handleInput.bind(this, MarbleMatch.Player.TWO, MarbleGroup.Input.SHIFT));
        },

        handleInput: function(sender, direction) {
            if (this.roundState === LevelRoundState.States.ROUND_END) {
                this.roundState = LevelRoundState.States.OUTRO;
                this.roundEnd(this.roundWinner);
            } else if (this.roundState === LevelRoundState.States.PLAYING) {
                this.match.handleInput(sender, direction);
            } else if (this.roundState === LevelRoundState.States.PAUSED) {
                if (direction === MarbleGroup.Input.SHIFT) {
                    this.handleEnter();
                    return;
                }
                this.pauseMenu.handleInput(direction);
                this.pauseMenu.playSoundNavigate();
            }
        },

        handleEnter: function() {
            if (this.roundState === LevelRoundState.States.PAUSED) {
                if (this.pauseMenu.getSelection() === PauseMenu.Items.YES) {
                    this.roundExit();
                } else {
                    this.roundResume();
                }
            }
        },

        handlePause: function() {
            if (this.roundState === LevelRoundState.States.PAUSED) {
                this.roundResume();
            } else if (this.roundState !== LevelRoundState.States.PAUSED_TRANSITION) {
                this.roundPause();
            }
        },
        
        nextRound: function(outroAnimation) {
            this.transitionData.background = { color: 0x000000, alpha: 1 };
            this.transitionData.animation = outroAnimation;
            
            this.game.state.start('level-master', true, false, this.levelData, this.transitionData);
        },
        
        tweenIntro: function() {
            switch(this.transitionData.animation) {
            case LevelMasterState.Transition.NONE:
                this.matchCountdown();
                break;
            case LevelMasterState.Transition.SLIDE_LEFT:
                this.renderLayer.x = - this.background.width;
                this.tweenIntroSlideLeft();
                this.playSoundIntro('BOUNCEIN');
                break;
            case LevelMasterState.Transition.SLIDE_DOWN:
                this.renderLayer.y = - this.background.height;
                this.tweenIntroSlideDown();
                this.playSoundIntro('BOUNCEIN');
                break;
            default:
                throw 'FailStateTransition' + this.transitionData.animation;
            }
        },
        
        tweenOutro: function() {
            var tweenFunction = this.game.rnd.pick([
                this.tweenOutroSlideDown,
                this.tweenOutroSlideLeft
            ]);

            // TODO sync with outro tween.
            this.playSoundOutro('BOUNCOUT');
            
            return tweenFunction.call(this);
        },

        tweenIntroSlideDown: function() {
            var tween = this.game.add.tween(this.renderLayer)
                    .to({ y: 0 }, 1000, Phaser.Easing.Bounce.Out, true);
            
            tween.onComplete.add(this.matchCountdown, this);
            
            return tween;
        },

        tweenIntroSlideLeft: function() {
            var tween = this.game.add.tween(this.renderLayer)
                    .to({ x: 0 }, 1000, Phaser.Easing.Bounce.Out, true);
            
            tween.onComplete.add(this.matchCountdown, this);
            
            return tween;
        },

        tweenOutroSlideDown: function() {
            var tween = this.game.add.tween(this.renderLayer)
                .to({y: this.background.height}, 1000, Phaser.Easing.Linear.None, true);

            tween.onComplete.add(this.nextRound.bind(this, LevelMasterState.Transition.SLIDE_DOWN));
        },

        tweenOutroSlideLeft: function() {
            var tween = this.game.add.tween(this.renderLayer)
                .to({x: this.background.width}, 1000, Phaser.Easing.Linear.None, true);

            tween.onComplete.add(this.nextRound.bind(this, LevelMasterState.Transition.SLIDE_LEFT));
        },

        tweenPauseMenuShow: function() {
            var tween = this.game.add.tween(this.pauseMenu.scale)
                    .to({x:1, y:1}, 200);

            tween.onComplete.add(function() {
                this.roundState = LevelRoundState.States.PAUSED;
            }, this);

            tween.start();
        },

        tweenPauseMenuHide: function() {
            var tween = this.game.add.tween(this.pauseMenu.scale)
                    .to({x:0, y:0}, 200);

            tween.onComplete.add(function() {
                this.roundState = this.roundStateResume;
            }, this);

            tween.start();
        },

        tweenRoundExit: function() {
            // TODO this fade doesn't work WTF!!
            var tween = this.fadeBg.tweenFadeOn();

            tween.onComplete.add(function() {
                this.game.state.start('main-menu');
            }, this);

            tween.start();
        },

        playSoundOutro: function(outro) {
            Util.playSfx(this.fx, outro);
        },

        playSoundIntro: function(intro) {
            Util.playSfx(this.fx, intro);
        },

        playSoundZoomIn: function() {
            Util.playSfx(this.fx, 'ZOOMIN');
        }
    };

    return LevelRoundState;
});
