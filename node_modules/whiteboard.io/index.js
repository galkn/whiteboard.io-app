module.exports = function(server) {
	var io = require('socket.io').listen(server);
	
	function rand(min, max) {
	    return Math.floor(min + Math.random() * (max - min));
	}

	function getColor() {
	    var h = rand(1, 360);
	    var s = rand(40, 60);
	    var l = rand(40, 70);
	    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	}
	var users = [];

	io.sockets.on('connection', function (socket) {
		socket.on("drawLine", function(data) {
			data.color = users.filter(function( obj ) {
			    return obj.sessionid == data.sessionid;
			});
			data.color = data.color[0]["color"];
			io.sockets.emit("resp", data);
		});

		var color = getColor();
		users.push({color: color, sessionid: socket.id});
		socket.broadcast.emit("new user", color);

		var existingColors = [];
		for(var i in users) {
			if(users[i]["sessionid"] != socket.id) {
				existingColors.push(users[i]["color"]);
			}
		}
		socket.emit("existing users", existingColors);

		socket.on('disconnect', function() {
			users = users.filter(function( obj ) {
			    return obj.sessionid !== socket.id;
			});
			socket.broadcast.emit("remove user", color);
		});
	});
}