'use strict';

define(['phaser', 'prefabs/marble'], function(Phaser, Marble) {
    function MarbleGroup(game, parent) {
        Phaser.Group.call(this, game, parent);

        this.rows = 15;
        this.columns = 5;
        this.center = (this.rows - 1) / 2;

        this.marbleLayer = this.game.add.group(this);
        this.frontLayer = this.game.add.group(this);
        
        this.marbles = [];

        // keeps the top and bottom length of each column
        this.marbleEdges = [];

        for (var i = 0; i < this.columns; i++) {
            this.marbles[i] = [];

            this.marbleEdges[i] = { top: 0, bottom: 0 };
        }

        this.cursorIdx = 2;
        this.cursor = this.frontLayer.create(this.cursorIdx * Marble.WIDTH, this.center * Marble.HEIGHT, 'marbleatlas', 'COMMON01_BALL_POINTER');
        
        this.allowInput = true;


        this.onMarbleMatched = new Phaser.Signal();
    }

    MarbleGroup.prototype = Object.create(Phaser.Group.prototype);
    MarbleGroup.prototype.constructor = MarbleGroup;

    Object.defineProperty(MarbleGroup.prototype, 'width', {
        get: function() {
            return (this.columns + 1) * Marble.WIDTH;
        }
    });

    Object.defineProperty(MarbleGroup.prototype, 'height', {
        get: function() {
            return (this.rows) * Marble.HEIGHT;
        }
    });
    
    MarbleGroup.Input = {
        UP: 0,
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3,
        SHIFT: 4
    };

    MarbleGroup.CURSOR_MOVE_DURATION = 100;
    MarbleGroup.MATCH_MIN = 3;
    MarbleGroup.ROW_MIN = 5;

    MarbleGroup.MARBLE_KILL_DELAY = 50;
    
    MarbleGroup.prototype.initMarbles = function() {
        for (var i = 5; i<10; i++) {
            for (var j = 0; j < this.columns; j++) {
                this.addMarble(i, j);
            }
        }
    };

    MarbleGroup.prototype.buildMarble = function(color) {
        color = color || this.game.rnd.pick([
            Marble.Color.GREEN,
            Marble.Color.YELLOW,
            Marble.Color.BLACK,
            Marble.Color.RED,
            Marble.Color.BLUE
        ]);
        var marble;
        
        this.marbleLayer.forEachDead(function(item) {
            if (item.marbleColor === color) {
                marble = item;
            }
        }, this);

        if (!marble) {
            marble = new Marble(this.game, 0, 0, color);
            this.marbleLayer.add(marble);
        }

        return marble;
    };

    MarbleGroup.prototype.placeMarble = function(marble, row, col) {
        this.setMarble(row, col, marble);

        if (row < this.center) {
            this.marbleEdges[col].top++;
        } else {
            this.marbleEdges[col].bottom++;
        }
    };
    
    MarbleGroup.prototype.addMarble = function(row, col, color) {
        var marble = this.buildMarble(color);
        
        this.placeMarble(marble, row, col);

        marble.reset(row, col);
        marble.playBlink();

        return marble;
    };

    MarbleGroup.prototype.dropMarblesNoAnim = function(count, color) {
        var dropColumn = this.marbleLeastLengthColumn();

        for (var i = 0; i < count; i++) {
            this.fillMarblesInColumn((dropColumn + i) % this.columns, color);
        }
    };

    MarbleGroup.prototype.dropMarbles = function(count, color) {
        count = count || 1;
        color = color || this.game.rnd.pick([
            Marble.Color.GREEN,
            Marble.Color.YELLOW,
            Marble.Color.BLACK,
            Marble.Color.RED,
            Marble.Color.BLUE
        ]);
        
        var dropColumn = this.marbleLeastLengthColumn();

        for (var i = 0; i < count; i++) {
            this.addMarbleDropping(color, (dropColumn + i) % this.columns);
        }
        
    };
    
    MarbleGroup.prototype.addMarbleDropping = function(color, dropColumn) {
        var marble = this.buildMarble(color);

        var row, tween;
        if (this.marbleEdges[dropColumn].top < this.marbleEdges[dropColumn].bottom) {
            row = -2;
            marble.reset(row, dropColumn, color);
            tween = this.marbleContinueFallDown(marble, dropColumn, row + 1);
        } else {
            row = this.rows + 1;
            marble.reset(row, dropColumn, color);
            tween = this.marbleContinueFallUp(marble, dropColumn, row - 1);
        }
        
        return marble;
    };

    MarbleGroup.prototype.marbleContinueFallDown = function(marble, col, row) {
        var tween = marble.down(row);
        
        tween.onComplete.add(this.marbleContinueFallDown.bind(this, marble, col, row + 1));

        tween.onUpdateCallback(this.marbleDetectCollision.bind(this, tween, marble, col, - 1));

        return tween;
    };

    MarbleGroup.prototype.marbleContinueFallUp = function(marble, col, row) {
        var tween = marble.up(row);
        
        tween.onComplete.add(this.marbleContinueFallUp.bind(this, marble, col, row - 1));

        tween.onUpdateCallback(this.marbleDetectCollision.bind(this, tween, marble, col, 1));
        
        return tween;
    };

    
    MarbleGroup.prototype.marbleDetectCollision = function(tween, marble, col, direction) {
        var row;
        if (direction === 1) {
            row = this.marbleColumnBottomRow(col);
        } else {
            row = this.marbleColumnTopRow(col);
        }
        
        //if (marble.overlap(this.getMarble(row, col))) {
        if (marble.calculateOverlap(this.getMarble(row, col))) {
            var resolveOffset = (Marble.HEIGHT) * direction;
            marble.y = this.getMarble(row, col).y + resolveOffset;
            
            tween.stop();
            // stop dispatching marbleContinueFall event
            tween.onComplete.removeAll();
            
            this.placeMarble(marble, row + direction, col);
            marble.syncMarble(row + direction, this.getMarble(row, col));
        }
    };

    MarbleGroup.prototype.handleInput = function(input) {
        // allow left right anytime
        switch (input) {
        case MarbleGroup.Input.LEFT:
            this.left();
            return;
        case MarbleGroup.Input.RIGHT:
            this.right();
            return;
        }
        
        if (!this.allowInput) { return; }
        this.allowInput = false;

        var tween;
        
        switch (input) {
        case MarbleGroup.Input.UP:
            tween = this.up();
            break;
        case MarbleGroup.Input.DOWN:
            tween = this.down();
            break;
        case MarbleGroup.Input.SHIFT:
            tween = this.shift();
            break;
        }

        if (tween) {
            tween.onComplete.add(this.dropMarblesEventChainStart.bind(this, 0));
        } else {
            this.allowInput = true;
        }
    };

    MarbleGroup.prototype.left = function() {
        this.cursorIdx = Math.max(0, this.cursorIdx - 1);

        return this.tweenCursorPos();
    };

    MarbleGroup.prototype.right = function() {
        this.cursorIdx = Math.min(this.columns - 1, this.cursorIdx + 1);

        return this.tweenCursorPos();
    };

    MarbleGroup.prototype.up = function() {
        var column = this.marbles[this.cursorIdx];
        
        //boundary check
        if (!!column[0] || !column[this.center + 1]) {
            return 0;
        }

        var tween;
        // move marbles in the array
        for (var i = 1; i < this.rows; i++) {
            if (!!column[i]) {
                this.moveMarbleUp(i, this.cursorIdx);

                tween = column[i - 1].up(i - 1);
            }
        }

        this.marbleEdges[this.cursorIdx].top++;
        this.marbleEdges[this.cursorIdx].bottom--;
        
        return tween;
    };

    MarbleGroup.prototype.down = function() {
        var column = this.marbles[this.cursorIdx];

        if (!!column[this.rows - 1] || !column[this.center - 1]) {
            return 0;
        }

        var tween;
        
        for (var i = this.rows - 2; i >= 0; i--) {
            if (!!column[i]) {
                this.moveMarbleDown(i, this.cursorIdx);
                
                tween = column[i + 1].down(i + 1);
            }
        }

        this.marbleEdges[this.cursorIdx].top--;
        this.marbleEdges[this.cursorIdx].bottom++;
        
        return tween;
    };

    MarbleGroup.prototype.shift = function() {
        var rightMost = this.getMarble(this.center, this.columns - 1);

        var i;
        
        for (i = this.columns - 2; i >= 0; i--) {
            this.moveMarble(this.center, i, this.center, i + 1);
        }

        this.setMarble(this.center, 0, rightMost);
        
        for (i = 1; i < this.columns; i++) {
            this.getMarble(this.center, i).shift(i);
        }
        return rightMost.shiftRightMost(this.columns);
    };

    MarbleGroup.prototype.killMarbleMatches = function(allKilledCallback, callbackContext) {
        var matchStart = 0;
        var matchCount = 0;
        var matchColor;
        
        while (matchStart <= this.columns - MarbleGroup.MATCH_MIN) {
            while (matchStart + matchCount < this.columns &&
                   this.sameMarbleColor(this.center, matchStart, this.center, matchStart + matchCount)) {
                ++matchCount;
            }

            if (matchCount >= MarbleGroup.MATCH_MIN) {
                break;
            }

            matchCount = 0;
            ++matchStart;
        }
        
        if (matchCount >= MarbleGroup.MATCH_MIN) {
            var tweenMarbleDropThenCallback = function() {
                var tween = this.removeKilledMarblesAndDropColumn();
                tween.onComplete.add(allKilledCallback, callbackContext);
            };
            
            for (var i = 0; i < matchCount; i++) {
                var marble = this.getMarble(this.center, matchStart + i);

                // add onkilled event to the last killed
                if (i === matchCount - 1) {
                    marble.events.onKilled.addOnce(tweenMarbleDropThenCallback, this);
                    matchColor = marble.marbleColor;
                }

                // delay kill based on row index for the effect
                this.game.time.events.add(i * MarbleGroup.MARBLE_KILL_DELAY, marble.playKill, marble);
            }
        }
        
        return { count: matchCount, color: matchColor };
    };

    MarbleGroup.prototype.removeKilledMarblesAndDropColumn = function() {
        var tween;
        for (var i = 0; i < this.columns; i++) {
            var marble = this.getMarble(this.center, i);
            if (!marble.alive) {
                this.setMarble(this.center, i, null);
                
                tween = this.dropMarblesInColumn(i);

                
                if (this.marbleColumnLength(i) < MarbleGroup.ROW_MIN) {
                    tween.onComplete.add(this.fillMarblesInColumn.bind(this, i, null));
                }

            }
        }
        return tween;
    };

    MarbleGroup.prototype.dropMarblesInColumn = function(column) {
        var tween;
        
        var row = this.center - 1;
        
        var marble;

        if (this.thereIsMarble(row, column)) {
            while (row >= 0 && this.thereIsMarble(row, column)) {
                marble = this.getMarble(row, column);
                
                this.moveMarbleDown(row, column);
                
                tween = marble.down(row + 1);
                row--;
            }

            this.marbleEdges[column].top--;
        } else {
            // if there was no marbles to drop
            // lift the below marbles
            row = this.center + 1;

            while (row < this.rows && this.thereIsMarble(row, column)) {
                marble = this.getMarble(row, column);

                this.moveMarbleUp(row, column);
                tween = marble.up(row - 1);

                row++;
            }

            this.marbleEdges[column].bottom--;
        }
        
        return tween;
    };

    MarbleGroup.prototype.fillMarblesInColumn = function(column, color) {
        var row;
        if (this.marbleColumnTopTaller(column)) {
            row = this.marbleColumnBottomRow(column) + 1;
        } else {
            row = this.marbleColumnTopRow(column) - 1;
        }
        this.addMarble(row, column, color);
    };

    MarbleGroup.prototype.dropMarblesEventChainStart = function(streak) {
        var match = this.killMarbleMatches(this.dropMarblesEventChainStart.bind(this, streak + 1));

        var matchCount = match.count;
        var matchColor = match.color;
        
        if (matchCount >= MarbleGroup.MATCH_MIN) {
            this.onMarbleMatched.dispatch(matchColor, matchCount, streak);
        } else {
            this.allowInput = true;
        }
    };

    MarbleGroup.prototype.tweenCursorPos = function() {
        return this.game.add.tween(this.cursor)
            .to({ x: this.cursorIdx * Marble.WIDTH }, MarbleGroup.CURSOR_MOVE_DURATION, Phaser.Easing.Linear.None, true);
    };

    MarbleGroup.prototype.thereIsMarble = function(row, col) {
        return !!this.marbles[col][row];
    };

    MarbleGroup.prototype.sameMarbleColor = function(row, col, row2, col2) {
        return this.getMarble(row, col).marbleColor === this.getMarble(row2, col2).marbleColor;
    };

    MarbleGroup.prototype.getMarble = function(row, col) {
        return this.marbles[col][row];
    };

    MarbleGroup.prototype.setMarble = function(row, col, value) {
        this.marbles[col][row] = value;
    };

    MarbleGroup.prototype.moveMarble = function(fromRow, fromCol, toRow, toCol) {
        this.marbles[toCol][toRow] = this.marbles[fromCol][fromRow];
        this.marbles[fromCol][fromRow] = null;
    };

    MarbleGroup.prototype.moveMarbleUp = function(row, col) {
        this.moveMarble(row, col, row - 1, col);
    };

    MarbleGroup.prototype.moveMarbleDown = function(row, col) {
        this.moveMarble(row, col, row + 1, col);
    };

    MarbleGroup.prototype.getMarbleColumn = function(col) {
        return this.marbles[col];
    };

    MarbleGroup.prototype.marbleColumnLength = function(col) {
        return this.marbleEdges[col].top + this.marbleEdges[col].bottom;
    };

    MarbleGroup.prototype.marbleLeastLengthColumn = function() {
        var least = 0;

        for (var i = 0; i < this.columns; i++) {
            var cleast = Math.min(this.marbleEdges[least].top, this.marbleEdges[least].bottom);
            var ileast = Math.min(this.marbleEdges[i].top, this.marbleEdges[i].bottom);

            least = cleast<ileast?least:i;
        }

        return least;
    };

    MarbleGroup.prototype.marbleColumnTopTaller = function(col) {
        return this.marbleEdges[col].top > (this.marbleEdges[col].bottom - 1);
    };

    MarbleGroup.prototype.marbleColumnTopRow = function(col) {
        return this.center - this.marbleEdges[col].top;
    };

    MarbleGroup.prototype.marbleColumnBottomRow = function(col) {
        return this.center + this.marbleEdges[col].bottom - 1;
    };
    
    return MarbleGroup;
});
