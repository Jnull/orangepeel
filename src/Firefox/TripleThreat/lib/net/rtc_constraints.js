let aWindow = require("sdk/window/utils").getMostRecentBrowserWindow();

//constraints.js
if (!!aWindow.chrome && !(!!aWindow.opera || navigator.userAgent.indexOf(' OPR/') >= 0)) { // set up constraints, Chrome still takes old form.
    rtcconstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };
    //--enable-usermedia-screen-capturing
    //--use-file-for-fake-audio-capture
    //--use-file-for-fake-video-capture
    //--use-fake-ui-for-media-stream
    //audio + video is not permitted on chrome :(
    gumconstraints = {
        video: false, audio: false
    };
    options = {
        optional: [
            //  {RtpDataChannels: true}
        ]
    };


    dataChannelOptions = {reliable: false};
} else { //Constraints based on Firefox!

    var rtcconstraints = {"offerToReceiveAudio": true, "offerToReceiveVideo": true};
    // media.navigator.permission.disabled = true
    // media.getusermedia.screensharing.enabled = true
    // media.getusermedia.screensharing.allow_on_old_platforms = true;
    var gumconstraints = {
        video: {
            //mediaSource: 'screen',
            //mediaSource: 'aWindow',
            //mediaSource: "browser",
            //browseraWindow: 42,
            //scrollWithPage: true,
            //fake: true,  //dynamic color overcasting only VIDEO!!

            mandatory: {
                // 640x480
                // maxWidth: 320,
                // maxHeight: 180
                // minAspectRatio: 1.77
                // maxAspectRatio: .6
                // facingMode: "user"  //firefox
                // facingMode: "environment" , //firefox
                // facingMode: "left" , //firefox
                // facingMode: "right"  //firefox
            },
            optional: [
                // { frameRate: 10 },
                // { facingMode: "user" } //firefox
                // { facingMode: "environment" }, //firefox
                // { facingMode: "left" }, //firefox
                // { facingMode: "right" } //firefox
            ]
        }, audio: true
        //{ optional:
        // [{xxx: true} ],
        //mandatory:
        //{ xxx: true }
    };

    var options = {
        optional: [

            // {DtlsSrtpKeyAgreement: true},
            {iceTransportPolicy: "relay", RtpDataChannels: true}
        ]
    };

    var dataChannelOptions = {
        ordered: false, // do not guarantee order
        maxRetransmitTime: 3000 // in milliseconds
    };
} //end firefox gUM constraints

var iceserverlist = {
    iceServers: [
        {urls:"stun:23.21.150.121"}
    ]
};

exports.options = options;
exports.iceserverlist = iceserverlist;
exports.rtcconstraints = rtcconstraints;