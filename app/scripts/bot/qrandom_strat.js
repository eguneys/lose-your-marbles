'use strict';

define(['phaser', 'bot/quick_strat', 'prefabs/marble'], function(Phaser, QuickStrat, Marble) {
    function QuickRandomStrat(focus) {
        QuickStrat.call(this, focus);
    }

    
    QuickRandomStrat.prototype = Object.create(QuickStrat.prototype);
    QuickRandomStrat.prototype.constructor = QuickRandomStrat;

    QuickRandomStrat.prototype.begin = function(state) {
        var randomColor = this.pick([
            Marble.Color.GREEN,
            Marble.Color.YELLOW,
            Marble.Color.BLACK,
            Marble.Color.RED,
            Marble.Color.BLUE
        ]);
        return this.matchToColor(state, randomColor, 3);
    };

    QuickRandomStrat.prototype.pick = function(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    return QuickRandomStrat;
});
