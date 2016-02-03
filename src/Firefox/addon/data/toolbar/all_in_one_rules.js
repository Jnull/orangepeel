/**
 * Created by Void on 12/5/2015.
 */

localforage.config({
    name: 'pushvote'
});

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


self.port.on("activate_toolbar_all_in_one_rules_js", function(message) {
    switch (message) {
        case "noRules":
            localforage.getItem('master_delete_rules').then(function (result, err) {
                console.log("all_in_one_rules.js - Error:", err);
                if (!result) {
                    console.log("Results are fucked!", result);
                    return;
                }

                result.forEach(function (value) {
                    if (!value.xpath) {
                        console.log("value.xpath is fucked!", value);

                        return;
                    }

                    var xpath_array = Object.keys(value.xpath);
                    xpath_array.forEach(function (xpath_string) {
                        if (!xpath_string) {
                            console.log("xpath_string are fucked!", xpath_string);
                            return;
                        }

                        //all rules;
                        var xpathed_node = document.evaluate(xpath_string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (!xpathed_node) {
                            console.log("xpathed_node are fucked!", xpathed_node);

                            return;
                        }
                        xpathed_node.dataset.bypassObserver = 'true';

                        if (xpath_string && xpathed_node) {
                            console.log("Xpath_String and xpathed_node are valid", xpath_string, xpathed_node)
                            xpathed_node.classList.remove('hide_master_element');
                            xpathed_node.classList.remove('show_personal_element_hl');
                            xpathed_node.classList.remove('show_master_element_hl');
                            xpathed_node.classList.remove('hide_personal_element');
                        }

                    })
                })
            });
            //console.log("All Rules disabled, showing all elements on page!");
            break;
        case "personalRules":
            localforage.getItem('master_delete_rules').then(function (result, err) {
                if (!result) {
                    return;
                }

                result.forEach(function (value) {
                    if (!value.xpath) {
                        return;
                    }

                    var xpath_array = Object.keys(value.xpath);
                    xpath_array.forEach(function (xpath_string) {
                        var xpathed_node = document.evaluate(xpath_string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (!xpathed_node) {
                            return;
                        }
                        xpathed_node.dataset.bypassObserver = 'true';
                        xpathed_node.classList.remove('hide_master_element');
                        xpathed_node.classList.remove('show_master_element_hl');
                        if (value.fingerprint === fingerprint) {
                            xpathed_node.classList.remove('hide_personal_element');
                            xpathed_node.classList.add('show_personal_element_hl');
                        }

                    })
                })
            });
            //console.log("Enabled only personal rules, all elements (master rules disabled)");
            break;
        case "masterRules":
            localforage.getItem('master_delete_rules').then(function (result, err) {
                if (!result) {
                    return;
                }
                result.forEach(function (value) {
                    if (!value.xpath) {
                        return;
                    }

                    var xpath_array = Object.keys(value.xpath);
                    xpath_array.forEach(function (xpath_string) {
                        if (!xpath_string) {
                            return;
                        }
                        var xpathed_node = document.evaluate(xpath_string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (!xpathed_node) {
                            return;
                        }
                        xpathed_node.dataset.bypassObserver = 'true';
                        xpathed_node.classList.remove('hide_master_element');
                        xpathed_node.classList.remove('show_personal_element_hl');
                        xpathed_node.classList.remove('hide_personal_element');

                        if (value.fingerprint !== fingerprint) {
                            xpathed_node.classList.add('show_master_element_hl');
                        }
                    })
                })
            });


            //console.log("All Rules Enabled, showing all other elements");
            break;
        case "enableAllRules":
            localforage.getItem('master_delete_rules').then(function (result, err) {
                if (!result) {
                    return;
                }
                result.forEach(function (value) {
                    if (!value.xpath) {
                        return;
                    }

                    var xpath_array = Object.keys(value.xpath);
                    xpath_array.forEach(function (xpath_string) {
                        if (!xpath_string) {
                            return;
                        }
                        // if (value.fingerprint === fingerprint  && xpath_string && xpathed_node) {}
                        //Master Rules;
                        // else if (xpath_string && xpathed_node) {}

                        //all rules;
                        var xpathed_node = document.evaluate(xpath_string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (!xpathed_node) {
                            return;
                        }
                        if (xpath_string && xpathed_node) {
                            xpathed_node.classList.add('hide_master_element');
                            xpathed_node.classList.add('hide_personal_element');
                            xpathed_node.classList.remove('show_personal_element_hl');
                            xpathed_node.classList.remove('show_master_element_hl');
                            xpathed_node.dataset.bypassObserver = 'true';
                        }
                    })
                })
            });

            //console.log("All Rules Enabled, showing all other elements");
            break;
        default:
            console.log('Message Error, no such message listener in all_in_one_rules.js for: ' + e.data);
    }
});

