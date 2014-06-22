'use strict';

define(['phaser', 'prefabs/marble'], function(Phaser, Marble) {
    function BotAI() {
        this.upPress = new Phaser.Signal();
        this.downPress = new Phaser.Signal();
        this.leftPress = new Phaser.Signal();
        this.rightPress = new Phaser.Signal();
        this.shiftPress = new Phaser.Signal();

        this.focus = [];

        this.updateRate = 0.02;
        this.visibleDelay = 0.2;
    }

    BotAI.Input = {
        UP: 0,
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3,
        SHIFT: 4
    };

    BotAI.Strat = {
        QUICK: 0,
        COLOR: 1,
        DUMP: 2,
        STREAK: 3,
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
        var strat = this.buildStrat(state);
        
        switch (strat) {
            case BotAI.Strat.QUICK:
            this.matchQuick(state);
            break;
            case BotAI.Strat.COLOR:
            this.matchSingle(state, state.matchColor);
            break;
            case BotAI.Strat.DUMP:
            break;
            case BotAI.Strat.STREAK:
            break;
        }
    };

    BotAI.prototype.buildStrat = function(state) {
        return BotAI.Strat.QUICK;
    };

    BotAI.prototype.matchQuick = function(state) {
        var color = Marble.Color.GREEN;

        this.matchToColor(state, color, 3);
    };

    BotAI.prototype.matchToColor = function(state, color, amount) {
        this.moveCursorToColumn(state, 0);
        this.matchToColorHelper(state, color, 0, 0, amount);
        this.rollover();
        this.rollover();
    };

    BotAI.prototype.matchToColorHelper = function(state, color, startI, endI, amount) {
        if (amount <= 0 || startI === state.columns - 1) return;
        
        var colorInPitch = this.movePitchToColor(state, endI, color);

        endI = this.moveCursorRightWrap(state, endI);
        
        if (colorInPitch) {
            this.matchToColorHelper(state, color, startI, endI, amount - 1);
        } else {
            startI = this.wrapColumnIncrease(state, startI);
            this.rollover();
            this.matchToColorHelper(state, color, startI, endI, amount);
        }
    };

    BotAI.prototype.movePitchToColor = function(state, column, color) {
        var row = this.findColorRowInColumn(state, column, color);

        if (row === -1) return false;

        this.movePitchToRow(state, row);
        
        return true;
    };

    BotAI.prototype.findColorRowInColumn = function(state, column, color) {
        var dist = 0;
        var pitchRow = this.getPitchRow(state);
        var maxAvailable = this.getAvailableRoom(state, column);
        var upMarble, downMarble;
        do {
            upMarble = this.getMarble(state.marbles, pitchRow - dist, column);
            downMarble = this.getMarble(state.marbles, pitchRow + dist, column);
            
            if (upMarble === color && dist <= maxAvailable.up) {
                return pitchRow - dist;
            } else if (downMarble === color && dist <= maxAvailable.down) {
                return pitchRow + dist;
            }

            ++dist;
        }
        while (dist <= maxAvailable.up || dist <= maxAvailable.down);

        return -1;
    };
    
    BotAI.prototype.movePitchToRow = function(state, row) {
        var iDir = BotAI.Input.DOWN;
        var dir = +1;

        var pitchRow = this.getPitchRow(state);

        if (row > pitchRow) {
            iDir = BotAI.Input.UP;
            dir = -1;
        }

        while (row != pitchRow) {
            row += dir;
            this.moveColumn(iDir);
        }
    };

    BotAI.prototype.moveCursorToColumn = function(state, column) {
        var iDir = BotAI.Input.LEFT;
        var dir = +1;
        
        if (column > state.cursor) {
            iDir = BotAI.Input.RIGHT;
            dir = -1;
        }

        while (column != state.cursor) {
            column+=dir;
            this.moveCursor(iDir);
        }
    };

    
    
    BotAI.prototype.moveColumn = function(dir) {
        this.focus.push(dir);
    };
    
    BotAI.prototype.moveCursor = function(dir) {
        this.focus.push(dir);
    };

    BotAI.prototype.moveCursorRightWrap = function(state, i) {
        i = this.wrapColumnIncrease(state, i);
        if (i === 0) {
            this.left(state.columns - 1);
        } else {
            this.right();
        }
        return i;
    };

    BotAI.prototype.rollover = function() {
        this.focus.push(BotAI.Input.SHIFT);
    };

    BotAI.prototype.left = function(amount) {
        while (--amount >= 0) {
            this.focus.push(BotAI.Input.LEFT);
        }
    };

    BotAI.prototype.right = function() {
        this.focus.push(BotAI.Input.RIGHT);
    };    

    BotAI.prototype.getMarble = function(marbles, row, column) {
        return marbles[column][row];
    };

    BotAI.prototype.getColumn = function(marbles, column) {
        return marbles[column];
    };

    BotAI.prototype.getRow = function(marbles, row) {
        return marbles.map(function(c) {
            return c[row];
        });
    };

    BotAI.prototype.getPitchRow = function(state) {
        return (state.rows - 1) / 2;
    };

    BotAI.prototype.wrapColumnIncrease = function(state, i) {
        return ((i + 1) % state.columns);
    };

    BotAI.prototype.getAvailableRoom = function(state, column) {
        var max = Math.floor(state.rows / 2);
        var top = state.edges[column].top;
        var bottom = state.edges[column].bottom - 1;

        return {
            up: Math.min(bottom, max - top),
            down: Math.min(top, max - bottom)
        };
    };
    
    BotAI.prototype.pressDispatch = function(input) {
        switch (input) {
        case BotAI.Input.UP:
            this.upPress.dispatch();
            break;
        case BotAI.Input.DOWN:
            this.downPress.dispatch();
            break;
        case BotAI.Input.LEFT:
            this.leftPress.dispatch();
            break;
        case BotAI.Input.RIGHT:
            this.rightPress.dispatch();
            break;
        case BotAI.Input.SHIFT:
            this.shiftPress.dispatch();
            break;
        }
    };

    return BotAI;
});
