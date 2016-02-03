exports = module.exports = function (ws, request_queued_array) {
    var attempts = 1;
    ws.onopen = function () {
        console.log("WebSocket Server Is Now Connected!");
        if (request_queued_array) {
            console.log("Sending Queued Data To WebSocket Server!");
            request_queued_array.forEach(function (value, index, array) {
                if (value) {
                    console.log("Resending request number:" + index, value);
                    createWebSocket(data);
                }
            })
        }
    };

    ws.onclose = function () {
        console.log("WebSocket.js Connection was closed");
        if (attempts >= 30) {
            console.log("attempts is equal to:", attempts);
            attempts = 1;
        }
        var waitTime = Math.random() * attempts++ * 1000;
        console.log("WebSocket.js Reconnecting..." + waitTime);
        reconnectTimer = setTimeout(function () {
            createWebSocket();
        }, waitTime);
    };
};