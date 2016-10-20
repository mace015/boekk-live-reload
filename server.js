var io = require('socket.io')();
var mysql = require('mysql');

var port = 8000;

var active = {
	clients: new Object(),
	users: new Object()
};

Object.prototype.getKey = function(value){
	for(var key in this){
		if(this[key] == value){
			return key;
		}
	}
	return null;
};

io.on('connection', function(socket){

	console.log('New socket connection: ' + socket.id);
	active.clients[socket.id] = 0;

	socket.on('register', function(data){

		active.clients[socket.id] = data.id;

		activeKey = active.users.getKey(socket.id);

		if (activeKey !== null){
			delete active.users[activeKey];
		}

		active.users[data.id] = socket.id;

		console.log("Socket " + socket.id + " logged in as " + data.id);

		return socket.emit('register', { status: true });

	});

	socket.on('disconnect', function(){

		if (active.clients[socket.id] != 0){

			delete active.users[ active.clients[socket.id] ];

		}

		delete active.clients[socket.id];

	});

	socket.emit('connection', { status: true });

});

io.listen(port);

var connection = mysql.createConnection({
	host     : 'host',
	user     : 'user',
	password : 'password',
	database : 'database'
});
 
//connection.connect();

setTimeout(function(){

	connection.query('SELECT * FROM `events`', function(err, events) {

		if (err) throw err;

		rows.forEach(function(event){

			connected = active.clients.getKey(event.id_user);
			if (connected !== null){
				
				socket.emit('event:fired', { event: event.event });

			}

			connection.query('DELETE FROM `events` WHERE `id` = "' + event.id + '" LIMIT 1', function(err, result){

				if (err) throw err;

			});

		});

	});

}, 30000);

console.log("Live reload application has been started on port: " + port);