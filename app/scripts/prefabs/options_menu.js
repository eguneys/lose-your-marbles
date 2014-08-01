'use strict';

define(['phaser', 'prefabs/base_menu'], function(Phaser, BaseMenu) {
    function OptionsMenu(game) {
        BaseMenu.call(this, game, OptionsMenu.Items.MUSIC);

        this.addToggleMenuItem(120, 100, 'marbleatlas', 'OPTIONS_MENU_MUSIC_ON', 'OPTIONS_MENU_MUSIC_OFF', OptionsMenu.Items.MUSIC);
        this.addToggleMenuItem(140, 125, 'marbleatlas', 'OPTIONS_MENU_SFX_ON', 'OPTIONS_MENU_SFX_OFF', OptionsMenu.Items.SFX);
        this.addToggleMenuItem(50, 180, 'marbleatlas', 'OPTIONS_MENU_P1_ON', 'OPTIONS_MENU_P1_OFF', OptionsMenu.Items.C_P1);
        this.addToggleMenuItem(295, 220, 'marbleatlas', 'OPTIONS_MENU_P2_ON', 'OPTIONS_MENU_P2_OFF', OptionsMenu.Items.C_P2);
        this.addToggleMenuItem(50, 300, 'marbleatlas', 'OPTIONS_MENU_CREDITS_ON', 'OPTIONS_MENU_CREDITS_OFF', OptionsMenu.Items.CREDITS);
        this.addToggleMenuItem(290, 300, 'marbleatlas', 'OPTIONS_MENU_EXIT_ON', 'OPTIONS_MENU_EXIT_OFF', OptionsMenu.Items.EXIT);

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
    
    return OptionsMenu;
});
