(function ( $ ) {
	
	$.fn.drawLine = function(data, socket) {
		var canvas = this;
		var ctx = canvas.get(0).getContext("2d");
		ctx.beginPath();
		ctx.moveTo(data.fromX,data.fromY);
		ctx.lineTo(data.toX,data.toY);
		ctx.lineCap = "round";
		ctx.lineWidth = data.strokeWidth;
		if(data.sessionid && data.sessionid == socket.socket.sessionid) ctx.strokeStyle = "black";
		else ctx.strokeStyle = data.color;
		ctx.stroke();
	}
 
    $.fn.whiteboard = function(options) {
        var settings = $.extend({
			anchorStart: false,
			strokeWidth: 2,
			increaseWithTime: false,
			backgroundColor: "#ffffff",
			undoBtn: "#undo",
			redoBtn: "#redo",
			downloadCanvasLink: ""
        }, options );

		var socket = io.connect('http://localhost');
		var isDragged = false;
		var canvas = this;
		var ctx = canvas.get(0).getContext("2d");
		if(settings.backgroundColor) {
			ctx.fillStyle = settings.backgroundColor;
			ctx.fillRect(0,0,canvas.width(),canvas.height());
		}
		var drag_x, drag_y;
		var distance_in_x, distance_in_y;
		var fromX, fromY;
		window.inTransit = false;
		var history = [];
		var undoneHistory = [];
		var currentLine, recordCurrentLine = false;
		
		socket.on("resp", function(data) {
			if(!settings.anchorStart) {
				fromX = data.toX;
				fromY = data.toY;
			}
			window.inTransit = false;

			canvas.drawLine(data, socket);

			if(recordCurrentLine) {
				currentLine.push(data);
			}
		});
		
		canvas.mousedown(function(e) {
			isDragged = true;
			fromX = e.pageX - canvas.offset().left;
			fromY = e.pageY - canvas.offset().top;
			currentLine = [];
			undoneHistory = [];
			recordCurrentLine = true;
			$(settings.redoBtn).addClass("disabled");
		});
		$(document).mousemove(function(e) {
			if(isDragged) {
				if(!window.inTransit) {
					e.preventDefault();

					var toX = e.pageX - canvas.offset().left;
					var toY = e.pageY - canvas.offset().top;

					socket.emit('drawLine', {strokeWidth: settings.strokeWidth, 
						fromX: fromX, fromY: fromY, toX: toX, toY: toY, 
						sessionid: socket.socket.sessionid});
					window.inTransit = true;

					if(settings.increaseWithTime) {
						if(settings.initWidth == null) {
							settings.initWidth = settings.strokeWidth;
						}
						settings.strokeWidth += 0.5;
					}
				}
			}
		});
		$(document).mouseup(function(e) {
			isDragged = false;
			if(settings.initWidth != null) {
				settings.strokeWidth = settings.initWidth;
				settings.initWidth = null;
			}
			recordCurrentLine = false;

			if(currentLine != null && currentLine.length > 0) {
				history.push(currentLine);
				$("#undo").removeClass("disabled");
				currentLine = [];
			}
		});
		
		$(settings.undoBtn).click(function() {
			if(history.length > 0) {
				ctx.canvas.width = ctx.canvas.width;
				undoneHistory.push(history.pop());
				for(var i in history) {
					for(var j in history[i]) {
						canvas.drawLine(history[i][j], socket);
					}
				}
				$(settings.redoBtn).removeClass("disabled");
				if(history.length == 0) {
					$(settings.undoBtn).addClass("disabled");
				}
			}
			return false;
		});

		$(settings.redoBtn).click(function() {
			if(undoneHistory.length > 0) {
				var segment = undoneHistory.pop();
				for(var i in segment) {
					canvas.drawLine(segment[i], socket);
				}
				history.push(segment);

				if(undoneHistory.length == 0) {
					$(settings.redoBtn).addClass("disabled");
				}
			}
			return false;
		});
		
		socket.on("new user", function(color) {
			$("#users").append("<div class='user' style='background: "+ color +"'></div>");
		});

		socket.on("existing users", function(colors) {
			for(var i in colors) $("#users").append("<div class='user' style='background: "+ colors[i] +"'></div>");
		});

		socket.on("remove user", function(color) {
			$("#users .user[style*='"+color+"']").remove();
		});
 
        return this;
    };
 
}( jQuery ));