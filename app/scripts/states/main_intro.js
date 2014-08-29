'use strict';

define(['phaser', 'prefabs/fade_tween', 'util'], function(Phaser, FadeTween, Util) {
    function MainIntroState() {}
    
    MainIntroState.prototype = {
        create: function() {
            this.fx = Util.parseAudioSprite(this.game);
            
            this.splash = this.game.add.sprite(0, 0, 'marbleatlas2', 'o_splash.png');
            
            this.fadeBg = new FadeTween(this.game, 0xffffff, 1);
            this.game.add.existing(this.fadeBg);
            
            this.tweenFadeState();
            Util.playSfx(this.fx, 'THEME');
        },

        tweenFadeState: function() {
            var tween = this.game.add.tween(this.fadeBg)
                    .to({alpha: 1}, 10000, Phaser.Easing.Linear.None, true);

            tween.onComplete.add(function() {
                this.game.state.start('main-menu');
            }, this);
        }
    };

    return MainIntroState;
});
