/*
 *   https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/ui_frame
 */
//This is the toolbar frame
//one dummy request forces these addEventListeners to be initialized.
window.addEventListener("message", function(e) {
    document.getElementById('noRules').addEventListener('click', function originalPage() {
        window.parent.postMessage("noRules", e.origin);
    }, false);

    document.getElementById('personalRules').addEventListener('click', function personalPage() {
        window.parent.postMessage("personalRules", e.origin);
    }, false);

    document.getElementById('masterRules').addEventListener('click', function masterPage() {
        window.parent.postMessage("masterRules", e.origin);
    }, false);

    document.getElementById('enableAllRules').addEventListener('click', function masterPage() {
        window.parent.postMessage("enableAllRules", e.origin);
    }, false);
}, false);


//once postMessages are sending out they go to redirect to the tabs worker to the all_in_one_rules.js, they are proxied in main.js from the function frame_toolbar_messages(){}.
