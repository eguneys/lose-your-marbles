'use strict';

define(['prefabs/fade_tween'], function(FadeTween) {
    function LevelMasterState() {}

    LevelMasterState.prototype = {
        init: function(levelData, transitionData) {
            if (!levelData) {
                levelData = {
                    level: 0,
                    round: 1,
                    players: [
                        {
                            score: 0,
                            skill: 1
                        },
                        {
                            score: 0,
                            skill: 1
                        }
                    ]
                };
            }

            this.levelData = levelData;

            this.winScore = 2;

            if (!transitionData) {
                transitionData = {
                    background: { color: 0xffffff, alpha: 1 },
                    animation: LevelMasterState.Transition.NONE
                };
            }

            this.transitionData = transitionData;
        },
        
        create: function() {
            var bgData = this.transitionData.background;
            this.fadeBg = new FadeTween(this.game, bgData.color, bgData.alpha);
            this.game.add.existing(this.fadeBg);

            this.decideLevelState();
        },

        decideLevelState: function() {
            if (this.isFirstLevel() || this.getWinningPlayer() !== -1) {
                this.nextLevel();
            } else {
                this.nextRound();
            }
        },

        nextLevel: function() {

            this.levelData.level++;
            
            this.levelData.players.forEach(function(p) {
                p.score = 0;
            }, this);

            this.levelData.round = 1;
            
            this.game.state.start('level-intro', true, false, this.levelData, this.transitionData);
        },

        nextRound: function() {
            this.levelData.round++;
            this.game.state.start('level-round', true, false, this.levelData, this.transitionData);
        },

        isFirstLevel: function() {
            return this.levelData.level === 0;
        },

        getWinningPlayer: function() {
            for (var i = 0; i < this.levelData.players.length; i++) {
                if (this.levelData.players[i].score >= this.winScore) {
                    return i;
                }
            }
            return -1;
        }
    };

    LevelMasterState.Transition = {
        NONE: 0,
        SLIDE_DOWN: 1,
        SLIDE_LEFT: 2
    };

    return LevelMasterState;
});
