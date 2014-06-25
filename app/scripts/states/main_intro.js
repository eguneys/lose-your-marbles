'use strict';

define(['phaser', 'prefabs/fade_tween'], function(Phaser, FadeTween) {
    function MainIntroState() {}
    
    MainIntroState.prototype = {
        create: function() {
            this.splash = this.game.add.sprite(0, 0, 'marbleatlas2', 'o_splash.png');
            
            this.fadeBg = new FadeTween(this.game);
            this.game.add.existing(this.fadeBg);
            
            this.tweenFadeState();
        },

        tweenFadeState: function() {
            var tween = this.game.add.tween(this.fadeBg)
                    .to({alpha: 1}, 2000, Phaser.Easing.Linear.None, true);

            tween.onComplete.add(function() {
                this.game.state.start('main-menu');
            }, this);
        }
    };

    return MainIntroState;
});
