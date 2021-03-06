'use strict';

define(['phaser', 'util', 'prefabs/marble'], function(Phaser, Util, Marble) {
    function MarbleGroup(game, parent, fx) {
        Phaser.Group.call(this, game, parent);

        this.fx = fx;
        
        this.rows = 15;
        this.columns = 5;
        this.center = (this.rows - 1) / 2;

        this.marbleLayer = this.game.add.group(this);
        this.frontLayer = this.game.add.group(this);
        
        this.marbles = [];

        // keeps the top and bottom length of each column
        this.marbleEdges = [];

        // keeps the dropping marble counts
        // necessary to figure out column lengths and canLiftUp canLiftDown
        this.marbleDrops = [];

        for (var i = 0; i < this.columns; i++) {
            this.marbles[i] = [];

            this.marbleEdges[i] = { top: 0, bottom: 0 };
            this.marbleDrops[i] = { top: 0, bottom: 0 };
        }

        this.cursorIdx = 2;
        this.cursor = this.frontLayer.create(this.cursorIdx * Marble.WIDTH, this.center * Marble.HEIGHT, 'marbleatlas', 'COMMON01_BALL_POINTER');

        this.canHandleInput = true;
        this.allowInput = true;
        
        this.onMarbleMatched = new Phaser.Signal();
        this.onMarbleFull = new Phaser.Signal();
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

    MarbleGroup.prototype.stopHandleInput = function() {
        this.canHandleInput = false;
        this.allowInput = false;
        this.cursor.alpha = 0;
    };
    
    MarbleGroup.prototype.initMarbles = function(s) {
        var initRow = 6 - s;
        var endRow = 9 + s;
        for (var i = initRow; i<endRow; i++) {
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
            // canRecycle flag is necessary to recycle
            if (item.marbleColor === color && item.canRecycle) {
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
        for (var i = 0; i < count; i++) {
            var dropColumn = this.marbleLeastLengthColumnExcludeFull();
            
            if (this.isFull(dropColumn)) {
                this.onMarbleFull.dispatch(dropColumn);
                return;
            }

            this.fillMarblesInColumn(dropColumn, color);
        }

        // TODO find how to play dump sound
        this.playSoundDump(3);
    };

    MarbleGroup.prototype.dropMarbles = function(count, color) {
        count = count || 1;
        
        for (var i = 0; i < count; i++) {
            color = color || this.game.rnd.pick([
                Marble.Color.GREEN,
                Marble.Color.YELLOW,
                Marble.Color.BLACK,
                Marble.Color.RED,
                Marble.Color.BLUE
            ]);
        
            var dropColumn = this.marbleLeastLengthColumnExcludeFull();

            // dropColumn = 0;
            // console.log(dropColumn);
            // this is no longer true since marbleDrops added
            // // can't check full here
            // // because
            // // this fills the rows after drop tween
            // // full check is delegated to checkcollision
            
            // check for full
            if (this.isFull(dropColumn)) {
                this.onMarbleFull.dispatch(dropColumn);
                return;
            }
            


            this.addMarbleDropping(color, dropColumn);
        }
    };
    
    MarbleGroup.prototype.addMarbleDropping = function(color, dropColumn) {
        var marble = this.buildMarble(color);

        var row, tween;
        
        if (this.marbleColumnTopTaller(dropColumn)) {
            this.marbleDrops[dropColumn].bottom++;
            
            row = this.rows + 1;

            // if marble drops are more than 1 increase the row so they don't overlap
            row += this.marbleDrops[dropColumn].bottom - 1;
            
            marble.reset(row, dropColumn, color);
            tween = this.marbleContinueFallUp(marble, dropColumn, row - 1);
        } else {
            this.marbleDrops[dropColumn].top++;
            
            row = -2;

            // if marble drops are more than 1 decrease the row so they don't overlap
            row -= this.marbleDrops[dropColumn].top - 1;
            
            marble.reset(row, dropColumn, color);
            tween = this.marbleContinueFallDown(marble, dropColumn, row + 1);
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
        var d;
        if (direction === 1) {
            d = 'bottom';
            row = this.marbleColumnBottomRow(col);
        } else {
            d = 'top';
            row = this.marbleColumnTopRow(col);
        }
        
        //if (marble.overlap(this.getMarble(row, col))) {
        if (marble.calculateOverlap(this.getMarble(row, col))) {

            tween.stop();
            // stop dispatching marbleContinueFall event
            tween.onComplete.removeAll();
            
            this.marbleDrops[col][d]--;
            
            var resolveOffset = (Marble.HEIGHT) * direction;
            marble.y = this.getMarble(row, col).y + resolveOffset;
            
            this.placeMarble(marble, row + direction, col);
            marble.syncMarble(row + direction, this.getMarble(row, col));
        }
    };

    MarbleGroup.prototype.handleInput = function(input) {
        if (!this.canHandleInput) { return; }
        
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
        
        if (!this.canLiftUp(this.cursorIdx)) {
            this.playSoundCantMove();
            return 0;
        }

        var tween;

        for (var i = 1; i < this.rows; i++) {
            if (!!column[i]) {
                this.moveMarbleUp(i, this.cursorIdx);

                tween = column[i - 1].up(i - 1);
            }
        }

        this.marbleEdges[this.cursorIdx].top++;
        this.marbleEdges[this.cursorIdx].bottom--;

        this.playSoundUp();
        
        return tween;
    };

    MarbleGroup.prototype.down = function() {
        var column = this.marbles[this.cursorIdx];
        
        if (!this.canLiftDown(this.cursorIdx)) {
            this.playSoundCantMove();
            return 0;
        }

        var tween;
        
        for (var i = this.rows - 2; i >= 0; i--) {
            if (!!column[i]) {
                this.moveMarbleDown(i, this.cursorIdx);
                
                tween = column[i + 1].down(i + 1);
            }
        }

        this.playSoundDown();

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

        this.playSoundRoll();
        
        return rightMost.shiftRightMost(this.columns);
    };

    MarbleGroup.prototype.killMarbleMatches = function(allKilledCallback, callbackContext, streak) {
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
                tween.onComplete.add(allKilledCallback.bind(callbackContext, streak));
            };
            
            for (var i = 0; i < matchCount; i++) {
                var marble = this.getMarble(this.center, matchStart + i);

                // add onkilled event to the last killed
                if (i === matchCount - 1) {
                    marble.events.onKilled.addOnce(tweenMarbleDropThenCallback, this);
                    matchColor = marble.marbleColor;
                }

                // delay kill based on row index for the effect
                this.game.time.events.add(i * MarbleGroup.MARBLE_KILL_DELAY, this.killMarble.bind(this, marble, matchCount, streak));
            }

            if (streak > 1) {
                this.playSoundStreak(streak);
            }
        }
        
        return { count: matchCount, color: matchColor };
    };

    MarbleGroup.prototype.killMarble = function(marble, count, streak) {
        marble.playKill();

        if (streak === 1) {
            this.playSoundLineUp(count);
        }
    };

    MarbleGroup.prototype.removeKilledMarblesAndDropColumn = function() {
        var tween;
        for (var i = 0; i < this.columns; i++) {
            var marble = this.getMarble(this.center, i);

            // checking for alive caused a hard to find bug
            // where marble was recycled after getting killed
            // before executing this test
            // fix was by introducting canRecycle flag on the marble
            if (!marble.alive) {

                // allow recycle now, where we actually remove
                // it from the marbles
                marble.allowRecycle();
                
                // setting to null is dangerous, because
                // this.marbleEdges isn't get updated
                // however next function fills up the space immediately
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
        var match = this.killMarbleMatches(this.dropMarblesEventChainStart, this, streak + 1);

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

    
    MarbleGroup.prototype.playSoundUp = function() {
        var sound = this.game.rnd.pick(['MOVE1', 'MOVE3']);
        Util.playSfx(this.fx, sound);
    };
    
    MarbleGroup.prototype.playSoundDown = function() {
        this.playSoundUp();
    };

    MarbleGroup.prototype.playSoundRoll = function() {
        Util.playSfx(this.fx, 'MOVE2');
    };

    MarbleGroup.prototype.playSoundCantMove = function() {
        Util.playSfx(this.fx, 'cantmove');
    };

    MarbleGroup.prototype.playSoundLineUp = function(count) {
        Util.playSfx(this.fx, 'LNUP' + count + 'FST');
    };

    MarbleGroup.prototype.playSoundStreak = function(streak) {
        var sound = Math.min(Math.pow(2, (streak - 1)), 32);

        Util.playSfx(this.fx, sound);

        if (streak >= 6) {
            Util.playSfx(this.fx, 'OVER6');
        }
    };

    MarbleGroup.prototype.playSoundDump = function(count) {
        Util.playSfx(this.fx, 'DUMP' + count);
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

    MarbleGroup.prototype.marbleLeastLengthColumnExcludeFull = function() {
        var least = this.columns - 1;

        // start from top, this affects where marbles accumulate most
        for (var i = least; i >= 0; i--) {

            if (this.isFull(i)) { continue; }
            
            var cleast = Math.min(this.marbleEdges[least].top + this.marbleDrops[least].top,
                                  this.marbleEdges[least].bottom + this.marbleDrops[least].bottom);
            var ileast = Math.min(this.marbleEdges[i].top + this.marbleDrops[i].top,
                                  this.marbleEdges[i].bottom + this.marbleDrops[i].bottom);

            least = cleast<ileast?least:i;
        }

        return least;
    };
    
    MarbleGroup.prototype.marbleLeastLengthColumn = function() {
        var least = this.columns - 1;

        // start from top, this affects where marbles accumulate most
        for (var i = least; i >= 0; i--) {
            var cleast = Math.min(this.marbleEdges[least].top + this.marbleDrops[least].top,
                                  this.marbleEdges[least].bottom + this.marbleDrops[least].bottom);
            var ileast = Math.min(this.marbleEdges[i].top + this.marbleDrops[i].top,
                                  this.marbleEdges[i].bottom + this.marbleDrops[i].bottom);

            least = cleast<ileast?least:i;
        }

        return least;
    };

    MarbleGroup.prototype.marbleColumnLength = function(col) {
        return this.marbleEdges[col].top + this.marbleEdges[col].bottom;
    };
    
    MarbleGroup.prototype.marbleColumnTopTaller = function(col) {
        //return this.marbleEdges[col].top > (this.marbleEdges[col].bottom - 1);
        return this.marbleEdges[col].top + this.marbleDrops[col].top >
            this.marbleEdges[col].bottom - 1 + this.marbleDrops[col].bottom;
    };

    MarbleGroup.prototype.marbleColumnTopRow = function(col) {
        return this.center - this.marbleEdges[col].top;
    };

    MarbleGroup.prototype.marbleColumnBottomRow = function(col) {
        return this.center + this.marbleEdges[col].bottom - 1;
    };

    MarbleGroup.prototype.isFull = function(col) {
        //return this.marbleColumnLength(col) >= this.rows;
        return (this.marbleEdges[col].top + this.marbleDrops[col].top) +
            (this.marbleEdges[col].bottom + this.marbleDrops[col].bottom) >= this.rows;
    };

    MarbleGroup.prototype.canLiftUp = function(col) {
        var maxEdge = (this.rows - 1) / 2;

        var edgeLength = this.marbleEdges[col].top + this.marbleDrops[col].top;
        
        return edgeLength < maxEdge && this.marbleEdges[col].bottom > 1;
        //return (!!column[0] || !column[this.center + 1]);
    };

    MarbleGroup.prototype.canLiftDown = function(col) {
        var maxEdge = (this.rows - 1) / 2;

        var edgeLength = (this.marbleEdges[col].bottom - 1) + this.marbleDrops[col].bottom;
        
        return edgeLength < maxEdge && this.marbleEdges[col].top > 0;
        //return (!!column[this.rows - 1] || !column[this.center - 1]);
    };

    MarbleGroup.prototype.queryGameState = function() {
        return {
            marbles: this.marbles.map(function (r) { return r.map(function(i) { return i?i.marbleColor:-1; }); } ),
            cursor: this.cursorIdx,
            rows: this.rows,
            columns: this.columns,
            edges: this.marbleEdges.slice()
        };
    };
    
    return MarbleGroup;
});
