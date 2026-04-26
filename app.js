// Ip des Roboters
robotIp = '123.456.789.123';
// Port der TCP Verbindung. Ist identisch mit dem Port im UR-Script. Standard ist 30001.
tcpPort = 30001;
// Port der Node JS Serveranwendung. Notwendig für den Webclient Socket. Standard ist 3000
nodejsPort = 3000;
// Socket Name des Webclients
clientName = 'web-client';
// Socket Name des Roboters
robotName = 'robot';
// Clients Array (web-client und robot)
clients = [];

var express = require('express');
var path = require('path');
var app = express();
var net = require('net');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.origins('*:*');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

server.listen(nodejsPort, function () {
    console.log('Websocket Server hört auf Port 3000');
});

/**
 * Websocket für den Web-Client.
 */
io.sockets.on('connection', function (socket) {
    socket.name = clientName;
    clients.push(socket);

    // Falls der Roboter bereits verbunden ist, soll dies dem Webclient mitgeteilt werden.
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].name === robotName) {
            broadcastToWebclient('robot-running');
        }
    }

    socket.on('disconnect', function () {
        console.log(socket.name + ' hat die Verbindung abgebrochen.' + '\n');
        clients.splice(clients.indexOf(socket), 1);
    });

    socket.on('montage', function (modelIdentifier) {
        console.log('Montage gestartet mit dem modelIdentifier: ' + modelIdentifier + '.\n');
        broadcastToRobot(modelIdentifier);
    });
});

/**
 * TCP Server für die Verbindung mit dem UR5 Roboter.
 */
net.createServer(function (socket) {
    var i, robotSocket;

    socket.name = robotName;
    socket.setKeepAlive(true, 100);

    socket.on('error', function (err) {
        console.log('Error beim Connection Reset abgefangen: ');
        console.log(err.stack);
    });

    robotSocket = clients.find(function (ele) {
        return ele.name === robotName;
    });

    if (typeof robotSocket === 'undefined') {
        // Roboter Socket zu Clients hinzufügen, falls dieser dort noch nicht besteht.
        clients.push(socket);
        broadcastToWebclient('robot-running');
    }
    else {
        // Andernfalls den bestehenden Roboter Socket mit einer neueren Instanz ersetzen.
        for (i = 0; i < clients.length; i++) {
            if (clients[i].name === robotName) {
                clients[i] = socket;
                console.log('Roboter Socket Instanz aktualisiert');
                broadcastToWebclient('robot-running');
            }
        }
    }

    socket.on('data', function (data) {
        io.emit('message', {
            'type': 'status',
            'data': data.toString() // robot-working oder robot-finished
        });
    });

}).listen(tcpPort, function () {
    console.log('Roboter TCP Server hört auf Port: ' + tcpPort + '.\n');
});

/**
 * Eine Nachricht (z. B. modelIdentifier) an den Roboter senden.
 * @param message
 */
function broadcastToRobot(message) {
    clients.forEach(function (client) {
        if (client.name === 'robot') {
            client.write(message);
        }
    });
    console.log('Nachricht an Roboter: ' + message + '\n');
}

/**
 * Eine Nachricht (z. B. modelIdentifier) an den Web-Client senden.
 * @param message
 */
function broadcastToWebclient(message) {
    clients.forEach(function (client) {
        if (client.name === 'web-client') {
            io.emit('message', {
                'type': 'status',
                'data': message
            });
            console.log('Nachricht an Web-Client: ' + message + '\n');
        }
    });
}