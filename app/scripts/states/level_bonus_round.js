'use strict';

define(['phaser', 'states/level_master', 'states/level_base_round', 'prefabs/marble_group', 'prefabs/marble_bonus_match', 'prefabs/level_splash', 'util/gestures'],
       function(Phaser, LevelMasterState, LevelBaseRoundState, MarbleGroup, MarbleBonusMatch, LevelSplash, Gesture) {
    
    function LevelBonusRoundState() {
        LevelBaseRoundState.call(this);
    }
    
    LevelBonusRoundState.prototype = Object.create(LevelBaseRoundState.prototype);
    LevelBonusRoundState.prototype.constructor = LevelBonusRoundState;
    
    LevelBonusRoundState.prototype.create = function() {
        LevelBaseRoundState.prototype.create.call(this);

        var level = this.levelData.level;

        this.levelSplash = new LevelSplash(this.game, level, undefined, true);

        this.levelSplash.x = (this.game.width - this.levelSplash.width) / 2;
        this.levelSplash.y = (this.game.height - this.levelSplash.height) / 2;

        this.bonusMatch = new MarbleBonusMatch(this.game, this.levelData, this.renderLayer, this.fx);
        this.bonusMatch.x = 53;
        this.bonusMatch.y = 20;
        this.bonusMatch.alpha = 0;

        this.bonusMatch.onMatchEnd.add(function(isWin) {
            this.roundState = LevelBaseRoundState.States.ROUND_END;
            this.roundWinner = isWin;
        }, this);

        this.roundStart();
    };

    LevelBonusRoundState.prototype.roundStart = function() {
        this.tweenIntro()
            .onComplete.add(function() {
                this.matchStart();
            }, this);
    };
    
    LevelBonusRoundState.prototype.matchStart = function() {
        LevelBaseRoundState.prototype.matchStart.call(this);

        this.bonusMatch.alpha = 1;

        this.bonusMatch.matchStart();
        
        this.upKey.onDown
            .add(this.handleInput.bind(this, MarbleGroup.Input.UP));
        this.downKey.onDown
            .add(this.handleInput.bind(this, MarbleGroup.Input.DOWN));
        this.leftKey.onDown
            .add(this.handleInput.bind(this, MarbleGroup.Input.LEFT));
        this.rightKey.onDown
            .add(this.handleInput.bind(this, MarbleGroup.Input.RIGHT));
        this.shiftKey.onDown
            .add(this.handleInput.bind(this, MarbleGroup.Input.SHIFT));

        this.gestures.onSwipe.add(this.handleSwipe, this);
        this.gestures.onTap.add(this.handleInput.bind(this, MarbleGroup.Input.SHIFT));
    };

    LevelBonusRoundState.prototype.handleInput = function(direction) {
        LevelBaseRoundState.prototype.handleInput.call(this, direction);

        if (this.roundState === LevelBaseRoundState.States.PLAYING) {
            this.bonusMatch.handleInput(direction);
        }
    };


    LevelBonusRoundState.prototype.handleSwipe = function(e, prevPos, pos, direction) {

        switch(direction) {
        case Gesture.SwipeDirection.UP:
            direction = MarbleGroup.Input.UP;
            break;
        case Gesture.SwipeDirection.DOWN:
            direction = MarbleGroup.Input.DOWN;
            break;
        case Gesture.SwipeDirection.LEFT:
            direction = MarbleGroup.Input.LEFT;
            break;
        case Gesture.SwipeDirection.RIGHT:
            direction = MarbleGroup.Input.RIGHT;
            break;
        }
        
        LevelBaseRoundState.prototype.handleInput.call(this, direction);

        if (this.roundState === LevelBaseRoundState.States.PLAYING) {
            this.bonusMatch.handleInput(direction);
        }
    };

           
    LevelBonusRoundState.prototype.update = function() {
        if (this.roundState === LevelBaseRoundState.States.PLAYING) {
            this.bonusMatch.updateTimer();
        }

        this.gestures.update();
    };

    LevelBonusRoundState.prototype.tweenIntro = function() {
        var tweenLevelSplash = this.game.add.tween(this.levelSplash)
                .to({alpha:0}, 1000, Phaser.Easing.Linear.None, true);
        
        var tweenFadeOff = this.fadeBg.tweenFadeOff();

        tweenLevelSplash.chain(tweenFadeOff);
        
        return tweenLevelSplash;
    };

    return LevelBonusRoundState;
});
