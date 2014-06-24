'use strict';

define(['phaser', 'prefabs/main_menu', 'prefabs/fade_tween'], function(Phaser, Menu, FadeTween) {
    function MenuState() {}
    
    MenuState.prototype = {
        create: function() {
            this.inputTime = 0;
            this.menuReady = false;

            this.background = this.game.add.sprite(0, 0, 'marbleatlas', 'DIALOG_BG');
            
            this.splash = this.game.add.sprite(0, 0, 'marbleatlas2', 'o_splash.png');

            this.fadeBg = new FadeTween(this.game);
            this.game.add.existing(this.fadeBg);

            this.menu = new Menu(this.game);
            
            this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.ENTER, Phaser.Keyboard.SPACEBAR]);

            this.tweenBgFade();
        },

        update: function() {
            
            if (this.menuReady && this.inputTime > 150 && this.handleKeyPress()) {
                this.inputTime = 0;
            }
            this.inputTime += this.game.time.elapsed;
        },

        handleKeyPress: function() {
            var isKeyPressed = true;
            
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
            {
                this.menu.select(Menu.Select.LEFT);
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.menu.select(Menu.Select.RIGHT);
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                this.menu.select(Menu.Select.UP);
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                this.menu.select(Menu.Select.DOWN);
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
                       this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
                this.menuReady = false;
                this.tweenPlayState();
            } else {
                isKeyPressed = false;
            }

            return isKeyPressed;
        },

        tweenBgFade: function() {
            
            var tweenFadeIn = this.game.add.tween(this.fadeBg);
            tweenFadeIn.to({alpha: 1}, 2000, Phaser.Easing.Linear.None)
                .onComplete.add(function() {
                    this.splash.alpha = 0;
                }, this);
            
            var tweenFadeOut = this.game.add.tween(this.fadeBg);
            tweenFadeOut.to({alpha: 0}, 2000, Phaser.Easing.Linear.None);

            var tweenMenuPop = this.game.add.tween(this.menu.scale);
            tweenMenuPop.to({x: 1, y: 1}, 500, Phaser.Easing.Bounce.Out);

            tweenMenuPop.onComplete.add(function() {
                this.menuReady = true;
            }, this);
            
            tweenFadeIn.chain(tweenFadeOut);
            tweenFadeOut.chain(tweenMenuPop);
            
            tweenFadeIn.start();
        },

        tweenPlayState: function() {
            var tweenMenuShrink = this.game.add.tween(this.menu.scale);
            tweenMenuShrink.to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None);

            var tweenFadeIn = this.game.add.tween(this.fadeBg);
            tweenFadeIn
                .to({alpha: 1}, 2000, Phaser.Easing.Linear.None)
                .onComplete.add(function() {
                    this.game.state.start('level-master');
                }, this);
            
            tweenMenuShrink.chain(tweenFadeIn);

            tweenMenuShrink.start();
        }
            
    };

    return MenuState;
});
