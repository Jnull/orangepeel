/**
 * Created by Void on 11/21/2015.
 */

var regex_var = new RegExp(/(\.[^\.]{0,100})(\.[^\.]{0,2})(\.*$)|(\.[^\.]*)(\.*$)/);
//var domain = document.location.hostname; //full domain name here
var domain = document.location.hostname.replace(regex_var, '').split('.').pop();
var url = window.location.href;

localforage.setDriver([localforage.LOCALSTORAGE, localforage.WEBSQL, localforage.INDEXEDDB]);
localforage.config({
    name: 'pushvote'
});

/*
 * Auto Loading Events
 */
//document.addEventListener('mouseover', pushvote_mouse_over_highlighter, false);
//document.addEventListener('keydown', presskeys_auctions, true);

//Action Button
self.port.on("Enable_Listeners", function(tag) {
    document.addEventListener('mouseover', pushvote_mouse_over_highlighter, false);
    document.addEventListener('keydown', presskeys_auctions, true);
});

self.port.on("Disable_Listeners", function(tag) {
    document.removeEventListener('mouseover', pushvote_mouse_over_highlighter, false);
    document.removeEventListener('keydown', presskeys_auctions, true);
});

/*
 * Pulling in all master rules from localstorage using localforage
 */
//make sure all scrolling is legit scrollbars //BUG 333 This breaks palemoon https://support.google.com/adsense/answer/1354736?hl=en
if (document.body) {
    document.body.style.cssText = "overflow:auto";
}

localforage.getItem('master_delete_rules').then(function (result, err) {
    result = result || [];
    result.forEach(function (v) {
        if (v && v.xpath && domain === v.hostname) {
            var xpath_array = Object.keys(v.xpath);
            xpath_array.forEach(function (xpath_string) {
                var xpathed_node = document.evaluate(xpath_string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (xpath_string && xpathed_node) {
                    xpathed_node.classList.add('hide_personal_element');
                }
            })
        }
    });

    if (result && result[0] && result[0].xpath) {
        var xpath_array_rules = Object.keys(result[0].xpath);
    }

    var mutation = new MutationObserver(function (mutations) {
        mutations.forEach(function (incoming_mutate) {
            var mutated_element_xpath = getXPath(incoming_mutate.target);

            if (xpath_array_rules && ~xpath_array_rules.indexOf(mutated_element_xpath) && Array.from(incoming_mutate.target.classList).indexOf('hide_personal_element') === -1 && (!incoming_mutate.target.dataset.bypassObserver)) {
                console.log("Just Observed Mutation and Removed:", mutated_element_xpath);
                incoming_mutate.target.classList.add('hide_personal_element');
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

    // configuration of the observer:
    var config = {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
    };

    // pass in the target node, as well as the observer options
    mutation.observe(document, config);
});
