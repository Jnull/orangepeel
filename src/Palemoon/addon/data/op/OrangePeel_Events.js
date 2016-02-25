/**
 * Created by Void on 11/21/2015.
 */


function presskeys_auctions(e) {
    // e.preventDefault();  //this prevents scrolling
    e.stopPropagation(); //This prevents scrolling up the page on a deleted element.
    //  e.stopImmediatePropagation();


    var code = e.keyCode || e.which;

    //Delete Key
    if (code === 46 && !(document.activeElement instanceof HTMLInputElement && document.activeElement.type == 'text') && !(document.activeElement instanceof HTMLTextAreaElement && document.activeElement.type == 'textarea')) {

        //stop all html5 videos
        var videos = document.getElementsByTagName("video");
        for (var i = 0; i < videos.length; i++) {
            videos[i].pause();
        }

        var delete_element = the_element; //Current Mouseover Hovered Element.
        var element_xpath = getXPath(the_element);

        console.log(element_xpath);
        if (!delete_element instanceof HTMLIFrameElement && element_xpath === "/" || element_xpath === '/HTML[1]' || element_xpath === '/HTML[1]/BODY[1]') {
          //  console.log("Stopped Further Delete From: ", element_xpath);
          //  console.log("This is a frame", delete_element instanceof HTMLIFrameElement);
          //  console.log("OwnerDocument", delete_element.ownerDocument);

          //  if (node.ownerDocument !== document) {
          //      prompt("this is an iframe apparently!?");
          //  }


            return;
        }

        delete_element.classList.add('hide_personal_element');
        localforage.getItem('master_delete_rules').then(function (result, err) {

            /*
             * Create Single xpath Object to put inside array.
             */
            var xpath_map_object = {};
            var xpath_key = element_xpath;
            var client_uuid_time = uuid.v1();
            var duMmY_xpath_Object_Var = xpath_map_object[xpath_key] = (client_uuid_time);

            if (result) {
                Object.assign(result[0].xpath, xpath_map_object);
            }
            else {
                result = [];
                var temp_obj = {
                    hostname: domain || null,
                    username: null,
                    fingerprint: null,
                    client_creation_time: uuid.v1(),
                    server_insertion_time: null,
                    email: null,
                    url: url || null,
                    xpath: xpath_map_object
                };
                result.push(Object.assign(temp_obj));
            }

            localforage.setItem('master_delete_rules', result, function (err, value) {
            });
        });
    }

    //Control+Z
    else if (e.ctrlKey && code == 90 && !(document.activeElement instanceof HTMLInputElement && document.activeElement.type == 'text') && !(document.activeElement instanceof HTMLTextAreaElement && document.activeElement.type == 'textarea')) {
        localforage.getItem('master_delete_rules').then(function (result, err) {
            if (result) {
                result.forEach(function (v, i, a) {
                    var elements_array = Object.keys(v.xpath);
                    if (elements_array.length > 0) {
                        var last_element_xpath = elements_array.pop();
                        var last_element_node = document.evaluate(last_element_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (last_element_node) {
                            last_element_node.dataset.bypassObserver = 'true';
                            last_element_node.classList.remove('hide_personal_element');
                            last_element_node.classList.add('show_personal_element_hl');
                            last_element_node.addEventListener('mouseover', function (e) {
                                last_element_node.classList.remove('show_personal_element_hl');
                                e.target.removeEventListener('mouseover', arguments.callee);
                            });
                        }

                        delete result[i].xpath[last_element_xpath];
                        localforage.setItem('master_delete_rules', result, function (err, value) {
                        });
                    }

                });
            }
        });
    }
}