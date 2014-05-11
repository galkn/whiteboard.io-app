var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');

var routes = require('./routes/index');
var users = require('./routes/users');

var app    = express()
  , http   = require('http')
  , server = http.createServer(app)
  , io     = require('socket.io').listen(server);
server.listen(8080);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

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
