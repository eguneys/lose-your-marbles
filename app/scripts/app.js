'use strict';

define(['phaser', 'states/boot', 'states/preload', 'states/main_intro', 'states/main_menu', 'states/level_master', 'states/level_intro', 'states/level_round'], function(Phaser, BootState, PreloadState, MainIntroState, MainMenuState, LevelMasterState, LevelIntroState, LevelRoundState) {
    function Game() { }

    Game.prototype = {

        start: function() {
            var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game-area');

            game.state.add('boot', BootState);
            game.state.add('preload', PreloadState);
            game.state.add('main-intro', MainIntroState);
            game.state.add('main-menu', MainMenuState);
            game.state.add('level-master', LevelMasterState);
            game.state.add('level-intro', LevelIntroState);
            game.state.add('level-round', LevelRoundState);
    
            game.state.start('boot');
        }
    };

    return Game;
});
