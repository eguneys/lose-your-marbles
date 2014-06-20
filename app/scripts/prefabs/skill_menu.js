'use strict';

define(['phaser', 'prefabs/red_marble'], function(Phaser, RedMarble) {
    function SkillMenu(game) {
        Phaser.Group.call(this, game);
        
        this.menuItems = [];
        this.menuIdx = SkillMenu.Items.TWO;
        
        this.menuBg = this.create(0, 0, 'marbleatlas', 'LEVEL-01_MENU_BG');

        var menuWidth = this.menuBg.width;
        var menuHeight = this.menuBg.height;

        var whirlDecreaseCallback = function() {
            if (this.speed <= 26) {
                this.stop(false, false);
            } else {
                this.play(this.speed - 26);
            }
        };
        
        this.itemOne = this.create(this.menuBg.x + menuWidth / 2 - 5, 70, 'marbleatlas', 'COMMON04_DIGITS11');
        this.itemOne.animations.add('whirl',
                                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                                     12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].mapConcat('COMMON04_DIGITS1'), 26 * 10, false)
            .onComplete.add(whirlDecreaseCallback, this.itemOne.animations.getAnimation('whirl'));

        this.itemTwo = this.create(this.menuBg.x + menuWidth / 2 - 5, 70 + 80, 'marbleatlas', 'COMMON04_DIGITS21');
        this.itemTwo.animations.add('whirl',
                                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                                     12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].mapConcat('COMMON04_DIGITS2'), 26 * 10, false)
            .onComplete.add(whirlDecreaseCallback, this.itemTwo.animations.getAnimation('whirl'));


        this.itemThree = this.create(this.menuBg.x + menuWidth / 2 - 5, 70 + 80 + 80, 'marbleatlas', 'COMMON04_DIGITS31');
        this.itemThree.animations.add('whirl',
                                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                                     12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].mapConcat('COMMON04_DIGITS3'), 26 * 10, false)
            .onComplete.add(whirlDecreaseCallback, this.itemThree.animations.getAnimation('whirl'));
        
        
        this.menuItems[SkillMenu.Items.ONE] = this.itemOne;
        this.menuItems[SkillMenu.Items.TWO] = this.itemTwo;
        this.menuItems[SkillMenu.Items.THREE] = this.itemThree;


        this.redMarble = new RedMarble(this.game, this);
        
        this.redMarble.x = this.menuItems[this.menuIdx].x - this.redMarble.width;
        this.redMarble.y = this.menuItems[this.menuIdx].y - 10;
        
        this.pivot = { x: menuWidth / 2, y: menuHeight / 2 };

        this.redMarble.playPoint();
    }

    SkillMenu.prototype = Object.create(Phaser.Group.prototype);
    SkillMenu.prototype.constructor = SkillMenu;

    SkillMenu.Items = {
        ONE: 0,
        TWO: 1,
        THREE: 2
    };

    SkillMenu.Select = {
        UP: 0,
        DOWN: 1
    };

    SkillMenu.prototype.navigate = function(direction) {
        var newIdx = this.menuIdx;
        
        switch(direction) {
        case SkillMenu.Select.UP:
            newIdx = (newIdx - 1 + 3) % 3;
            break;
        case SkillMenu.Select.DOWN:
            newIdx = (newIdx + 1) % 3;
            break;
        }

        if (newIdx !== this.menuIdx) {
            this.menuIdx = newIdx;

            this.redMarble.y = this.menuItems[this.menuIdx].y - 10;
        }
    };

    SkillMenu.prototype.select = function() {
        this.redMarble.playSmack();
        this.game.time.events.add(Phaser.Timer.SECOND * 14/15, function() {
            this.menuItems[this.menuIdx].animations.play('whirl', 26 * 10);

            for (var i = (this.menuIdx + 1) % 3; i !== this.menuIdx; i = (i + 1) % 3) {
                this.menuItems[i].alpha = 0;
            }
        }, this);

        return this.menuIdx;
    };
    
    return SkillMenu;
});
