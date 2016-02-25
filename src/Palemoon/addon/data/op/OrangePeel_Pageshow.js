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
document.addEventListener('mousemove', getMouseXY, false); //This needs to be above tildee_pressed listener.
document.addEventListener('mouseover', pushvote_mouse_over_highlighter, false);
document.addEventListener('keydown', presskeys_auctions, true);

/*
 * Pulling in all master rules from localstorage using localforage
 */
//make sure all scrolling is legit scrollbars

//document.getElementsByTagName("body")[0].style.cssText = "overflow:auto";

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


        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                var mutated_element_xpath = getXPath(mutation.target);

                if (xpath_array_rules && ~xpath_array_rules.indexOf(mutated_element_xpath) && Array.from(mutation.target.classList).indexOf('hide_personal_element') === -1 && (!mutation.target.dataset.bypassObserver)) {
                    console.log("Just Observed Mutation and Removed:", mutated_element_xpath);
                    mutation.target.classList.add('hide_personal_element');
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
        observer.observe(document, config);
    });
