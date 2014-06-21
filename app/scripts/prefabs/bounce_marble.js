'use strict';

define(['phaser'], function(Phaser) {
    function BounceMarble(game, parent) {
        Phaser.Group.call(this, game, parent);

        // TODO change shade for level
        this.shadow = this.create(0, 0, 'marbleatlas', 'LEVEL-01_BALL_SHADOW');
        this.shadow.anchor = { x: 0.5, y: 0.5 };
        this.shadow.alpha = 0;
    }

    BounceMarble.prototype = Object.create(Phaser.Group.prototype);
    BounceMarble.prototype.constructor = BounceMarble;

    BounceMarble.prototype.tweenBounce = function(marble, x, y) {
        this.shadow.alpha = 1;

        var follow = { x: 0, y: 0 };

        var physics = new BouncePhysics(follow, { x: x, y: y }, 0.4, -10, 1);
        var tweenFollow = this.game.add.tween(follow)
            .to({ x: x, y: y }, 1200, Phaser.Easing.Quadratic.Out, true);
        
        tweenFollow.onUpdateCallback(this.marbleBounce.bind(this, follow, marble, physics));

        tweenFollow.onComplete.add(function() {
            this.shadow.alpha = 0;
        }, this);
        
        return tweenFollow;
    };

    BounceMarble.prototype.marbleBounce = function(follow, marble, physics) {

        physics.update();

        marble.x = follow.x;
        marble.y = follow.y;

        marble.x += physics.zX;
        marble.y += physics.zY;
        
        this.shadow.x = follow.x;
        this.shadow.y = follow.y;
    };


    function BouncePhysics(p1, p2, bf, vZ, aZ) {
        this.bF = bf || 0.6;
        this.z = 0;
        this.vZ = vZ || -20;
        this.aZ = aZ || 1;
        
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        this.angle = Math.atan2(dy, dx);

        this.onBounce = new Phaser.Signal();
        
        this.update = function() {
            this.z += this.vZ;
            this.vZ += this.aZ;
            
            if (this.z >= 0) {
                this.vZ = -1 * this.vZ * Math.sqrt(this.bF);
                if (Math.abs(this.z + this.vZ) <= this.aZ) {
                    this.vZ = 0;
                    this.aZ = 0;
                    this.z = 0;
                }
                this.z = 0;
            }
        };
        
        Object.defineProperty(this, 'zX', {
            get: function() { return  - this.z * Math.sin(this.angle); }
        });
        Object.defineProperty(this, 'zY', {
            get: function() { return this.z * Math.cos(this.angle); }
        });
    }
    
    return BounceMarble;
});
