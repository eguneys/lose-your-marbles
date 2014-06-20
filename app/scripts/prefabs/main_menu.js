'use strict';

define(['phaser', 'prefabs/red_marble'], function(Phaser, RedMarble) {
    
    function Menu(game) {
        Phaser.Group.call(this, game);

        this.menuItems = [];
        this.menuIdx = Menu.Items.PLAY;
        this.samIdx = Menu.Items.SAM_1P;
        
        this.menuBg = this.create(0, 0, 'marbleatlas', 'DIALOG_MENU_BG');

        var menuWidth = this.menuBg.width;
        var menuHeight = this.menuBg.height;

        this.menuSam = this.create(menuWidth / 2 - 125, 30, 'marbleatlas', 'DIALOG_MENU_SAM_OFF');
        this.menuSam.animations.add('on', ['DIALOG_MENU_SAM_ON']);
        this.menuSam.animations.add('off', ['DIALOG_MENU_SAM_OFF']);

        this.menuItems[Menu.Items.SAM] = this.menuSam;

        this.menuSamPractice = this.create(40, 110, 'marbleatlas', 'DIALOG_MENU_SAM_PRACTICE_OFF');
        this.menuSamPractice.animations.add('on', ['DIALOG_MENU_SAM_PRACTICE_ON']);
        this.menuSamPractice.animations.add('off', ['DIALOG_MENU_SAM_PRACTICE_OFF']);
        
        this.menuItems[Menu.Items.SAM_PRACTICE] = this.menuSamPractice;

        this.menuSam1P = this.create(140, 100, 'marbleatlas', 'DIALOG_MENU_SAM_1P_OFF');
        this.menuSam1P.animations.add('on', ['DIALOG_MENU_SAM_1P_ON']);
        this.menuSam1P.animations.add('off', ['DIALOG_MENU_SAM_1P_OFF']);

        this.menuItems[Menu.Items.SAM_1P] = this.menuSam1P;

        this.menuSam2P = this.create(220, 100, 'marbleatlas', 'DIALOG_MENU_SAM_2P_OFF');
        this.menuSam2P.animations.add('on', ['DIALOG_MENU_SAM_2P_ON']);
        this.menuSam2P.animations.add('off', ['DIALOG_MENU_SAM_2P_OFF']);

        this.menuItems[Menu.Items.SAM_2P] = this.menuSam2P;

        this.menuSamNetwork = this.create(300, 110, 'marbleatlas', 'DIALOG_MENU_SAM_NET_OFF');
        this.menuSamNetwork.animations.add('on', ['DIALOG_MENU_SAM_NET_ON']);
        this.menuSamNetwork.animations.add('off', ['DIALOG_MENU_SAM_NET_OFF']);

        this.menuItems[Menu.Items.SAM_NETWORK] = this.menuSamNetwork;

        
        this.menuOptions = this.create(menuWidth / 2 - 75, 170, 'marbleatlas', 'DIALOG_MENU_OPTIONS_OFF');
        this.menuOptions.animations.add('on', ['DIALOG_MENU_OPTIONS_ON']);
        this.menuOptions.animations.add('off', ['DIALOG_MENU_OPTIONS_OFF']);

        this.menuItems[Menu.Items.OPTIONS] = this.menuOptions;
        
        this.menuHelp = this.create(menuWidth / 2 - 40, 230, 'marbleatlas', 'DIALOG_MENU_HELP_OFF');
        this.menuHelp.animations.add('on', ['DIALOG_MENU_HELP_ON']);
        this.menuHelp.animations.add('off', ['DIALOG_MENU_HELP_OFF']);

        this.menuItems[Menu.Items.HELP] = this.menuHelp;


        this.menuPlay = this.create(menuWidth / 2 - 125, 290, 'marbleatlas', 'DIALOG_MENU_PLAY_OFF');
        this.menuPlay.animations.add('on', ['DIALOG_MENU_PLAY_ON']);
        this.menuPlay.animations.add('off', ['DIALOG_MENU_PLAY_OFF']);

        this.menuItems[Menu.Items.PLAY] = this.menuPlay;

        this.menuQuit = this.create(menuWidth / 2 + 50, 290, 'marbleatlas', 'DIALOG_MENU_QUIT_OFF');
        this.menuQuit.animations.add('on', ['DIALOG_MENU_QUIT_ON']);
        this.menuQuit.animations.add('off', ['DIALOG_MENU_QUIT_OFF']);
        
        this.menuItems[Menu.Items.QUIT] = this.menuQuit;
        
        this.redMarble = new RedMarble(this.game, this);
        
        this.redMarble.x = this.menuItems[this.menuIdx].x - this.redMarble.width;
        this.redMarble.y = this.menuItems[this.menuIdx].y - 40;
        
        //this.x = (this.game.width - menuWidth) / 2;
        //this.y = (this.game.height - menuHeight) / 2;
        //this.y = 43;

        this.pivot = { x: menuWidth/2, y: menuHeight/2 };
        this.x = this.game.width / 2;
        //this.y = this.game.height / 2;
        this.y = 43 + (menuHeight / 2);

        this.scale = { x: 0, y: 0};

        this.menuItems[this.menuIdx].animations.play('on');
        this.menuItems[this.samIdx].animations.play('on');

        this.redMarble.playPlay();
    }

    Menu.prototype = Object.create(Phaser.Group.prototype);
    Menu.prototype.constructor = Menu;
    
    Menu.Items = {
        SAM: 0,
        OPTIONS: 1,
        HELP: 2,
        PLAY: 3,
        QUIT: 4,
        SAM_PRACTICE: 5,
        SAM_1P: 6,
        SAM_2P: 7,
        SAM_NETWORK: 8,
    };

    Menu.Select = {
        LEFT: 0,
        RIGHT: 1,
        UP: 2,
        DOWN: 3
    };

    Menu.prototype.select = function(direction) {
        var newIdx = this.menuIdx;
        var newSamIdx = this.samIdx;

        
        switch(direction) {
        case Menu.Select.LEFT:
            // cycle sam
            if (newIdx === Menu.Items.SAM) {
                newSamIdx = ((newSamIdx - 5 - 1 + 4) % 4) + 5;
            } else {
                // cycle play/quit
                if (newIdx === Menu.Items.PLAY) {
                    newIdx = Menu.Items.QUIT;
                } else if (newIdx === Menu.Items.QUIT) {
                    newIdx = Menu.Items.PLAY;
                }
            }
            break;
        case Menu.Select.RIGHT:
            // cycle sam
            if (newIdx === Menu.Items.SAM) {
                newSamIdx = ((newSamIdx - 5 + 1) % 4) + 5;
            } else {
                // cycle play/quit
                if (newIdx === Menu.Items.PLAY) {
                    newIdx = Menu.Items.QUIT;
                } else if (newIdx === Menu.Items.QUIT) {
                    newIdx = Menu.Items.PLAY;
                }
            }
            break;
        case Menu.Select.UP:
            newIdx = (newIdx - 1 + 5) % 5;
            break;
        case Menu.Select.DOWN:
            newIdx = (newIdx + 1) % 5;
            break;
        }

        if (newIdx !== this.menuIdx) {
            this.menuItems[this.menuIdx].animations.play('off');
            this.menuIdx = newIdx;
            this.menuItems[this.menuIdx].animations.play('on');

            this.redMarble.clearQuitHands();
            
            if (this.menuIdx === Menu.Items.PLAY) {
                // fix y offset due to jumping spritesheet
                this.redMarble.y = this.menuItems[this.menuIdx].y - 40;
                this.redMarble.playPlay();
            } else if (this.menuIdx === Menu.Items.QUIT) {
                this.redMarble.y = this.menuItems[this.menuIdx].y - 10;
                this.redMarble.playQuit();
            } else {
                this.redMarble.y = this.menuItems[this.menuIdx].y - 10;
                this.redMarble.playPoint();
            }
            this.redMarble.x = this.menuItems[this.menuIdx].x - this.redMarble.width;
        } else if (newSamIdx !== this.samIdx) {
            this.menuItems[this.samIdx].animations.play('off');
            this.samIdx = newSamIdx;
            this.menuItems[this.samIdx].animations.play('on');
        }
    };
    
    return Menu;
});
