var regex_var = new RegExp(/(\.[^\.]{0,100})(\.[^\.]{0,2})(\.*$)|(\.[^\.]*)(\.*$)/);
//var domain = document.location.hostname; //full domain name here
var domain = document.location.hostname.replace(regex_var, '').split('.').pop();
var url = window.location.href;
var fingerprint;
var calculated_Xpos;
var calculated_Ypos;
var edit_mode;

var pw = self.port;

localforage.config({
    name: 'pushvote'
});



//fingerprint needs to load on real domain name.
if (/\./.test(document.location)) {
    var options = {
        excludeWebGL: true,
        excludeAdBlock: true
    };
    new Fingerprint2(options).get(function (result) {
        fingerprint = result;
        console.log('onpageshow.js - fingerprint', result);
    });
}

//WebRTC request all delete rules from all RTC Connections:
var outgoing_rtc_data = {
    message: "rtc_peer_request_delete_rules",
    payload: {
        master_object: {},
        hostname: null,
        xpath: null
    },
    send_to_peer_side: "peerb",
    status: "PeerA is sending activation request to PeerB"
};
pw.emit('client_to_rtc_peerA', outgoing_rtc_data);
pw.emit('client_to_rtc_peerB', outgoing_rtc_data);


var outgoing_data = {
    message: "client_request_delete_rules"
    , hostname: domain
    , username: null
    , fingerprint: fingerprint
    , email: null
    , url: url
    , server_insertion_time: null
    , client_creation_time: new Date()
    , payload: {
        master_object: {}
        , xpath_object: {}
        , xpath: {}
    },
    status: "The Client at onpageshow.js on page \"" + domain + "\" is Requesting all delete rules"
};
pw.emit('client_to_websocket', outgoing_data);  //request delete rules for domain.


/*
 * Pulling in all master rules from localstorage using localforage
 */
localforage.getItem('master_delete_rules', function (err, result) {
    result = result || [];
    result.forEach(function (v) {
        if (v && v.xpath && domain === v.hostname) {
            var xpath_array = Object.keys(v.xpath);
            xpath_array.forEach(function (xpath_string) {
                //personal rules;
                var xpathed_node = document.evaluate(xpath_string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (!xpathed_node) {
                    return
                }
                xpathed_node.dataset.bypassObserver = 'true'; //when true, lockout mutation observer from making changes to my elements.
                //Personal Rules
                if (v.fingerprint === fingerprint && xpath_string && xpathed_node) {
                    xpathed_node.classList.remove('show_master_element_hl');
                    xpathed_node.classList.add('hide_personal_element');
                }
                //Master Rules;
                else if (xpath_string && xpathed_node) {
                    xpathed_node.classList.remove('show_master_element_hl');
                    xpathed_node.classList.add('hide_master_element');
                }
            })
        }
    })
});

/*
 * Auto Loading Events - In the futur
 */
//PageLoad Auto Edit Mode
document.addEventListener('mouseover', pushvote_mouse_over_highlighter, false);
document.addEventListener('keydown', presskeys_auctions, false);
//document.addEventListener('click', click_element_draggable, false); //Click to enable element to drag.

/*
 * Tildee Key Manual Loading Events
 */

document.addEventListener('mousemove', getMouseXY, false); //This needs to be above tildee_pressed listener.
document.addEventListener('keypress', tildee_pressed); //This needs to be below getMouseXY.

pw.on('websocket_to_client', function (incoming_data) { //Incoming websocket message
    // console.log("The message is in onpageshow.js");
    // console.log("testing incoming data", incoming_data);

    incoming_data = JSON.parse(incoming_data);
    var message = incoming_data.message || null
        , hostname = incoming_data.hostname || null
        , fp = incoming_data.fingerprint || null
        , username = incoming_data.username || null
        , email = incoming_data.email
        , url = incoming_data.url || null
        , server_insertion_time = server_insertion_time || null
        , client_creation_time = client_creation_time || null
        , master_object = incoming_data.payload.master_object || []
        , xpath = incoming_data.payload.xpath || null
        , xpath_object = incoming_data.payload.xpath_object || ['']
        , send_to_peer_side = incoming_data.send_to_peer_side || ''
        , status = incoming_data.status || null;

    switch (message) {
        case "server_requesting_client_activation": //websocket server to client for init
            console.log("onpageshow.js - incoming_data", incoming_data);
            var outgoing_data = {
                message: "client_request_delete_rules"
                , hostname: domain
                , username: null
                , fingerprint: fingerprint
                , email: null
                , url: url
                , server_insertion_time: null
                , client_creation_time: new Date()
                , payload: {
                    master_object: incoming_data.master_object || {}
                    , xpath_object: {}
                    , xpath: {}
                },
                status: "The Client at onpageshow.js on page \"" + domain + "\" is Requesting all delete rules"
            };
            pw.emit('client_to_websocket', outgoing_data);  //request delete rules for domain.
            break;


        case "server_response_delete_rules": //incoming delete rules
            localforage.setItem('master_delete_rules', master_object, function (err, result) {
                if (!master_object) {
                    console.log('master_object equals:', master_object);
                    return;
                }
                //  console.log("This is the master", master_object);
                //master_object is an array of objects, each object is from another client somewhere.
                result.forEach(function (v) {
                    if (!v || !v.xpath) {
                        return;
                    }

                    if (v.hostname === domain) {
                        var xpath_array_rules = Object.keys(v.xpath);
                        xpath_array_rules.forEach(function (xpath_string) {
                            if (!xpath_string) {
                                return;
                            }
                            var xpathed_node = document.evaluate(xpath_string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                            if (!xpathed_node) {
                                return;
                            }
                            xpathed_node.dataset.bypassObserver = 'true';
                            //Personal Rules
                            //prompt("This is the fingerprint", fingerprint);
                            //prompt("This is the v.fingerprint", v.fingerprint);
                            //prompt("This is the fp", fp);
                            if (v.fingerprint === fingerprint && xpath_string && xpathed_node) {
                                xpathed_node.classList.remove('show_master_element_hl');
                                xpathed_node.classList.add('hide_personal_element');
                            }
                            //Master Rules;
                            else if (xpath_string && xpathed_node) {
                                xpathed_node.classList.remove('show_master_element_hl');
                                xpathed_node.classList.add('hide_master_element');
                            }
                        });

                        // check all dom mutations (elements/objects etc...) for deleted elements
                        var observer = new MutationObserver(function (mutations) {
                            mutations.forEach(function (mutation) {
                                var mutated_element_xpath = getXPath(mutation.target);
                                if (xpath_array_rules.indexOf(mutated_element_xpath) > -1 && Array.from(mutation.target.classList).indexOf('hide_master_element') === -1 && (!mutation.target.dataset.bypassObserver)) {
                                    console.log("Just Observed Mutation and Removed:", mutated_element_xpath);
                                    mutation.target.classList.add('hide_master_element');
                                    //TODO Tweak this if problems with mutation_observer are seen.
                                    //mutation.target
                                    //mutation.type
                                    //mutation.oldValue
                                    //mutation.attributeName
                                    //mutation.attributeNamespace
                                    //mutation.removedNodes
                                    //mutation.addedNodes
                                }
                            });
                        });
                        //mutation observer configuration
                        var config = {
                            childList: true,
                            attributes: true,
                            characterData: true,
                            subtree: true,
                            attributeOldValue: true,
                            characterDataOldValue: true
                            //attributeFilter: true
                        };
                        // pass in the target node and options to mutation observer
                        observer.observe(document, config);
                    }
                })
            });
            break;
        case "webrtc":
            // console.log("The Message is in ORANGEPEEL WEBRTC CATCH");
            // console.log("onpageshow.js webrtc message Coming IN!", incoming_data);
            //webrtc logic
            break;
        case "rtc_peer_request_delete_rules":
            // console.log("The Message is in ORANGEPEEL WEBRTC CATCH");
            //console.log("onpageshow.js", incoming_data);
            //webrtc logic
            /*
             * Pulling in all master rules from localstorage using localforage
             */
            localforage.getItem('master_delete_rules').then(function (result, err) {

                var outgoing_rtc_data = {
                    message: "rtc_peer_response_delete_rules",
                    hostname: domain,
                    username: null,
                    fingerprint: fingerprint,
                    email: null,
                    url: url,
                    server_insertion_time: null,
                    client_creation_time: new Date(),
                    payload: {
                        master_object: result || {}
                        , xpath_object: {}
                        , xpath: {}
                    },
                    send_to_peer_side: send_to_peer_side,
                    status: "The RTC Peer on onpageshow.js from page \"" + domain + "\" is sending all the known delete rules to RTC"
                };

                //send delete rules out
                if (send_to_peer_side === 'peera') {
                    pw.emit('client_to_rtc_peerA', outgoing_rtc_data);
                }
                if (send_to_peer_side === 'peerb') {
                    pw.emit('client_to_rtc_peerB', outgoing_rtc_data);
                }
            });
            break;

        case "rtc_peer_response_delete_rules":
            console.log("onpageshow.js - rtc_peer_response_delete_rules", incoming_data);
            localforage.getItem('master_delete_rules', function (err, result) {

                if(result) {
                    result.forEach(function (v, i, a) {
                        if (!v){
                            return;
                        }

                        var xmaster_object = Object.keys(master_object);
                        xmaster_object.forEach(function (vv, ii, aa) {
                            if (a[i].xpath && vv.xpath && v.hostname == vv.hostname && v.fingerprint === vv.fingerprint) {
                                Object.assign(a[i].xpath, vv.xpath);
                            }
                            else {
                                result.concat(vv)
                            }
                        });


                        /*
                         * Mutation Observer
                         */



                        var xpath_array_rules = Object.keys(v.xpath);
                        xpath_array_rules.forEach(function (xpath_string) {
                            if (!xpath_string) {
                                return;
                            }
                            var xpathed_node = document.evaluate(xpath_string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                            if (!xpathed_node) {
                                return;
                            }
                            xpathed_node.dataset.bypassObserver = 'true';
                            //Personal Rules;
                            if (a[i].fingerprint === fingerprint && xpath_string && xpathed_node) {
                                xpathed_node.classList.add('hide_personal_element');
                            }

                            //Master Rules;
                            else {
                                xpathed_node.classList.add('hide_master_element');
                            }
                        });

                        // check all dom mutations (elements/objects etc...) for deleted elements
                        var observer = new MutationObserver(function (mutations) {
                            mutations.forEach(function (mutation) {
                                var mutated_element_xpath = getXPath(mutation.target);
                                if (xpath_array_rules.indexOf(mutated_element_xpath) > -1 && Array.from(mutation.target.classList).indexOf('hide_master_element') === -1 && (!mutation.target.dataset.bypassObserver)) {
                                    console.log("Just Observed Mutation and Removed:", mutated_element_xpath);
                                    mutation.target.classList.add('hide_master_element');
                                    //TODO Tweak this if problems with mutation_observer are seen.
                                    //mutation.target
                                    //mutation.type
                                    //mutation.oldValue
                                    //mutation.attributeName
                                    //mutation.attributeNamespace
                                    //mutation.removedNodes
                                    //mutation.addedNodes
                                }
                            });
                        });
                        //mutation observer configuration
                        var config = {
                            childList: true,
                            attributes: true,
                            characterData: true,
                            subtree: true,
                            attributeOldValue: true,
                            characterDataOldValue: true
                            //attributeFilter: true
                        };
                        // pass in the target node and options to mutation observer

                        //maybe we don't want to do this here???
                        // observer.observe(document, config);


                    });
                    localforage.setItem('master_delete_rules', result, function (err, value) {
                    });
                } else {

                }

            });
            break;
        case "client_send_delete_rule":
            console.log('onpageshow.js - client receiving delete rules', incoming_data);
            var temp_element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            var element_xpath = xpath;
            if (!temp_element instanceof HTMLIFrameElement && element_xpath === "/" || element_xpath === '/HTML[1]' || element_xpath === '/HTML[1]/BODY[1]') {
                //console.log("Stopped Further Delete From: ", element_xpath);
            } else {
                temp_element.classList.add('hide_personal_element');
            }
            break;

        case "client_send_undelete_delete_rule":
            var temp_element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            var element_xpath = xpath;
            if (!temp_element instanceof HTMLIFrameElement && element_xpath === "/" || element_xpath === '/HTML[1]' || element_xpath === '/HTML[1]/BODY[1]') {
                //console.log("Stopped Further Delete From: ", element_xpath);
            } else {
                temp_element.classList.remove('hide_personal_element');
            }
            break;
        default:
            console.log("Main websocket to onPageShow: unknown message: \"" + message + "\"");
            break;
    }
});

var stub_visible = false;
//Enable Edit Mode With ~ key
function tildee_pressed(e) {
    var code = e.keyCode || e.which;
    if (code == 126) { // Shift + ~  Stub show
        console.log(' ` was pressed');
        if (stub_visible) {
            document.getElementById('top-stub').style.visibility = "hidden";
            document.getElementById('right-stub').style.visibility = "hidden";
            document.getElementById('bottom-stub').style.visibility = "hidden";
            document.getElementById('left-stub').style.visibility = "hidden";
        } else {
            document.getElementById('top-stub').style.visibility = "visible";
            document.getElementById('right-stub').style.visibility = "visible";
            document.getElementById('bottom-stub').style.visibility = "visible";
            document.getElementById('left-stub').style.visibility = "visible";
        }
        stub_visible = !stub_visible;
    }

    if (code == 96) { // ~ Edit Mode
        e.preventDefault(); //This prevents the actual raw key as being sent to the page.
        edit_mode = !edit_mode;
        console.log(' ~ was pressed and edit mode is: ' + edit_mode);
        if (edit_mode) {
            document.addEventListener('mouseover', pushvote_mouse_over_highlighter, false);
            document.addEventListener('keydown', presskeys_auctions, false);
            document.addEventListener('click', event_Delegate_Click_Movable, false);
        } else if (!edit_mode) {
            document.removeEventListener('mouseover', pushvote_mouse_over_highlighter);
            document.removeEventListener('keydown', presskeys_auctions);
            document.removeEventListener('click', event_Delegate_Click_Movable, false);
        }
    }
}
