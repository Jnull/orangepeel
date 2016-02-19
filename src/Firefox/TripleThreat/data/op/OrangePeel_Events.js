/**
 * Created by Void on 11/21/2015.
 */
//Mouseover Highlighter


//fingerprint needs to load on real domain name.
let fingerprint;
if (/\./.test(document.location)) {
    var options = {
        excludeWebGL: true,
        excludeAdBlock: true
    };
    new Fingerprint2(options).get(function (result) {
        fingerprint = result;
        // console.log(fingerprint);
    });
} else {
    //  throw new Error("This isn't a webpage, stopping script!");
    console.log("document.location is wrong");
}



var the_element;
function pushvote_mouse_over_highlighter(e) {
    the_element = e.target;
    e.target.style.outline = "3px solid red";
    e.target.style.cursor = "crosshair";

    e.target.onmouseleave = function (e) {
        e.target.style.outline = "initial";
        e.target.style.cursor = "initial";
    };

    if (e.relatedTarget) {
        e.relatedTarget.style.outline = "initial";
        e.relatedTarget.style.cursor = "initial";
    }
}

function getMouseXY(e) {
    calculated_Xpos = e.pageX - unsafeWindow.pageXOffset;
    calculated_Ypos = e.pageY - unsafeWindow.pageYOffset;
}

function click_element_draggable(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var target = e.target;
    target.style.outline = 'dotted blue 4px';
    target.classList.add('add_drag');
    interact('.add_drag').draggable({
        onmove: dragMoveListener, ondrop: droppedListener, autoScroll: true
    }).resizable({
        inertia: true
    });
}

function droppedListener(f) {
    var target = f.target;
    target.classList.remove('add_drag');
}

function dragMoveListener(e) {
    var target = e.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;
    target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function presskeys_auctions(e) {
    e.stopPropagation(); //This prevents scrolling up the page on a deleted element.
    //e.stopImmediatePropagation();
    var code = e.keyCode || e.which;

    // Insert Key
    if (code == 45) {
        var d = document.createElement('div');
        d.id = "pinpoint";
        d.style.position = "absolute";
        d.style.left = calculated_Xpos + window.scrollX - 50 + "px";
        d.style.top = calculated_Ypos + window.scrollY - 20 + "px";
        d.style.width = "100px";
        d.style.height = "50px";
        d.style.border = "solid red 2px";
        d.style.background = "black";
        d.style.zIndex = "2147483647";
        document.body.appendChild(d);
    }

    //Delete Key
    if (code === 46) {
        // /Stop/Pause all html5 video.
        var videos = document.getElementsByTagName("video");
        for (var i = 0; i < videos.length; i++) {
            videos[i].pause(); //pause all html5 videos
        }

        //var temp_element = document.elementFromPoint(calculated_Xpos, calculated_Ypos);
        var temp_element = the_element; //Current Mouseover Hovered Element.
        var element_xpath = getXPath(temp_element);
        if (!temp_element instanceof HTMLIFrameElement && element_xpath === "/" || element_xpath === '/HTML[1]' || element_xpath === '/HTML[1]/BODY[1]') {
            //console.log("Stopped Further Delete From: ", element_xpath);
            return;
        }

        temp_element.classList.add('hide_personal_element');
        localforage.getItem('master_delete_rules').then(function (result, err) {
            /*
             * Create Single xpath Object to put inside array.
             */
            var xpath_map_object = {};
            var xpath_key = element_xpath;
            var client_time_xpath_property = uuid.v1();
            var duMmY_xpath_Object_Var = xpath_map_object[xpath_key] = (client_time_xpath_property);

            if (!result || !result.some(function (value, index, array) {
                        if (value.fingerprint === fingerprint) {
                            if (value.xpath) {
                                Object.assign(array[index].xpath, xpath_map_object);
                            } else {
                                array[index].xpath = xpath_map_object;
                            }
                            return true; //if fingerprint was found then return true to if statement
                        }
                    }
                )) {
                var temp_obj = {
                    hostname: domain,
                    username: null,
                    fingerprint: fingerprint,
                    client_creation_time: uuid.v1(),
                    server_insertion_time: null,
                    email: null,
                    url: url,
                    xpath: xpath_map_object
                };
                result = result || [];
                result.push(Object.assign(temp_obj));
            }

            if (!result) {
                console.log("There was a weird error,  result wasn't set somehow");
                return;
            }

            localforage.setItem('master_delete_rules', result, function (err, value) {
                /*
                 * Send Xpath Rule to Server
                 */
                var send_delete_rules = {
                    message: "client_send_delete_rule"
                    , hostname: domain
                    , username: null
                    , fingerprint: fingerprint
                    , email: null
                    , url: url
                    , server_insertion_time: null
                    , client_creation_time: uuid.v1()
                    , payload: {
                        xpath: element_xpath
                    },
                    status: "The client is sending delete rules to the server!"
                };
                pw.emit("client_to_websocket", (send_delete_rules));
                console.log(send_delete_rules);
            });
        });
    }

    //Control+Z
    if (e.ctrlKey && code == 90) {
        //New Way to Client Storage
        localforage.getItem('master_delete_rules').then(function (result, err) {
            if (result) {
                result.forEach(function (value, index, eArray) {
                    if (value.fingerprint && value.xpath) {
                        var elements_array = Object.keys(value.xpath);
                        if (elements_array.length !== 0) {
                            var last_element_xpath = elements_array.pop();
                            console.log(last_element_xpath);
                            var xpathed_node = document.evaluate(last_element_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                            if (xpathed_node) {
                                xpathed_node.dataset.bypassObserver = 'true';
                                xpathed_node.classList.remove('hide_personal_element');
                                xpathed_node.classList.remove('hide_master_element');
                                xpathed_node.classList.add('show_personal_element_hl');
                                xpathed_node.addEventListener('mouseover', function (e) {
                                    xpathed_node.classList.remove('show_personal_element_hl');
                                    this.removeEventListener('mouseover', arguments.callee);
                                });
                            }
                            delete result[index].xpath[last_element_xpath];

                            localforage.setItem('master_delete_rules', result, function (err, value) {
                                /*
                                 * Send Remove Delete Rule Request to Server
                                 */
                                var data = {
                                    message: "client_send_undelete_delete_rule"
                                    , hostname: domain
                                    , username: null
                                    , fingerprint: fingerprint
                                    , email: null
                                    , url: url
                                    , server_insertion_time: null
                                    , client_creation_time: new Date()
                                    , payload: {
                                        xpath: last_element_xpath
                                    },
                                    status: "The client is sending UNdelete rules to the server!"
                                };
                                pw.emit("client_to_websocket", data);
                            });
                        }
                    }
                });
            }
        });
    }
}