'use strict';

define(['phaser', 'config',
        'states/boot',
        'states/preload',
        'states/main_intro',
        'states/main_menu',
        'states/level_master',
        'states/level_intro',
        'states/level_round',
        'states/level_bonus_round',
        'states/game_end'], function(Phaser, config,
                                             BootState,
                                             PreloadState,
                                             MainIntroState,
                                             MainMenuState,
                                             LevelMasterState,
                                             LevelIntroState,
                                             LevelRoundState,
                                             LevelBonusRoundState,
                                             GameEndState) {
    function Game(options) {
        config.options = options || config.options;
    }

    Game.prototype = {

        start: function() {
            var game = new Phaser.Game(640, 480, Phaser.AUTO, config.options.parent);

            game.state.add('boot', BootState);
            game.state.add('preload', PreloadState);
            game.state.add('main-intro', MainIntroState);
            game.state.add('main-menu', MainMenuState);
            game.state.add('level-master', LevelMasterState);
            game.state.add('level-intro', LevelIntroState);
            game.state.add('level-round', LevelRoundState);
            game.state.add('level-bonus-round', LevelBonusRoundState);
            game.state.add('game-end', GameEndState);
            
            game.state.start('boot');

            this.game = game;
        },

        goFullScreen: function() {
            // TODO put somewhere else
            this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
            
            if (this.game.scale.isFullScreen) {
                this.game.scale.stopFullScreen();
            } else {
                this.game.scale.startFullScreen();
            }
        }
    };

    return Game;
});
