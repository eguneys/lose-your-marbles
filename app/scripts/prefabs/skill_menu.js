'use strict';

define(['phaser', 'util', 'prefabs/red_marble', 'prefabs/skill_digit'], function(Phaser, Util, RedMarble, SkillDigit) {
    function SkillMenu(game, parent, fx) {
        Phaser.Group.call(this, game, parent);

        this.fx = fx;
        
        this.allowSelect = true;
        
        this.menuItems = [];
        this.menuIdx = SkillMenu.Items.TWO;
        
        this.menuBg = this.create(0, 0, 'marbleatlas', 'LEVEL-01_MENU_BG');

        var menuWidth = this.menuBg.width;
        var menuHeight = this.menuBg.height;
        
        this.itemOne = new SkillDigit(this.game, this.menuBg.x + menuWidth / 2 - 5, 70, 1, this.fx);
        this.itemTwo = new SkillDigit(this.game, this.menuBg.x + menuWidth / 2 - 5, 70 + 80, 2, this.fx);
        this.itemThree = new SkillDigit(this.game, this.menuBg.x + menuWidth / 2 - 5, 70 + 80 + 80, 3, this.fx);

        this.add(this.itemOne);
        this.add(this.itemTwo);
        this.add(this.itemThree);

        this.itemOne.onWhirlDone.add(this.selectDone, this);
        this.itemTwo.onWhirlDone.add(this.selectDone, this);
        this.itemThree.onWhirlDone.add(this.selectDone, this);
        
        this.menuItems[SkillMenu.Items.ONE] = this.itemOne;
        this.menuItems[SkillMenu.Items.TWO] = this.itemTwo;
        this.menuItems[SkillMenu.Items.THREE] = this.itemThree;


        this.redMarble = new RedMarble(this.game, this, this.fx);
        this.redMarble.x = this.menuItems[this.menuIdx].x - this.redMarble.width;
        this.redMarble.y = this.menuItems[this.menuIdx].y - 10;
        
        this.pivot = { x: menuWidth / 2, y: menuHeight / 2 };

        this.redMarble.playPoint();

        this.onMenuSelect = new Phaser.Signal();
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

    SkillMenu.prototype.makeSelection = function(newIdx) {
        if (newIdx !== this.menuIdx) {
            this.menuIdx = newIdx;

            this.redMarble.y = this.menuItems[this.menuIdx].y - 10;
        }
    };

    SkillMenu.prototype.navigate = function(direction) {
        if (!this.allowSelect) { return -1; }
        
        var newIdx = this.menuIdx;
        
        switch(direction) {
        case SkillMenu.Select.UP:
            newIdx = (newIdx - 1 + 3) % 3;
            break;
        case SkillMenu.Select.DOWN:
            newIdx = (newIdx + 1) % 3;
            break;
        }

        this.makeSelection(newIdx);
        
        return this.menuIdx;
    };
    
    SkillMenu.prototype.tap = function(pos) {
        var items = this.menuItems.filter(function(item) {
            if (Phaser.Rectangle.containsPoint(item.getBounds(), pos)) {
                return true;
            }
            return false;
        });

        if (items.length > 0) {
            var itemIdx = this.menuItems.indexOf(items[0]);

            this.makeSelection(itemIdx);
        }
    };
    
    SkillMenu.prototype.select = function() {
        if (!this.allowSelect) { return -1; }
        this.allowSelect = false;
        
        this.redMarble.playSmack();
        this.redMarble.playSoundHappy();
        
        this.game.time.events.add(Phaser.Timer.SECOND * 14/15, function() {
            this.menuItems[this.menuIdx].whirl();
            
            Util.playSfx(this.fx, 'SLAP').onStop.addOnce(function() {
                this.menuItems[this.menuIdx].playWhirlSound();
            }, this);

            for (var i = (this.menuIdx + 1) % 3; i !== this.menuIdx; i = (i + 1) % 3) {
                this.menuItems[i].alpha = 0;
            }
        }, this);

        return this.getSelectedItem();
    };

    SkillMenu.prototype.playNavigateSound = function() {
        Util.playSfx(this.fx, 'SELECT2');
    };

    SkillMenu.prototype.selectDone = function() {
        this.onMenuSelect.dispatch(this.getSelectedItem());
    };

    SkillMenu.prototype.getSelectedItem = function() {
        return this.menuIdx + 1;
    };
    
    return SkillMenu;
});
