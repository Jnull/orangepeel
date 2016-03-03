function isElementVisible(el) {
    var rect     = el.getBoundingClientRect(),
        vWidth   = window.innerWidth || doc.documentElement.clientWidth,
        vHeight  = window.innerHeight || doc.documentElement.clientHeight,
        efp      = function (x, y) { return document.elementFromPoint(x, y) };

    // Return false if it's not in the viewport
    if (rect.right < 0 || rect.bottom < 0
        || rect.left > vWidth || rect.top > vHeight)
        return false;

    // Return true if any of its four corners are visible
    return (
    el.contains(efp(rect.left,  rect.top))
    ||  el.contains(efp(rect.right, rect.top))
    ||  el.contains(efp(rect.right, rect.bottom))
    ||  el.contains(efp(rect.left,  rect.bottom))
    );
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

function log(msg, color) {
    color = color || "black";
    bgc = "White";
    switch (color) {
        case "success":
            color = "Green";
            bgc = "LimeGreen";
            break;
        case "info":
            color = "DodgerBlue";
            bgc = "Turquoise";
            break;
        case "error":
            color = "Red";
            bgc = "Black";
            break;
        case "start":
            color = "OliveDrab";
            bgc = "PaleGreen";
            break;
        case "warning":
            color = "Tomato";
            bgc = "Black";
            break;
        case "end":
            color = "Orchid";
            bgc = "MediumVioletRed";
            break;
        default:
            color = color;
    }

    if (typeof msg == "object") {
        console.log(msg);
    } else if (typeof color == "object") {
        console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
        console.log(color);
    } else {
        console.log("%c" + msg, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");
    }
}

var get_time_int = function (uuid_str) {
//var date_obj = get_date_obj(  '8bf1aeb8-6b5b-11e4-95c0-001dba68c1f2' );
//date_obj.toLocaleString( );// '11/13/2014, 9:06:06 PM'

    /*  Example UUID Parse or gen?
     get_date_obj = function (uuid_str) {
     var int_time = this.get_time_int( uuid_str ) - 122192928000000000,
     int_millisec = Math.floor( int_time / 10000 );
     return new Date( int_millisec );
     };
     */

    var uuid_arr = uuid_str.split('-'),
        time_str = [
            uuid_arr[2].substring(1),
            uuid_arr[1],
            uuid_arr[0]
        ].join('');
    return parseInt(itme_str, 16);
};

function invert_background(element) {
    element_styles = window.getComputedStyle(element);
    element_backgroundcolor = element_styles.backgroundColor;
    element_parse_backgroundcolor = element_backgroundcolor.match(/\d+/g);
    /* [red, green, blue] */
    x_element_calc_backgroundcolor = element_parse_backgroundcolor.map(function (ch) {
        return 255 - ch;
    });
    /* [255 - red, 255 - green, 255 - blue] */
    x_element_inverted_backgroundcolor = 'rgb(' + x_element_calc_backgroundcolor.join(', ') + ')';
    element.style.backgroundColor = x_element_inverted_backgroundcolor;
}

function invert_color(element) {
    element_styles = window.getComputedStyle(element);
    element_color = element_styles.color;
    element_parse_color = element_color.match(/\d+/g);
    /* [red, green, blue] */
    x_element_calc_color = element_parse_color.map(function (ch) {
        return 255 - ch;
    });
    /* [255 - red, 255 - green, 255 - blue] */
    x_element_inverted_color = 'rgb(' + x_element_calc_color.join(', ') + ')';
    element.style.color = x_element_inverted_color;
}