'use strict';

define([], function() {
    function BaseStrat(focus)
    {
        this.focus = focus;

        this.status = BaseStrat.State.INITIAL;
    }

    BaseStrat.State = {
        INITIAL: 0,
        PARTIAL: 1
    };

    BaseStrat.Input = {
        UP: 0,
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3,
        SHIFT: 4
    };

    BaseStrat.prototype.match = function(state) {
        if (this.status === BaseStrat.State.INITIAL) {
            this.status = this.begin(state);
        } else {
            this.status = this.resume(state);
        }
    };
    
    BaseStrat.prototype.begin = function(state) { };
    BaseStrat.prototype.resume = function(state) { };
    
    BaseStrat.prototype.movePitchToColor = function(state, column, color) {
        var row = this.findColorRowInColumn(state, column, color);

        if (row === -1) return false;

        this.movePitchToRow(state, row);
        
        return true;
    };

    BaseStrat.prototype.findColorDistance = function(state, column, color) {
        var row = this.findColorRowInColumn(state, column, color);
        
        if (row === -1) return -1;
        
        return Math.abs(7 - row);
    };

    BaseStrat.prototype.findColorRowInColumn = function(state, column, color) {
        var dist = 0;
        var pitchRow = this.getPitchRow(state);
        var maxAvailable = this.getAvailableRoom(state, column);
        var upMarble, downMarble;
        do {
            upMarble = this.getMarble(state.marbles, pitchRow - dist, column);
            downMarble = this.getMarble(state.marbles, pitchRow + dist, column);
            
            if (upMarble === color && dist <= maxAvailable.down) {
                return pitchRow - dist;
            } else if (downMarble === color && dist <= maxAvailable.up) {
                return pitchRow + dist;
            }

            ++dist;
        }
        while (dist <= maxAvailable.up || dist <= maxAvailable.down);

        return -1;
    };
    
    BaseStrat.prototype.movePitchToRow = function(state, row) {
        var iDir = BaseStrat.Input.DOWN;
        var dir = +1;

        var pitchRow = this.getPitchRow(state);

        if (row > pitchRow) {
            iDir = BaseStrat.Input.UP;
            dir = -1;
        }

        while (row != pitchRow) {
            row += dir;
            this.moveColumn(iDir);
        }
    };

    BaseStrat.prototype.moveCursorToColumn = function(state, column) {
        var iDir = BaseStrat.Input.LEFT;
        var dir = +1;
        
        if (column > state.cursor) {
            iDir = BaseStrat.Input.RIGHT;
            dir = -1;
        }
        
        while (column != state.cursor) {
            column+=dir;
            this.moveCursor(iDir);
        }
    };

    
    
    BaseStrat.prototype.moveColumn = function(dir) {
        this.focus.push(dir);
    };
    
    BaseStrat.prototype.moveCursor = function(dir) {
        this.focus.push(dir);
    };

    BaseStrat.prototype.moveCursorRightWrap = function(state, i) {
        i = this.wrapColumnIncrease(state, i);
        if (i === 0) {
            this.left(state.columns - 1);
        } else {
            this.right();
        }
        return i;
    };

    BaseStrat.prototype.rollover = function() {
        this.focus.push(BaseStrat.Input.SHIFT);
    };

    BaseStrat.prototype.left = function(amount) {
        while (--amount >= 0) {
            this.focus.push(BaseStrat.Input.LEFT);
        }
    };

    BaseStrat.prototype.right = function() {
        this.focus.push(BaseStrat.Input.RIGHT);
    };    

    BaseStrat.prototype.getMarble = function(marbles, row, column) {
        return marbles[column][row];
    };

    BaseStrat.prototype.getColumn = function(marbles, column) {
        return marbles[column];
    };

    BaseStrat.prototype.getRow = function(marbles, row) {
        return marbles.map(function(c) {
            return c[row];
        });
    };

    BaseStrat.prototype.getPitchRow = function(state) {
        return (state.rows - 1) / 2;
    };

    BaseStrat.prototype.wrapColumnIncrease = function(state, i) {
        return ((i + 1) % state.columns);
    };

    BaseStrat.prototype.getAvailableRoom = function(state, column) {
        var max = Math.floor(state.rows / 2);
        var top = state.edges[column].top;
        var bottom = state.edges[column].bottom - 1;

        return {
            up: Math.min(bottom, max - top),
            down: Math.min(top, max - bottom)
        };
    };

    return BaseStrat;
});
