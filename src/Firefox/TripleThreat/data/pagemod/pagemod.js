var pw = self.port;

var outgoing_data = {
    message: "client_requesting_server_activation"
    , hostname: null
    , username: null
    , fingerprint: null
    , email: null
    , url: null
    , server_insertion_time: null
    , client_creation_time: null
    , payload: {
        master_object: {}
        , xpath_object: {}
        , xpath: {}
    },
    status: "main.js is requesting server activation"
};

//pw.emit('pagemod_to_ws', outgoing_data);
