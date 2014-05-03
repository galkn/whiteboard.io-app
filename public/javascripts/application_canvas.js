$(function() {
	
	var flags = {
		anchorStart: false,
		strokeWidth: 2,
		increaseWithTime: false
	};
	
	var socket = io.connect('http://localhost');
	var isDragged = false;
	var canvas = $("#canvas");
	var ctx = canvas.get(0).getContext("2d");
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0,0,canvas.width(),canvas.height());
	var drag_x, drag_y;
	var distance_in_x, distance_in_y;
	var fromX, fromY;
	var inTransit = false;
	var history = [];
	var undoneHistory = [];
	var currentLine, recordCurrentLine = false;
	
	function draw(data) {
		ctx.beginPath();
		ctx.moveTo(data.fromX,data.fromY);
		ctx.lineTo(data.toX,data.toY);
		ctx.lineCap = "round";
		ctx.lineWidth = data.strokeWidth;
		if(data.sessionid == socket.socket.sessionid) ctx.strokeStyle = "black";
		else ctx.strokeStyle = data._color;
		ctx.stroke();
	}
		
	socket.on("new user", function(color) {
		$("#users").append("<div class='user' style='background: "+ color +"'></div>");
	});
	
	socket.on("existing users", function(colors) {
		for(var i in colors) $("#users").append("<div class='user' style='background: "+ colors[i] +"'></div>");
	});
	
	socket.on("remove user", function(color) {
		$("#users .user[style*='"+color+"']").remove();
	});
	
	socket.on("resp", function(data) {
		if(!flags.anchorStart) {
			fromX = data.toX;
			fromY = data.toY;
		}
		window.inTransit = false;
		
		draw(data);
		
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
		$("#redo").attr("disabled", "disabled");
	});
	$(document).mousemove(function(e) {
		if(isDragged) {
			if(!window.inTransit) {
				e.preventDefault();

				var toX = e.pageX - canvas.offset().left;
				var toY = e.pageY - canvas.offset().top;
				
				socket.emit('draw', {strokeWidth: flags.strokeWidth, 
					fromX: fromX, fromY: fromY, toX: toX, toY: toY, 
					sessionid: socket.socket.sessionid});
				window.inTransit = true;
				
				if(flags.increaseWithTime) {
					if(flags.initWidth == null) {
						flags.initWidth = flags.strokeWidth;
					}
					flags.strokeWidth += 0.5;
				}
			}
		}
	});
	$(document).mouseup(function(e) {
		isDragged = false;
		if(flags.initWidth != null) {
			flags.strokeWidth = flags.initWidth;
			flags.initWidth = null;
		}
		recordCurrentLine = false;
		
		if(currentLine != null && currentLine.length > 0) {
			history.push(currentLine);
			$("#undo").removeAttr("disabled");
			currentLine = [];
		}
	});
	
	function dlCanvas() {
	    var dt = $("#canvas").get(0).toDataURL('image/png');
	    this.href = dt;
	};
	dl.addEventListener('click', dlCanvas, false);
	
	$("#undo").click(function() {
		if(history.length > 0) {
			ctx.canvas.width = ctx.canvas.width;
			undoneHistory.push(history.pop());
			for(var i in history) {
				for(var j in history[i]) {
					draw(history[i][j]);
				}
			}
			$("#redo").removeAttr("disabled");
			if(history.length == 0) {
				$("#undo").attr("disabled", "disabled");
			}
		}
		return false;
	});
	
	$("#redo").click(function() {
		if(undoneHistory.length > 0) {
			var segment = undoneHistory.pop();
			for(var i in segment) {
				draw(segment[i]);
			}
			history.push(segment);
		
			if(undoneHistory.length == 0) {
				$("#redo").attr("disabled", "disabled");
			}
		}
		return false;
	});
	
});