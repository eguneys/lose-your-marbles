'use strict';

define(['phaser', 'prefabs/fade_tween', 'prefabs/level_splash', 'prefabs/level_foreground', 'prefabs/skill_menu'], function(Phaser, FadeTween, LevelSplash, LevelForeground, SkillMenu) {
    function LevelIntroState() {}

    LevelIntroState.prototype = {
        create: function() {

            this.inputTime = 0;
            this.skillMenuReady = false;
            
            this.background = this.game.add.sprite(0, 0, 'marbleatlas2', 'TRANS1A.png');

            this.foreground = new LevelForeground(this.game);
            
            this.fadeBg = new FadeTween(this.game, 1);
            this.game.add.existing(this.fadeBg);

            this.levelSplash = new LevelSplash(this.game);
        
            this.levelSplash.x = (this.game.width - this.levelSplash.width) / 2;
            this.levelSplash.y = (this.game.height - this.levelSplash.height) / 2;

            this.skillMenu = new SkillMenu(this.game);

            this.skillMenu.x = this.game.width / 4 - 30;
            this.skillMenu.y = this.game.height / 2;
            this.skillMenu.scale = { x: 0, y: 0 };
            
            this.tweenLevelDisplay();
        },

        update: function() {
            if (this.skillMenuReady && this.inputTime > 150 && this.handleKeyPress()) {
                this.inputTime = 0;
            }

            this.inputTime += this.game.time.elapsed;
        },

        handleKeyPress: function() {
            var isKeyPressed = true;
            
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                this.skillMenu.navigate(SkillMenu.Select.UP);
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                this.skillMenu.navigate(SkillMenu.Select.DOWN);
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.skillMenuReady = false;
                var skill = this.skillMenu.select();

                this.game.time.events.add(Phaser.Timer.SECOND * 4, function() {
                    this.tweenSkillMenuSelect(skill);
                }, this);
            } else {
                isKeyPressed = false;
            }

            return isKeyPressed;
        },

        tweenLevelDisplay: function() {
            var tweenLevelSplash = this.game.add.tween(this.levelSplash);
            tweenLevelSplash.to({alpha: 0}, 1000, Phaser.Easing.Linear.None);
            
            var tweenFadeOut = this.game.add.tween(this.fadeBg);
            tweenFadeOut.to({alpha: 0}, 2000, Phaser.Easing.Linear.None);

            var drawTweens = this.foreground.getDrawTweens();

            var tweenSkillMenuPop = this.game.add.tween(this.skillMenu.scale);
            tweenSkillMenuPop.to({ x: 1, y: 1 }, 500, Phaser.Easing.Bounce.Out);

            tweenSkillMenuPop.onComplete.add(function() {
                this.skillMenuReady = true;
            }, this);
            
            tweenLevelSplash.chain(tweenFadeOut);
            tweenFadeOut.chain(drawTweens.first);
            drawTweens.last.chain(tweenSkillMenuPop);
            
            tweenLevelSplash.start();
        },

        tweenSkillMenuSelect: function() {
            var tweenSkillMenuShrink = this.game.add.tween(this.skillMenu.scale);
            tweenSkillMenuShrink.to({ x: 0, y: 0 }, 200)
            .onComplete.add(function() {
                this.game.state.start('level-round');
            }, this);

            tweenSkillMenuShrink.start();
        }
    };

    return LevelIntroState;
});
