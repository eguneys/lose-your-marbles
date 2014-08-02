'use strict';

define(['phaser', 'prefabs/base_menu', 'prefabs/volume_sprite'], function(Phaser, BaseMenu, VolumeSprite) {
    function OptionsMenu(game) {
        BaseMenu.call(this, game, OptionsMenu.Items.MUSIC);

        var centerX = this.menuBg.width / 2;
        var centerY = this.menuBg.height / 2;
        
        var optionsTitle = this.create(0, 50, 'marbleatlas', 'DIALOG_MENU_OPTIONS_ON');
        optionsTitle.x = centerX - optionsTitle.width / 2;
        this.add(optionsTitle);
        
        var musicItem = this.addToggleMenuItem(120, 100, 'marbleatlas', 'OPTIONS_MENU_MUSIC_ON', 'OPTIONS_MENU_MUSIC_OFF', OptionsMenu.Items.MUSIC);
        this.addToggleMenuItem(140, 125, 'marbleatlas', 'OPTIONS_MENU_SFX_ON', 'OPTIONS_MENU_SFX_OFF', OptionsMenu.Items.SFX);
        this.addToggleMenuItem(50, 180, 'marbleatlas', 'OPTIONS_MENU_P1_ON', 'OPTIONS_MENU_P1_OFF', OptionsMenu.Items.C_P1);
        this.addToggleMenuItem(295, 220, 'marbleatlas', 'OPTIONS_MENU_P2_ON', 'OPTIONS_MENU_P2_OFF', OptionsMenu.Items.C_P2);
        this.addToggleMenuItem(50, 300, 'marbleatlas', 'OPTIONS_MENU_CREDITS_ON', 'OPTIONS_MENU_CREDITS_OFF', OptionsMenu.Items.CREDITS);
        this.addToggleMenuItem(290, 300, 'marbleatlas', 'OPTIONS_MENU_EXIT_ON', 'OPTIONS_MENU_EXIT_OFF', OptionsMenu.Items.EXIT);

        this.musicVolume = new VolumeSprite(game);
        this.musicVolume.x = 200;
        this.musicVolume.y = 95;
        this.add(this.musicVolume);

        this.sfxVolume = new VolumeSprite(game);
        this.sfxVolume.x = 200;
        this.sfxVolume.y = 125;
        this.add(this.sfxVolume);

        musicItem.play('on');
    };

    OptionsMenu.prototype = Object.create(BaseMenu.prototype);
    OptionsMenu.prototype.constructor = OptionsMenu;

    OptionsMenu.Items = {
        MUSIC: 0,
        SFX: 1,
        C_P1: 2,
        C_P2: 3,
        CREDITS: 4,
        EXIT: 5
    };

    OptionsMenu.prototype.select = function(direction) {
        var newIdx = this.menuIdx;

        switch(direction) {
        case BaseMenu.Select.LEFT:
            newIdx = this.selectLeftRight(BaseMenu.Select.LEFT);
            break;
        case BaseMenu.Select.RIGHT:
            newIdx = this.selectLeftRight(BaseMenu.Select.RIGHT);
            break;
        case BaseMenu.Select.UP:
            newIdx = (newIdx - 1 + 6) % 6;
            break;
        case BaseMenu.Select.DOWN:
            newIdx = (newIdx + 1) % 6;
            break;
        }

        if (newIdx !== this.menuIdx) {
            this.menuItems[this.menuIdx].animations.play('off');
            this.menuIdx = newIdx;
            this.menuItems[this.menuIdx].animations.play('on');
        }
    };

    OptionsMenu.prototype.selectLeftRight = function(direction) {
        var newIdx = this.menuIdx;

        switch(newIdx) {
        case OptionsMenu.Items.MUSIC:
            if (direction === BaseMenu.Select.LEFT) {
                this.musicVolume.volumeDown();
            } else {
                this.musicVolume.volumeUp();
            }
            break;
        case OptionsMenu.Items.SFX:
            if (direction === BaseMenu.Select.LEFT) {
                this.sfxVolume.volumeDown();
            } else {
                this.sfxVolume.volumeUp();
            }
            break;
        case OptionsMenu.Items.C_1P:
            break;
        case OptionsMenu.Items.C_2P:
            break;
        case OptionsMenu.Items.CREDITS:
            newIdx = OptionsMenu.Items.EXIT;
            break;
        case OptionsMenu.Items.EXIT:
            newIdx = OptionsMenu.Items.CREDITS;
            break;
        }

        return newIdx;
    };
    
    return OptionsMenu;
});
