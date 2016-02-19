/**
 * Created by Void on 11/22/2015.
 */


var self = require("sdk/self");
var { viewFor } = require("sdk/view/core");
var windows = require("sdk/windows").browserWindows;
let bWindow = viewFor(windows.activeWindow);
/*
 * Audio Sounds.
 */

var Music = {
    main: function (audio) {
        if (!AudioObj) {
            var AudioObj = new bWindow.Audio;
        }
        AudioObj.src = audio;
        AudioObj.play();
    },
    mario: {
        coin: function () {
            Music.main(self.data.url("sound/smw_coin.wav"));
        },
        firework: function () {
            Music.main(self.data.url("sound/smb_fireworks.wav"));
        },
        Oneup: function () {
            Music.main(self.data.url("sound/smw_1-up.wav"));
        },
        stage_clear: function () {
            Music.main(self.data.url("sound/smb_stage_clear.wav"));
        },
        passthrough_gate: function () {
            Music.main(self.data.url("sound/smw_midway_gate.wav"));
        },
        kick: function () {
            Music.main(self.data.url("sound/smw_kick.wav"));
        },
        stomp: function () {
            Music.main(self.data.url("sound/smw_stomp_koopa_kid.wav"));
        }
    }
};

module.exports = Music;