'use strict';

define(['config'], function(Config) {
    Array.prototype.mapConcat = function(str) {
        return this.map(function(item) {
            return str + item;
        });
    };

    Array.prototype.mapAppend = function(str) {
        return this.map(function(item) {
            return item + str;
        });
    };

    function Util() {
        this.Config = Config;
    }

    Util.prototype.parseAudioSprite = function(game, key, json) {
        key = key || 'sfx';
        json = json || 'audiosprite';
        
        var fx = game.add.audio(key);
        
        var audiosprite = game.cache.getJSON(json);
        for (var sprite in audiosprite.spritemap) {
            var start = audiosprite.spritemap[sprite].start;
            var end = audiosprite.spritemap[sprite].end;
            //var loop = audiosprite.spritemap[sprite].loop;

            fx.addMarker(sprite, start, end - start);
        }
        return fx;
    };

    Util.prototype.playSfx = function(fx, key) {
        return fx.play(key, 0, Config.options.sfxVolume);
    };

    return new Util();
});
