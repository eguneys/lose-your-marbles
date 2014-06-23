'use strict';

define(['phaser', 'prefabs/marble', 'bot/strat', 'bot/quick_strat', 'bot/qrandom_strat'], function(Phaser, Marble, Strat, QuickStrat, QuickRandomStrat) {
    function BotAI() {
        this.upPress = new Phaser.Signal();
        this.downPress = new Phaser.Signal();
        this.leftPress = new Phaser.Signal();
        this.rightPress = new Phaser.Signal();
        this.shiftPress = new Phaser.Signal();

        this.focus = [];

        this.strat = null;

        this.updateRate = 0.02;
        this.visibleDelay = 0.5;
    }

    BotAI.Strat = {
        QUICK_RANDOM: 0,
        QUICK: 1,
        COLOR: 2,
        DUMP: 3,
        STREAK: 4,
    };

    BotAI.prototype.update = function(state) {
        if ((this.visibleDelay -= this.updateRate) > 0) { return; }
        this.visibleDelay = 0.2;
        
        if (!state) { return; }
        
        if (this.focus.length === 0) {
            this.processState(state);
        }
        
        var move = this.focus.shift();
        
        this.pressDispatch(move);
    };

    BotAI.prototype.processState = function(state) {
        this.strat = this.strat || this.buildStrat(state);
        this.strat.match(state);
    };

    BotAI.prototype.buildStrat = function(state) {
        var strat = BotAI.Strat.QUICK_RANDOM;
        
        switch (strat) {
        case BotAI.Strat.QUICK:
            return new QuickStrat(this.focus);
        case BotAI.Strat.QUICK_RANDOM:
            return new QuickRandomStrat(this.focus);
        }
    };
    
    BotAI.prototype.pressDispatch = function(input) {
        switch (input) {
        case Strat.Input.UP:
            this.upPress.dispatch();
            break;
        case Strat.Input.DOWN:
            this.downPress.dispatch();
            break;
        case Strat.Input.LEFT:
            this.leftPress.dispatch();
            break;
        case Strat.Input.RIGHT:
            this.rightPress.dispatch();
            break;
        case Strat.Input.SHIFT:
            this.shiftPress.dispatch();
            break;
        }
    };

    return BotAI;
});
