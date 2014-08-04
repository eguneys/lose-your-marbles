'use strict';

define(['phaser', 'states/level_master', 'states/level_base_round', 'prefabs/marble_group', 'prefabs/marble_bonus_match'],
       function(Phaser, LevelMasterState, LevelBaseRoundState, MarbleGroup, MarbleBonusMatch) {
    
    function LevelBonusRoundState() {
        LevelBaseRoundState.call(this);
    }
    
    LevelBonusRoundState.prototype = Object.create(LevelBaseRoundState.prototype);
    LevelBonusRoundState.prototype.constructor = LevelBonusRoundState;
    
    LevelBonusRoundState.prototype.create = function() {
        LevelBaseRoundState.prototype.create.call(this);

        this.bonusMatch = new MarbleBonusMatch(this.game, this.levelData, this.renderLayer, this.fx);
        this.bonusMatch.x = 53;
        this.bonusMatch.y = 20;
        this.bonusMatch.alpha = 0;

        this.bonusMatch.onMatchEnd.add(function() {
            this.roundState = LevelBaseRoundState.States.ROUND_END;
        }, this);

        this.roundStart();
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
    };

    LevelBonusRoundState.prototype.handleInput = function(direction) {
        LevelBaseRoundState.prototype.handleInput.call(this, direction);

        if (this.roundState === LevelBaseRoundState.States.PLAYING) {
            this.bonusMatch.handleInput(direction);
        }
    };

    LevelBonusRoundState.prototype.update = function() {
        if (this.roundState === LevelBaseRoundState.States.PLAYING) {
            this.bonusMatch.updateTimer();
        }
    };

    return LevelBonusRoundState;
});
