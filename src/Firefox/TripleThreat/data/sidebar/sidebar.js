/**
 * Created by Administrator on 3/6/2015.
 */


/* Test Data Array
 data = [
 {        "title": "a",        "author": "Name1 Surname1"    },
 {        "title": "b",        "author": "Name2 Surname2"    },
 {        "title": "c",        "author": "Name3 Surname3"    },
 {        "title": "e",        "author": "Name4 Surname4"    }
 ];
 */

//Admin Section
var Admin_Refresh_All_Remote_User_pages = document.getElementById('Admin_Refresh_All_Remote_User_pages');
var Admin_Start_All_Remote_Cameras = document.getElementById('Admin_Start_All_Remote_Cameras');

//User Section
var newRoomName = document.getElementById('New_Room_Name');
var newRoomButton = document.getElementById('New_Room_Create');

//Chat Section
var chatter_client_number = Math.floor((Math.random() * 100) + 1);
var chatter_message_box = document.getElementById('all_chat_messages_list');
var chatter_box_message_input_text = document.getElementById('chat_box_message_place_input_text');
var chatter_box_message_input_send = document.getElementById('chat_box_message_input_button');

var aPC = [], bPC = []; //a & b PeerConnection_Array.
var aPC_Index, bPC_Index; //a & b PeerConnection_Index
var aDC = [], bDC = []; //a & b DataChannel_Array.
var aDC_Index = [], bDC_Index = []; //a & b DataChannel_Index.
var Create_P = document.createElement("p");

addon.port.on('to_sidebar', function (incoming_data) {

    if (typeof incoming_data === 'string') {
        incoming_data = JSON.parse(incoming_data);
        if (typeof incoming_data === 'object') {
          //  console.log("Incoming client message to server is a valid string converted to an object");
        } else {
            console.log("Something is wrong with the incoming message conversion from string to object");
            return;
        }
    }

    if (!incoming_data.payload) {
        incoming_data.payload = {};
    }

    if (!incoming_data.payload.xpath) {
        incoming_data.payload.xpath = {}
    }

    var message = incoming_data.message || null
        , hostname = incoming_data.hostname || null
        , fp = incoming_data.fingerprint || null
        , username = incoming_data.username || null
        , email = incoming_data.email
        , url = incoming_data.url || null
        , server_insertion_time = server_insertion_time || null
        , client_creation_time = client_creation_time || null
        , master_object = incoming_data.payload.master_object || null
        , xpath = incoming_data.payload.xpath || null
        , xpath_object = incoming_data.payload.xpath_object || ['']
        , send_to_peer_side = incoming_data.send_to_peer_side || ''
        , status = incoming_data.status || null
        , chat_message = incoming_data.payload.message || null
        , chat_to = incoming_data.payload.to || null
        , chat_from = incoming_data.payload.from || null;

    switch (message) {
        case "server_responding_chat_message":
            console.log('sidebar.js - incoming data', incoming_data);
            var x = document.createElement("p");
            x.innerHTML = "[" + new Date().getHours() + ":" + new Date().getMinutes() + "]" + " * " + chat_from + ": " + chat_message;
            chatter_message_box.appendChild(x);
            chatter_message_box.scrollTop = chatter_message_box.scrollHeight;

            break;
        default:
            console.log("sidebar.js - no message found for:\""+ message + "\"");
            break;
    }


});


function message_out(e) {
    if (chatter_box_message_input_text.value) {

        var MessageText = chatter_box_message_input_text.value;
  /*      console.log("sidebar.js - sending out new message:", e.target.value);
        var New_PE = document.createElement("p");
        New_PE.innerHTML = "[" + new Date().getHours() + ":" + new Date().getMinutes() + "]" + " * " + "ClientB" + chatter_client_number + ": " + MessageText;
        chatter_message_box.appendChild(New_PE);

      */
        chatter_box_message_input_text.value = "";

        chatter_message_box.scrollTop = chatter_message_box.scrollHeight; //PUT AT BOTTOM!!<<----

        var sending_message = {
            message: "client_sending_chat_message"
            //  , hostname: domain
            //  , username: null
            //  , fingerprint: fingerprint
            //  , email: null
            //  , url: url
            //  , server_insertion_time: null
            //  , client_creation_time: new Date()
            , payload: {
                to: 'all'
                , from: 'Client' + chatter_client_number
                , message: MessageText
            },
            status: "Client is sending a chatmessage out"
        };

        addon.port.emit("sidebar_to_websocket", sending_message);
    }
}


chatter_box_message_input_text.addEventListener("keydown", function (e) {
//e.preventDefault();
    if (e.keyCode === 13) {
        message_out(e);
    }
}, false);

chatter_box_message_input_send.addEventListener("click", message_out, false);




//user listener events
newRoomButton.addEventListener('click', function (e) {
    e.preventDefault();
    Bootstrap_Main(newRoomName.value);
}, false);

//admin listener events
Admin_Refresh_All_Remote_User_pages.addEventListener("click", function (e) {
    e.preventDefault();
    // socket.emit("RefreshALLPages",{room: newRoomName.value});
    location.reload(true);  //true forces a complete reload!
});

Admin_Start_All_Remote_Cameras.addEventListener("click", function (e) {
    e.preventDefault();
    // socket.emit("StartAllUserCameras", {room: newRoomName.value});
    Bootstrap_Main(newRoomName.value);
});

//admin functions
/*
 socket.on('AdminRequestRefreshAllPages', function(data){
 console.log('Admin is Refreshing Pages!');
 location.reload(true);
 top.location.reload(true);
 });

 socket.on('AdminRequestStartAllUserCameras', function(data){
 console.log('Admin Started All Cameras!');
 // Bootstrap_Main(PageMod_CurrentURL);
 });
 */

var chat_file_list_parent = document.getElementById("chat_file_list");

//files handling:
function handleFiles(files) {
    console.log(files.length);
    for (var i = 0, numFiles = files.length; i < numFiles; i++) {
        var file = files[i];
        var xxx = document.createElement("li");
        xxx.innerHTML = files[i].name;
        chat_file_list_parent.appendChild(xxx);
        console.log('File Name: ' + files[i].name + ' - File Size: ' + files[i].size + ' - File Type: ' + files[i].type)
    }
}


var dropbox;

dropbox = document.getElementById("dropbox");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);


function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;
    var files = dt.files;
    prompt();
    handleFiles(files);
}



function append_to_page_and_master_array(append_this_text) {
    var newListItem = document.createElement("li");       // Create a <li> node
    var textnode = document.createTextNode(append_this_text + "\n\r");
    newListItem.appendChild(textnode);
    data.push({"title": append_this_text}); //array
    var list = document.getElementById("connection_list");    // Get the <ul> element to insert a new node
    list.insertBefore(newListItem, list.childNodes[0]);  // Insert <li> before the first child of <ul>
}

addon.port.on("User_Selection", function (user_selection) {
    data = [];
    var dos = data.map(function (yitem, yindex, yarray) {
        return yitem.title;
    });
    var resultsSplit = user_selection.split(" ");
    resultsSplit.map(function (xitem, xindex, xarray) {
        xitem = xitem.trim();
        if (dos.indexOf(xitem) == -1) {
            var newListItem = document.createElement("li");       // Create a <li> node
            var textnode = document.createTextNode(xitem + "\n\r");
            newListItem.appendChild(textnode);
            data.push({"title": xitem}); //array
            var list = document.getElementById("connection_list");    // Get the <ul> element to insert a new node
            list.insertBefore(newListItem, list.childNodes[0]);  // Insert <li> before the first child of <ul>
        }
    });
});

// Download
function Export_CVS() {
// prepare CSV data
    var csvData = [];
    csvData.push('"Your The Best Around"'); //,"Author"');
    data.forEach(function (item, index, array) {
        csvData.push('"' + item.title + '"'); // ,"' + item.author + '"');
    });

// download stuff
    var fileName = "data.csv";
    var buffer = csvData.join("\n");
    var blob = new Blob([buffer], {
        "type": "text/csv;charset=utf8;"
    });

    saveFile(blob);


    function saveFile(blob) {
        var link = document.createElement('a');
        link.preventDefault();
        link.href = window.URL.createObjectURL(blob);
        link.download = 'FileName.csv';
        link.click();
    }


    /*
     var frame = document.createElement("iframe");
     frame.setAttribute("src", window.URL.createObjectURL(blob));
     frame.setAttribute("width", 1);
     frame.setAttribute("height", 1);
     frame.setAttribute("frameborder", 0);
     frame.setAttribute("download", fileName);
     document.body.appendChild(frame);
     */
}


