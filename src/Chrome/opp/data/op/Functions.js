/**
 * Created by Void on 11/21/2015.
 */

//Keep these vars here, they become dead objects in PaleMoon
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


function getXPath(node) {
    var comp, comps = [];
    var xpath = '';
    var getPos = function (node) {
        var position = 1, curNode;
        if (node.nodeType == Node.ATTRIBUTE_NODE) {
            return null;
        }
        for (curNode = node.previousSibling; curNode; curNode = curNode.previousSibling) {
            if (curNode.nodeName == node.nodeName) {
                ++position;
            }
        }
        return position;
    };
    if (node instanceof Document) {
        return '/';
    }
    for (; node && !(node instanceof Document); node = node.nodeType == Node.ATTRIBUTE_NODE ? node.ownerElement : node.parentNode) {
        comp = comps[comps.length] = {};
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                comp.name = 'text()';
                break;
            case Node.ATTRIBUTE_NODE:
                comp.name = '@' + node.nodeName;
                break;
            case Node.PROCESSING_INSTRUCTION_NODE:
                comp.name = 'processing-instruction()';
                break;
            case Node.COMMENT_NODE:
                comp.name = 'comment()';
                break;
            case Node.ELEMENT_NODE:
                comp.name = node.nodeName;
                break;
        }
        comp.position = getPos(node);
    }
    for (var i = comps.length - 1; i >= 0; i--) {
        comp = comps[i];
        xpath += '/' + comp.name;
        if (comp.position != null) {
            xpath += '[' + comp.position + ']';
        }
    }
    return xpath;
}
