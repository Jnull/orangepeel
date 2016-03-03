exports = module.exports = function (ws, worker) {

    var client_requesting_rtc_activation = {
        message: "client_requesting_rtc_activation"
        , hostname: null
        , username: null
        , fingerprint: null
        , email: null
        , url: null
        , server_insertion_time: null
        , client_creation_time: null
        , payload: {
            master_object: {}
            , xpath_object: {}
            , xpath: {}
        },
        status: "webrtc.js is Requesting server to activate a rtc connection"
    };

    ws.send(JSON.stringify(client_requesting_rtc_activation));



    var { setTimeout, clearTimeout } = require("sdk/timers");
    let aWindow = require("sdk/window/utils").getMostRecentBrowserWindow();
    var ice = require("./rtc_constraints.js"); //p2p Logic
    var iceserverlist = ice.iceserverlist;
    var options = ice.options;
    var rtcconstraints = ice.rtcconstraints;

    function fail(error) {
        console.log('Ending Session or Erroring Out', error);
    }

    var RTCPeerConnection = aWindow.RTCPeerConnection || aWindow.mozRTCPeerConnection || aWindow.webkitRTCPeerConnection;
    var RTCIceCandidate = aWindow.RTCIceCandidate || aWindow.mozRTCIceCandidate || aWindow.RTCIceCandidate;
    var RTCSessionDescription = aWindow.RTCSessionDescription || aWindow.mozRTCSessionDescription || aWindow.webkitRTCSessionDescription;
    var navigator = {};
    navigator.getUserMedia = aWindow.navigator.getUserMedia || aWindow.navigator.mozGetUserMedia || aWindow.navigator.webkitGetUserMedia;

    var aPC = [],
        bPC = [],
        aPC_Index = null,
        bPC_Index = null,
        aDC = [],
        bDC = [],
        aDC_Test = [],
        bDC_Test = [],
        aDC_Index = [],
        bDC_Index = [],
        aChannel = null,
        bChannel = null,
        the_channel = null;



    ws.addEventListener('message', function (data) {
            data = JSON.parse(data.data);
            var message = data.message || null
                , hostname = data.hostname || null
                , username = data.username || null
                , fingerprint = fingerprint || null
                , email = data.email
                , url = data.url || null
                , server_insertion_time = null
                , client_creation_time = null
                , master_object = data.payload.master_object || null
                , xpath_object = data.payload.xpath_object || ['']
                , xpath = data.payload.xpath || null
                , status = data.status || null;

            if (message === "webrtc") {
                var webrtc = data.webrtc;
                var webrtc_sub_message = webrtc.message;
                var webrtc_data = webrtc.data;

                switch (webrtc_sub_message) {
                    //--------->Start of Peer (B)<---------\\
                    case "aOfferRequest":
                       // console.log("aOfferRequest");
                      //  console.log(status);

                        //PeerConnection
                        bPC.push(new RTCPeerConnection(iceserverlist, options));  //rtc_constraints.js
                        bPC_Index = webrtc_data.bPC_Index = bPC.length - 1;  //current pc index.
                        bPC[bPC_Index].bICE = [];

                        //Create DataChannels
                        var dataChannelOptions = {
                            /*
                             ordered: If the data channel should guarantee order or not
                             maxRetransmitTime: The maximum time to try and retransmit a failed message (forces unreliable mode)
                             maxRetransmits: The maximum number of times to try and retransmit a failed message (forces unreliable mode)
                             protocol: Allows a subprotocol to be used, but will fail if the specified protocol is unsupported
                             negotiated: If set to true, it removes the automatic setting up of a data channel on the other peer, meaning that you are provided your own way to create a data channel with the same id on the other side
                             id: Allows you to provide your own ID for the channel
                             */
                            // ordered: false, // do not guarantee order
                            // maxRetransmitTime: 3000, // in milliseconds - forces unreliable
                            // maxRetransmits: 0, //forces unreliable
                            // protocol: null,
                            // negotiated: true,
                            // id: "YourOwnID"
                        };

                        //TODO create an array of all channel names and then loop through them to create.
                        //note: Only one side needs to create the webrtc_datachannel, this one just listens.
                        //   bDC.push(bPC[bPC_Index].createDataChannel("chatfunction", {}));// webrtc_dataChannelOptions));
                        bDC.push(bPC[bPC_Index].createDataChannel("chatmessage", {}));// webrtc_dataChannelOptions));
                        bDC.push(bPC[bPC_Index].createDataChannel("incoming_delete_rules", {}));// webrtc_dataChannelOptions));
                        //   bDC.push(bPC[bPC_Index].createDataChannel("chatfunction", {}));// webrtc_dataChannelOptions));
                        //   bDC.push(bPC[bPC_Index].createDataChannel("filetransfer", {}));// webrtc_dataChannelOptions));
                        //   bDC.push(bPC[bPC_Index].createDataChannel("filetransfer_test", {}));// webrtc_dataChannelOptions));
                        //   bDC.push(bPC[bPC_Index].createDataChannel("webrtc_datafunction", {}));// webrtc_dataChannelOptions));
                        //   bDC.push(bPC[bPC_Index].createDataChannel("webrtc_datafile", {}));// webrtc_dataChannelOptions));
                        bDC_Index = webrtc_data.bDC_Index = bDC.length - 1;
                        //bDC[bDC_Index].binaryType = 'blob';
                        //bDC[bDC_Index].binaryType = 'arraybuffer';

                        //Listen to DataChanels messages
                        //nested array, first array is to loop through bDC
                        //second arrays are to listen for each state/


                        //* //Data Channel handling handled in main.js
                        bDC.forEach(function (v, i, a) {
                                v.onopen = function (e) {
                                    var channel_name = e.target.label;
                                    //console.log("webrtc.js incoming PeerA Just Joined Channel to (PeerB): " + channel_name);//+ " - From Remote IP: " + x);

                                    switch (channel_name) {
                                        case "incoming_delete_rules": //datachannel name
                                            var outgoing_request = {
                                                message: "rtc_peer_request_delete_rules",
                                                payload: {
                                                    master_object: {},
                                                    hostname: null,
                                                    xpath: null
                                                },
                                                send_to_peer_side: "peera",
                                                status: "PeerB requesting activation from PeerA"
                                            };
                                            //console.log(outgoing_request.status);
                                            v.send(JSON.stringify(outgoing_request));  //request delete rules!!!
                                            break;

                                        case "chatmessage":
                                            // v.send("PeerA is sending a message to PeerB on channel: \"" + channel_name + "\"");
                                            break;
                                        default:
                                    }
                                    //ClientPage to WEBRTC
                                    worker.port.on('client_to_rtc_peerB', function (data) {
                                        var payload = JSON.stringify(data);
                                        //console.log("PeerB receiving client_to_rtc", payload);
                                        v.send(payload);
                                    });

                                };


                                v.onmessage = function (e) {
                                    var channel_name = e.target.label;
                                    var payload = e.data;
                                    // console.log("WebRTC.js - PeerB receiving channel5 " + channel_name + " message:", e.data);
                                    switch (channel_name) {
                                        case "incoming_delete_rules":
                                            //console.log("webrtc.js PeerB receiving message from PeerA, forwarding to onpageshow.js", payload);
                                            worker.port.emit('websocket_to_client', payload);
                                            break;


                                        case "chatmessage":

                                            //console.log("webrtc.js PeerB receiving channel " + channel_name + " message:", (e.data));

                                            //newParagraphElement = document.createElement("p");
                                            //newParagraphElement.innerHTML = "[" + new Date().getHours() + ":" + new Date().getMinutes() + "]" + " * " + e.data;
                                            //chatter_message_box.appendChild(newParagraphElement);
                                            //chatter_message_box.scrollTop = chatter_message_box.scrollHeight;
                                            break;
                                        case "chatfunction":
                                            console.log("DataChannel Message (chatfunction");
                                            break;
                                        case "webrtc_datatransfer":
                                            console.log("DataChannel Message (webrtc_datatransfer");
                                            break;
                                        case "webrtc_datafunction":
                                            console.log("DataChannel Message (webrtc_datafunction");
                                            break;
                                        case "filetransfer_test":
                                            console.log("DataChannel Message (filetransfer_test");
                                            console.log(e.protocol);
                                            // * //Debug logging
                                            console.log(
                                                "Label: " +
                                                this.label,
                                                " Ordered : " +
                                                bDC[bDC_Index].ordered,
                                                " Protocol: " +
                                                bDC[bDC_Index].protocol,
                                                " Label: " +
                                                bDC[bDC_Index].id,
                                                " Label: " +
                                                bDC[bDC_Index].readyState,
                                                "Label: " +
                                                bDC[bDC_Index].bufferedAmount,
                                                "Label: " +
                                                bDC[bDC_Index].binaryType,
                                                "Label: " +
                                                bDC[bDC_Index].maxPacketLifeType,
                                                "Label: " +
                                                bDC[bDC_Index].maxRetransmits,
                                                "Label: " +
                                                bDC[bDC_Index].negotiated,
                                                bDC[bDC_Index].reliable,
                                                bDC[bDC_Index].stream);
                                            // * /


                                            // * //
                                            console.log("This is weird: " + e.webrtc_data.file_name);
                                            var blob = e.webrtc_data.file; // Firefox allows us send blobs directly
                                            blob = new Blob([blob], {type: "octet/stream"});
                                            var file_blob = URL.createObjectURL(blob);
                                            console.log(file_blob);
                                            var new_chat_message = document.createElement("li");
                                            chat_file_list_parent.appendChild(new_chat_message);
                                            console.log(blob.name, blob.size, blob.type, blob.lastModifiedDate);
                                            var new_file_download = document.createElement("a");
                                            new_file_download.download = blob.name;
                                            new_file_download.href = file_blob;
                                            new_file_download.innerHTML = blob.name;
                                            new_chat_message.appendChild(new_file_download);
                                            // * /
                                            break;
                                        default:
                                            console.log("Could not find bPeer data channel message: ", channel_name);
                                    }


                                };

                                v.onclose = function (e) {
                                    var channel_name = e.target.label;
                                    // bDC[i].send("GoodBye aDC you have been disconnected!");
                                    console.log("The Data Channel " + channel_name + " is Closed");
                                };

                                v.onerror = function (error) {
                                    console.log("Data Channel Error:", error.toString());
                                };

                            }
                        )
                        ; //End DataChannels Here <----THis is handled in main.js now

                        //*/


                        // bPC[webrtc_data.bPC_Index].addStream(null);
                        bPC[bPC_Index].onaddstream = function (media) {
                            // insertvideo(media.stream)
                        };

                        bPC[bPC_Index].onicecandidate = function (event) {
                            if (event.candidate) {
                                bPC[bPC_Index].bICE.push(event.candidate); //save all ice until sdp answer received by a(), this is strange :-S
                            }
                        };

                        //create offer and send to a()
                        bPC[bPC_Index].createOffer(function (offer) {
                            var localSessionDescription = new RTCSessionDescription(offer);
                            bPC[bPC_Index].setLocalDescription(localSessionDescription, function () {
                                var webrtc_signal = {
                                    message: "webrtc",
                                    hostname: null,
                                    username: null,
                                    fingerprint: null,
                                    email: null,
                                    url: null,
                                    server_insertion_time: null,
                                    client_creation_time: null,
                                    webrtc: {
                                        message: "bServerProxyOfferResponse",
                                        data: {
                                            offer: offer,
                                            answer: null,
                                            bPC_Index: bPC_Index
                                        },

                                        //Swap dest and source for proxy.
                                        source_client_id: webrtc.dest_client_id,
                                        dest_client_id: webrtc.source_client_id
                                    },
                                    payload: {
                                        master_object: {},
                                        xpath_object: {},
                                        xpath: null
                                    },
                                    status: "clientB_id" + webrtc.dest_client_id + " is sending webrtc offer to bServerProxyOfferResponse(clientA_id" + webrtc.source_client_id + ")"
                                };

                                ws.send(JSON.stringify(webrtc_signal));
                                //console.log(webrtc_signal.webrtc.message);
                                //console.log(webrtc_signal.status);

                            }, fail);
                        }, fail, rtcconstraints);
                        break; //<-- End of aOfferRequest

                    case
                    "aAnswerResponse"
                    :
                        //a() sync has completed! Harmoniz a bucket of ice.candidates and send to a(), this should really be done by turn and stun though..
                        //console.log("aAnswerResponse");

                        bPC[bPC_Index].setRemoteDescription(
                            new RTCSessionDescription(webrtc_data.answer),
                            function () {
                                var webrtc_signal = {
                                    message: "webrtc",
                                    hostname: null,
                                    username: null,
                                    fingerprint: null,
                                    email: null,
                                    url: null,
                                    server_insertion_time: null,
                                    client_creation_time: null,
                                    webrtc: {
                                        message: "bServerProxyOfferIce",
                                        data: {
                                            offer: null,
                                            answer: null,
                                            bPC_Index: webrtc_data.bPC_Index,
                                            aPC_Index: webrtc_data.aPC_Index,
                                            aICE: null,
                                            bICE: bPC[bPC_Index].bICE
                                        },

                                        //swap source and dest
                                        source_client_id: webrtc.dest_client_id,
                                        dest_client_id: webrtc.source_client_id
                                    },
                                    payload: {
                                        master_object: {},
                                        xpath_object: {},
                                        xpath: null
                                    },

                                    status: "clientB_id" + webrtc.dest_client_id + " is sending bICE to clientA_id" + webrtc.source_client_id
                                };

                                ws.send(JSON.stringify(webrtc_signal));
                                //console.log(webrtc_signal.webrtc.message);
                                //console.log(webrtc_signal.status);
                                //Peer (B) is done.
                            }, fail);
                        break;

                    case
                    "aAnswerIce"
                    :
                        //a() returned their bucket of ice.candates to us, we should now be connected!
                        //console.log("aAnswerIce");
                        var i = 0;
                        while (i < webrtc_data.aICE.length) { // Add in the ICE Candidates.
                            bPC[bPC_Index].addIceCandidate(new RTCIceCandidate(webrtc_data.aICE[i]), function () {
                                //  console.log('Ice Candidate Status', bPC[bPC_Index].iceConnectionState);
                                //  console.log('DONE, NO MORE SINGALLING!!!');
                            }, fail);
                            i++;
                        }
                        break;

                    //----------->Start of Peer (A)<------------\\
                    case "bOfferResponse" :
                        //console.log("bOfferResponse");
                        //console.log(status);
                        //console.log("ClientA is now receiving Clientb Offer");// webrtc.data.offer);
                        aPC.push(new RTCPeerConnection(iceserverlist, options));
                        aPC_Index = webrtc_data.aPC_Index = aPC.length - 1;
                        aPC[aPC_Index].aICE = [];

                        //DataChannel Starts Here (receiving data) " THis is now handled in main.js

                        aPC[aPC_Index].ondatachannel = function (e) {
                            //This side only listens for new channels
                            aDC.push(aChannel = e.channel);  //name of channel being received into aDC array.
                            aDC_Index = webrtc_data.aDC_Index = aDC.length - 1; //There is no need for aDC for debug only.++++++++++++
                            // aDC[data.aDC_Index].binaryType = 'blob';

                            //* datachannel logic is now handled in main.js
                            aChannel.onopen = function (e) {
                                var channel_name = e.target.label;
                               // console.log("webrtc.js incoming PeerB Just Joined Channel to (PeerA): " + channel_name);//+ " - From Remote IP: " + x);


                                switch (channel_name) {
                                    case "incoming_delete_rules":
                                        //aDC[aDC_Index].send("PeerA is sending a message to PeerB on channel: \"" + channel_name + "\"");
                                        var outgoing_request = {
                                            message: "rtc_peer_request_delete_rules",
                                            payload: {
                                                master_object: {},
                                                hostname: null,
                                                xpath: null
                                            },
                                            send_to_peer_side: "peerb",
                                            status: "PeerA is sending activation request to PeerB"
                                        };
                                      //  console.log(outgoing_request.status, outgoing_request);
                                        this.send(JSON.stringify(outgoing_request));  //request delete rules!!!

                                        //ClientPage to WEBRTC
                                        worker.port.on('client_to_rtc_peerA', function (data) {
                                            var payload = JSON.stringify(data);
                                            //console.log("PeerA receiving client_to_rtc");
                                            aChannel.send(payload);
                                        });

                                        break;
                                    case "chatmessage":
                                        //aDC[aDC_Index].send("PeerA is sending a message to PeerB on channel: \"" + channel_name + "\"");


                                        break;
                                    default:
                                }


                            };

                            aChannel.onmessage = function (e) {
                                var channel_name = e.target.label;
                                var payload = e.data;

                                switch (channel_name) {
                                    case "incoming_delete_rules":
                                       // console.log("webrtc.js PeerA receiving message from PeerB, forwarding to onpageshow.js", payload);
                                        worker.port.emit('websocket_to_client', payload);
                                        break;

                                    case "chatmessage":
                                        //console.log("webrtc.js PeerB to PeerA Message - to - onpageshow.js", payload);
                                        //worker.port.emit('websocket_to_client', payload);
                                        //console.log("WebRTC.js - PeerA receiving channel " + channel_name + " message:", e.data);
                                        //newParagraphElement = document.createElement("p");
                                        //newParagraphElement.innerHTML = "[" + new Date().getHours() + ":" + new Date().getMinutes() + "]" + " * " + e.data;
                                        //chatter_message_box.appendChild(newParagraphElement);
                                        //chatter_message_box.scrollTop = chatter_message_box.scrollHeight;
                                        break;

                                    case "chatfunction":
                                        console.log("Chat message now (chatfunction)");
                                        break;

                                    case "datatransfer":
                                        console.log("Chat message now (datatransfer)");
                                        break;
                                    case "filetransfer_test":
                                        console.log("Chat message now (filetransfer_test)");
                                        if (e.data.byteLength >= 0) {
                                            var blob = e.data.file; // Firefox allows us send blobs directly
                                            var file_blob = URL.createObjectURL(blob);
                                            var new_chat_message = document.createElement("li");
                                            //chat_file_list_parent.appendChild(new_chat_message);
                                            // console.log(blob.name, blob.size, blob.type, blob.lastModifiedDate);
                                            var new_file_download = document.createElement("a");
                                            new_file_download.download = blob.name;
                                            new_file_download.href = file_blob;
                                            new_file_download.innerHTML = blob.name;
                                            new_chat_message.appendChild(new_file_download);
                                        }

                                        ///Debug logging
                                        console.log(
                                            "Label: " +
                                            this.label,
                                            " Ordered : " +
                                            aDC[aDC_Index].ordered,
                                            " Protocol: " +
                                            aDC[aDC_Index].protocol,
                                            " Label: " +
                                            aDC[aDC_Index].id,
                                            " Label: " +
                                            aDC[aDC_Index].readyState,
                                            "Label: " +
                                            aDC[aDC_Index].bufferedAmount,
                                            "Label: " +
                                            aDC[aDC_Index].binaryType,
                                            "Label: " +
                                            aDC[aDC_Index].maxPacketLifeType,
                                            "Label: " +
                                            aDC[aDC_Index].maxRetransmits,
                                            "Label: " +
                                            aDC[aDC_Index].negotiated,
                                            aDC[aDC_Index].reliable,
                                            aDC[aDC_Index].stream);
                                        break;

                                    case "datafunction":
                                        console.log("Chat message now (datafunction)");
                                        console.log(e.protocol);
                                        /*
                                         console.log("This is weird: " + e.data.file_name);
                                         var blob = e.data.file; // Firefox allows us send blobs directly
                                         blob = new Blob([blob], {type: "octet/stream"});
                                         var file_blob = URL.createObjectURL(blob);
                                         console.log(file_blob);
                                         var new_chat_message = document.createElement("li");
                                         chat_file_list_parent.appendChild(new_chat_message);
                                         console.log(blob.name, blob.size, blob.type, blob.lastModifiedDate);
                                         var new_file_download = document.createElement("a");
                                         new_file_download.download = blob.name;
                                         new_file_download.href = file_blob;
                                         new_file_download.innerHTML = blob.name;
                                         new_chat_message.appendChild(new_file_download);
                                         */
                                        break;
                                    default:
                                        console.log("data Achannel message not found: ", channel_name)
                                }
                            };

                            aChannel.onclose = function (e) {
                                var self = this;
                                var message = self.label;

                                // this.send("Goodbye bDC you are now disconnected!");
                                console.log("The Data Channel " + message + " is Closed");
                            };

                            aChannel.onerror = function (error) {
                                console.log("Data Channel Error:", error);
                            };
                            //*/
                        }; //end of DataChannels

                        //  aPC[webrtc_data.aPC_Index].addStream(null);
                        aPC[webrtc_data.aPC_Index].onaddstream = function (media) {
                            // insertvideo(media.stream, webrtc_data.bOfferResponseSocket)
                        };
                        aPC[webrtc_data.aPC_Index].onicecandidate = function (event) {
                            if (event.candidate) {
                                // console.log(event.candidate);
                                aPC[aPC_Index].aICE.push(event.candidate); //Save all ice.candidates

                            }
                        };

                        //register  removeOffer to RSD
                        var remoteSessionDescription = new RTCSessionDescription(webrtc_data.offer);
                        aPC[webrtc_data.aPC_Index].setRemoteDescription(remoteSessionDescription, function () {
                            //create answer here:
                            aPC[webrtc_data.aPC_Index].createAnswer(function (answer) {
                                var localSessionDescription = new RTCSessionDescription(answer);
                                aPC[webrtc_data.aPC_Index].setLocalDescription(localSessionDescription, function () {

                                        //format request
                                        var webrtc_signal = {
                                            message: "webrtc",
                                            hostname: null,
                                            username: null,
                                            fingerprint: null,
                                            email: null,
                                            url: null,
                                            server_insertion_time: null,
                                            client_creation_time: null,
                                            webrtc: {
                                                message: "aServerProxyAnswerResponse",
                                                data: {
                                                    offer: null,
                                                    answer: answer,
                                                    aPC_Index: aPC_Index,
                                                    bPC_Index: webrtc_data.bPC_Index
                                                },
                                                //flip dest and source for proxy
                                                source_client_id: webrtc.dest_client_id,
                                                dest_client_id: webrtc.source_client_id

                                            },
                                            payload: {
                                                master_object: {},
                                                xpath_object: {},
                                                xpath: null
                                            },
                                            status: "clientA_id" + webrtc.source_client_id + " is sending webrtc Answer to aServerProxyAnswerResponse(clientB_id" + webrtc.dest_client_id + ")"
                                        };

                                        ws.send(JSON.stringify(webrtc_signal));
                                        //console.log(webrtc_signal.webrtc.message);
                                        //console.log(webrtc_signal.status);

                                    },
                                    fail);
                            }, fail, rtcconstraints);
                        }, fail);

                        break;
                    case
                    "bOfferIce"
                    :
                        //console.log("bOfferIce");
                        //console.log(status);

                        //Wait for bICE
                        var biterator = 0;
                        while (biterator < webrtc_data.bICE.length) {
                            aPC[webrtc_data.aPC_Index].addIceCandidate(new RTCIceCandidate(webrtc_data.bICE[biterator]), function () {

                            }, fail);
                            biterator++;
                        }

                        //format request
                        var webrtc_signal = {
                            message: "webrtc",
                            hostname: null,
                            username: null,
                            fingerprint: null,
                            email: null,
                            url: null,
                            server_insertion_time: null,
                            client_creation_time: null,
                            webrtc: {
                                message: "aServerProxyAnswerIce",
                                data: {
                                    offer: null,
                                    answer: null,
                                    aPC_Index: aPC_Index,
                                    bPC_Index: webrtc_data.bPC_Index,
                                    aICE: aPC[aPC_Index].aICE,
                                    bICE: null
                                },
                                //flip dest and source for proxy
                                source_client_id: webrtc.dest_client_id,
                                dest_client_id: webrtc.source_client_id

                            },
                            payload: {
                                master_object: {},
                                xpath_object: {},
                                xpath: null
                            },
                            status: "clientA_id" + webrtc.dest_client_id + " is sending webrtc ICE clientB_id" + webrtc.source_client_id + ")"
                        };

                        ws.send(JSON.stringify(webrtc_signal));
                        //console.log(webrtc_signal.webrtc.message);
                        //console.log(webrtc_signal.status);
                        break;
                    default:
                    //console.log("The message has no rules, default caught");
                }
            }
        }
    );  //end of switch-case webrtc messages

    var rtc_obj = {
        aPC: aPC,
        bPC: bPC,
        aPC_Index: aPC_Index,
        bPC_Index: bPC_Index,
        aDC: aDC,
        bDC: bDC,
        aDC_Test: aDC_Test,
        bDC_Test: bDC_Test,
        aDC_Index: aDC_Index,
        bDC_Index: bDC_Index,
        aChannel: aChannel,
        bChannel: bChannel,
        the_channel: the_channel
    };

    aWindow.aPC = aPC;
    aWindow.bPC = bPC;
    aWindow.aPC_Index = aPC_Index;
    aWindow.bPC_Index = bPC_Index;
    aWindow.aDC = aDC;
    aWindow.bDC = bDC;
    aWindow.aDC_Test = aDC_Test;
    aWindow.bDC_Test = bDC_Test;
    aWindow.aDC_Index = aDC_Index;
    aWindow.bDC_Index = bDC_Index;
    aWindow.aChannel = aChannel;
    aWindow.bChannel = bChannel;

    return rtc_obj;
};


