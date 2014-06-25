'use strict';

define(['phaser', 'prefabs/fade_tween', 'prefabs/level_splash', 'prefabs/level_foreground', 'prefabs/skill_menu'], function(Phaser, FadeTween, LevelSplash, LevelForeground, SkillMenu) {
    function LevelIntroState() {}

    LevelIntroState.prototype = {
        init: function(levelData) {
            this.levelData = levelData;
        },
        
        create: function() {
            var level = this.levelData.level;
            
            this.background = this.game.add.sprite(0, 0, 'marbleatlas2', 'TRANS' + level + 'B.png');

            this.foreground = new LevelForeground(this.game, level);
            
            this.fadeBg = new FadeTween(this.game, 1);
            this.game.add.existing(this.fadeBg);
            
            this.levelSplash = new LevelSplash(this.game, level);
        
            this.levelSplash.x = (this.game.width - this.levelSplash.width) / 2;
            this.levelSplash.y = (this.game.height - this.levelSplash.height) / 2;
            
            var tweenIntro = this.tweenIntro();
            
            if (this.levelData.level === 1) {
            
                this.skillMenu = new SkillMenu(this.game);
            
                this.skillMenu.x = this.game.width / 4 - 30;
                this.skillMenu.y = this.game.height / 2;
                this.skillMenu.scale = { x: 0, y: 0 };

                this.skillMenu.onMenuSelect.add(this.skillMenuSelected, this);

                var tweenSkillMenuPop = this.tweenSkillMenuPop();
                
                tweenIntro.chain(tweenSkillMenuPop);


                this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
                this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
                this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
                this.spacebarKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            } else {
                tweenIntro.onComplete.add(this.levelStart, this);
            }
        },

        levelStart: function() {
            this.game.state.start('level-round', true, false, this.levelData);
        },
        
        skillMenuPopped: function() {
            this.upKey.onDown.add(this.skillMenu.navigate.bind(this.skillMenu, SkillMenu.Select.UP));
            this.downKey.onDown.add(this.skillMenu.navigate.bind(this.skillMenu, SkillMenu.Select.DOWN));
            this.enterKey.onDown.add(this.skillMenu.select, this.skillMenu);
            this.spacebarKey.onDown.add(this.skillMenu.select, this.skillMenu);
            
        },

        skillMenuSelected: function(skill) {
            this.levelData.players[0].skill = skill;
            
            this.tweenSkillMenuShrink();
        },
        
        tweenIntro: function() {
            var tweenLevelSplash = this.game.add.tween(this.levelSplash)
                .to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
            
            var tweenFadeOut = this.game.add.tween(this.fadeBg)
                .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);

            var drawTweens = this.foreground.getDrawTweens();

            tweenLevelSplash.chain(tweenFadeOut);
            tweenFadeOut.chain(drawTweens.first);

            return drawTweens.last;
        },

        tweenSkillMenuPop: function() {
            var tween = this.game.add.tween(this.skillMenu.scale)
                .to({ x: 1, y: 1 }, 500, Phaser.Easing.Bounce.Out);

            
            tween.onComplete.add(this.skillMenuPopped, this);
            
            return tween;
        },

        tweenSkillMenuShrink: function() {
            var tween = this.game.add.tween(this.skillMenu.scale)
                .to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None, true);

            tween.onComplete.add(this.levelStart, this);

            return tween;
        }
    };

    return LevelIntroState;
});
