'use strict';

define(['phaser',
        'states/level_master',
        'prefabs/round_foreground',
        'prefabs/pause_menu',
        'prefabs/fade_tween',
        'prefabs/marble_group',
        'util/gestures',
        'util'],
       function(Phaser,
                LevelMasterState,
                RoundForeground,
                PauseMenu,
                FadeTween,
                MarbleGroup,
                Gesture,
                Util) {
    function LevelBaseRoundState() {}

    LevelBaseRoundState.States = {
        INTRO: 'intro',
        PLAYING: 'playing',
        ROUND_END: 'round_end',
        OUTRO: 'outro',
        PAUSED_TRANSITION: 'pause_transition',
        PAUSED: 'pause',
        EXIT_TRANSITION: 'exit_transition'
    };
    
    LevelBaseRoundState.prototype = {
        init: function(levelData, transitionData) {
            this.levelData = levelData;
            this.transitionData = transitionData;
        },
        
        create: function() {
            this.fx = Util.parseAudioSprite(this.game);

            this.roundState = LevelBaseRoundState.States.INTRO;
            
            var level = this.levelData.level;
            
            this.renderLayer = this.game.add.group();
            
            this.background = this.game.add.sprite(0, 0, 'marbleatlas2', 'BONUS' + 1 + 'BG.png', this.renderLayer);
            
            //this.foreground = new RoundForeground(this.game, this.levelData.round, this.renderLayer, this.fx);
            
            this.pauseMenu = new PauseMenu(this.game, undefined, level, this.fx);
            
            this.fadeBg = new FadeTween(this.game, 0xffffff, 1);
            this.game.add.existing(this.fadeBg);
            
            this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.shiftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            
            this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            this.escKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);

            this.gestures = new Gesture(this.game);
        },

        update: function() {
            
        },
        
        roundStart: function() {
            this.tweenIntro();
        },
        
        roundEnd: function() {
            this.tweenOutro();
        },

        roundPause: function() {
            this.roundStateResume = this.roundState;
            this.roundState = LevelBaseRoundState.States.PAUSED_TRANSITION;
            this.tweenPauseMenuShow();
            this.playSoundZoomIn();
        },

        roundResume: function() {
            this.roundState = LevelBaseRoundState.States.PAUSED_TRANSITION;

            this.tweenPauseMenuHide();
            this.playSoundZoomIn();
        },

        roundExit: function() {
            this.roundState = LevelBaseRoundState.States.EXIT_TRANSITION;
            this.tweenRoundExit();
        },

        matchCountdown: function() {
            //TODO
            //this.foreground.startCountdown(this.matchStart ,this);
            this.matchStart();
        },

        matchStart: function() {
            //this.foreground.alpha = 0;
            
            this.roundState = LevelBaseRoundState.States.PLAYING;
            
            this.enterKey.onDown.add(this.handleEnter, this);
            this.escKey.onDown.add(this.handlePause, this);

            this.gestures.onHold.add(this.handlePause, this);
        },

        handleInput: function(direction) {
            if (this.roundState === LevelBaseRoundState.States.ROUND_END) {
                this.roundState = LevelBaseRoundState.States.OUTRO;
                this.roundEnd(this.roundWinner);
            } else if (this.roundState === LevelBaseRoundState.States.PLAYING) {
                
            } else if (this.roundState === LevelBaseRoundState.States.PAUSED) {
                if (direction === MarbleGroup.Input.SHIFT) {
                    this.handleEnter();
                    return;
                }
                this.pauseMenu.handleInput(direction);
                this.pauseMenu.playSoundNavigate();
            }
        },

        handleEnter: function() {
            if (this.roundState === LevelBaseRoundState.States.PAUSED) {
                if (this.pauseMenu.getSelection() === PauseMenu.Items.YES) {
                    this.roundExit();
                } else {
                    this.roundResume();
                }
            }
        },

        handlePause: function() {
            if (this.roundState === LevelBaseRoundState.States.PAUSED) {
                this.roundResume();
            } else if (this.roundState !== LevelBaseRoundState.States.PAUSED_TRANSITION) {
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
                this.roundState = LevelBaseRoundState.States.PAUSED;
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

    return LevelBaseRoundState;
});
