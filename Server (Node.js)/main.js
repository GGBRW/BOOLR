const http = require('http');
const server = require('websocket').server;

const socket = new server({
    httpServer: http.createServer().listen(3000)
});

socket.on('request', function(request) {
    const connection = request.accept(null, request.origin);

    connection.on("message", function(message) {
        console.log(message.utf8Data);
    });

    connection.on('close', function(connection) {
        console.log('connection closed');
    });
});

console.log("Server is running...");


