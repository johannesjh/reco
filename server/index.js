var staticHttp = require('node-static');
var x=0;
var fileServer = new (staticHttp.Server)('./client', {
    cache: false,
    headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
});

var simpleUserHash = 0;

var app = require('http').createServer(function (request, response) {
    request.addListener('end',function () {
        fileServer.serve(request, response);
    }).resume();
});

app.listen(8080);

var io = require('socket.io').listen(app);

var CSS = {
    0: "user-one",
    1: "user-two",
    2: "user-three",
    3: "user-four",
    4: "user-five",
    5: "user-six"
};

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
    socket.emit('info', {'state': 'new', 'user': 'user' + simpleUserHash++, 'css': CSS[simpleUserHash % 6]});

    socket.on('update', function (data) {
        socket.broadcast.emit('update', data);
    });

    socket.on('lock', function (data) {
        socket.broadcast.emit('lock', data);
    });

    socket.on('unlock', function (data) {
        socket.broadcast.emit('unlock', data);
    });
    
    socket.on('scroll', function (data) {
		
		if(data!=x){
        
        socket.broadcast.emit('scroll', data);
		x=data;
		}
		else return;
    });

});

console.log("You can now open http://localhost:8080/ in your webbrowser...");
