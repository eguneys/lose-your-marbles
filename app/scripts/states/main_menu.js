'use strict';

define(['phaser', 'prefabs/main_menu', 'prefabs/fade_tween'], function(Phaser, MainMenu, FadeTween) {
    function MainMenuState() {}
    
    MainMenuState.prototype = {
        create: function() {
            this.background = this.game.add.sprite(0, 0, 'marbleatlas', 'DIALOG_BG');
            
            this.fadeBg = new FadeTween(this.game, 1);
            this.game.add.existing(this.fadeBg);

            this.menu = new MainMenu(this.game);
            
            this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.spacebarKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            
            this.tweenFadeOut();
        },

        gameStart: function() {
            this.game.state.start('level-master');
        },
        
        menuPopped: function() {
            this.upKey.onDown.add(this.menu.select.bind(this.menu, MainMenu.Select.UP));
            this.downKey.onDown.add(this.menu.select.bind(this.menu, MainMenu.Select.DOWN));
            this.leftKey.onDown.add(this.menu.select.bind(this.menu, MainMenu.Select.LEFT));
            this.rightKey.onDown.add(this.menu.select.bind(this.menu, MainMenu.Select.RIGHT));

            this.spacebarKey.onDown.add(this.tweenPlayState, this);
            this.enterKey.onDown.add(this.tweenPlayState, this);
        },

        tweenFadeOut: function() {
            var tween = this.game.add.tween(this.fadeBg)
                    .to({alpha: 0}, 2000, Phaser.Easing.Linear.None, true);

            var tweenMainMenuPop = this.game.add.tween(this.menu.scale)
                    .to({x: 1, y: 1}, 500, Phaser.Easing.Bounce.Out);

            tweenMainMenuPop.onComplete.add(this.menuPopped, this);
            
            tween.chain(tweenMainMenuPop);
        },

        tweenPlayState: function() {
            var tweenMainMenuShrink = this.game.add.tween(this.menu.scale)
                    .to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None);

            var tweenFadeIn = this.game.add.tween(this.fadeBg)
                    .to({alpha: 1}, 2000, Phaser.Easing.Linear.None);

            tweenFadeIn.onComplete.add(this.gameStart, this);
            
            tweenMainMenuShrink.chain(tweenFadeIn);

            tweenMainMenuShrink.start();
        }
            
    };

    return MainMenuState;
});
