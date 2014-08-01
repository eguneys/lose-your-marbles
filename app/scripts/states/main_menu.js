'use strict';

define(['phaser', 'prefabs/base_menu', 'prefabs/main_menu', 'prefabs/options_menu', 'prefabs/fade_tween'], function(Phaser, BaseMenu, MainMenu, OptionsMenu, FadeTween) {
    function MainMenuState() {}
    
    MainMenuState.prototype = {
        create: function() {
            this.background = this.game.add.sprite(0, 0, 'marbleatlas', 'DIALOG_BG');
            
            this.fadeBg = new FadeTween(this.game, 0xffffff, 1);
            this.game.add.existing(this.fadeBg);

            this.menu = new MainMenu(this.game);

            this.optionsMenu = null;

            // 'main' or 'options'
            // or 'transition' which doesn't allow selection
            this.menuFocus = 'main';
            
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
            this.upKey.onDown.add(this.keyPress.bind(this, BaseMenu.Select.UP));
            this.downKey.onDown.add(this.keyPress.bind(this, BaseMenu.Select.DOWN));
            this.leftKey.onDown.add(this.keyPress.bind(this, BaseMenu.Select.LEFT));
            this.rightKey.onDown.add(this.keyPress.bind(this, BaseMenu.Select.RIGHT));

            this.spacebarKey.onDown.add(this.keyEnter, this);
            this.enterKey.onDown.add(this.keyEnter, this);
        },

        keyPress: function(key) {
            if (this.menuFocus === 'main') {
                this.menu.select(key);
            } else if (this.menuFocus === 'options') {
                this.optionsMenu.select(key);
            }
        },

        keyEnter: function() {
            if (this.menuFocus === 'main') {
                this.mainMenuSelect();
            } else if (this.menuFocus === 'options') {
                this.optionsMenuSelect();
            }
        },

        mainMenuSelect: function() {
            switch(this.menu.getSelection()) {
            case MainMenu.Items.OPTIONS:
                this.selectOptions();
                break;
            case MainMenu.Items.HELP:
                break;
            case MainMenu.Items.PLAY, MainMenu.Items.SAM:
                this.selectPlay();
                break;
            case MainMenu.Items.QUIT:
                break;
            }
        },

        optionsMenuSelect: function() {
            switch(this.optionsMenu.getSelection()) {
            case OptionsMenu.Items.EXIT:
                this.tweenMainMenu();
                break;
            case OptionsMenu.Items.CREDITS:
                break;
            }
        },

        selectPlay: function() {
            this.tweenPlayState();
        },

        selectOptions: function() {
            this.optionsMenu = this.optionsMenu ||
                new OptionsMenu(this.game);

            this.menuFocus = 'transition';
            
            this.tweenOptionsMenu();
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
        },

        tweenOptionsMenu: function() {
            this.tweenTransitionMenu(this.menu, this.optionsMenu, 'options');
        },

        tweenMainMenu: function() {
            this.tweenTransitionMenu(this.optionsMenu, this.menu, 'main');
        },

        tweenTransitionMenu: function(shrinkMenu, growMenu, onCompleteFocus) {
            var tweenMenuShrink = this.game.add.tween(shrinkMenu.scale)
                    .to({ x: 0, y: 0}, 200);

            var tweenMenuGrow = this.game.add.tween(growMenu.scale)
                    .to({ x: 1, y: 1}, 200);

            tweenMenuGrow.onComplete.add(function() {
                this.menuFocus = onCompleteFocus;
            }, this);

            tweenMenuShrink.chain(tweenMenuGrow);

            tweenMenuShrink.start();
        }
    };

    return MainMenuState;
});
