'use strict';

define(['phaser', 'util', 'prefabs/base_menu'], function(Phaser, Util, BaseMenu) {
    
    function PauseMenu(game, parent, level, fx) {
        BaseMenu.call(this, game, parent, PauseMenu.Items.NO, 'LEVEL-0' + level + '_PAUSE_MENU_BG');

        this.fx = fx;
        
        this.yesItem = this.addToggleMenuItem(30, 100, 'marbleatlas', 'COMMON03_TEXT_YES_ON', 'COMMON03_TEXT_YES_OFF', PauseMenu.Items.YES);
        this.noItem = this.addToggleMenuItem(105, 100, 'marbleatlas', 'COMMON03_TEXT_NO_ON', 'COMMON03_TEXT_NO_OFF', PauseMenu.Items.NO);
        
        this.noItem.play('on');
    }

    PauseMenu.prototype = Object.create(BaseMenu.prototype);
    PauseMenu.prototype.constructor = PauseMenu;

    PauseMenu.Items = {
        YES: 0,
        NO: 1
    };

    PauseMenu.prototype.handleInput = function(direction) {
        var newIdx = this.menuIdx;
        
        switch(direction) {
        case BaseMenu.Select.UP:
        case BaseMenu.Select.LEFT:
            newIdx = (newIdx - 1 + 2) % 2;
            break;
        case BaseMenu.Select.DOWN:
        case BaseMenu.Select.RIGHT:
            newIdx = (newIdx + 1) % 2;
            break;
        }

        if (newIdx !== this.menuIdx) {
            this.menuItems[this.menuIdx].animations.play('off');
            this.menuIdx = newIdx;
            this.menuItems[this.menuIdx].animations.play('on');
        }
    };

    PauseMenu.prototype.playSoundNavigate = function() {
        Util.playSfx(this.fx, 'SELECT2');
    };
    
    return PauseMenu;
});
