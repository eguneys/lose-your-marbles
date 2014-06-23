'use strict';

define(['bot/strat'], function(BaseStrat) {
    function QuickStrat(focus) {
        BaseStrat.call(this, focus);

        this.state = {};
    }

    QuickStrat.prototype = Object.create(BaseStrat.prototype);
    QuickStrat.prototype.constructor = QuickStrat;

    QuickStrat.prototype.begin = function(state) {
        return this.matchToColor(state, 0, 3);
    };

    QuickStrat.prototype.resume = function(state) {
        var color = this.state.color;
        var startI = this.state.startI;
        var endI = this.state.endI;
        var amount = this.state.amount;
        return this.matchToColorHelper(state, color, startI, endI, amount);
    };
    
    QuickStrat.prototype.matchToColor = function(state, color, amount) {
        this.moveCursorToColumn(state, 0);
        return this.matchToColorHelper(state, color, 0, 0, amount);
    };

    QuickStrat.prototype.matchToColorHelper = function(state, color, startI, endI, amount) {
        if (amount <= 0 || startI === state.columns - 1) {
            return BaseStrat.State.INITIAL;
        }
        var colorInPitch = this.movePitchToColor(state, endI, color);

        endI = this.moveCursorRightWrap(state, endI);
        
        if (colorInPitch) {
            return this.matchToColorHelper(state, color, startI, endI, amount - 1);
        } else {
            startI = this.wrapColumnIncrease(state, startI);
            this.rollover();
            this.saveState(color, startI, endI, amount);
            return BaseStrat.State.PARTIAL;
        }
    };
    
    QuickStrat.prototype.saveState = function(color, startI, endI, amount) {
        this.state.color = color;
        this.state.startI = startI;
        this.state.endI =  endI;
        this.state.amount = amount;
    };


    
    return QuickStrat;
});
