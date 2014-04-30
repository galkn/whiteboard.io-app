$(function() {
	
	function plugin() {
		var socket = io.connect('http://localhost');
		window.st = socket;
		
		var data = {
			el: $("#circle"),
			
		}
		
		socket.emit('doSomething', data);
	}
	
	window.socket = io.connect('http://localhost');
	socket.on("resp", function(data) {
		window.inTransit = false;
		$(data.el).css({position: "fixed", top: data.y, left: data.x});
		console.log(DeepDiff.diff(window.mutated, $(data.el)));
	});
	
	var isDragged = false;
	var circle = $("#circle");
	var drag_x, drag_y;
	var distance_in_x, distance_in_y;
	window.inTransit = false;
	circle.mousedown(function(e) {
		isDragged = true;
		distance_in_x = e.pageX - circle.offset().left;
		distance_in_y = e.pageY - circle.offset().top;
	});
	$(document).mousemove(function(e) {
		if(isDragged) {
			if(!window.inTransit) {
				e.preventDefault();

				drag_x = e.pageX - distance_in_x;
				drag_y = e.pageY - distance_in_y;
				
				socket.emit('doSomething', {el: "#circle", x: drag_x, y: drag_y});
				window.inTransit = true;
			}
		}
	});
	$(document).mouseup(function(e) {
		isDragged = false;
	});
	
	
	// select the target node
	var target = document.querySelector('#circle');
window.mutated;
	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
	    //console.log(mutation);
		//console.log($(mutation.target).css("left"));
		window.mutated = mutation;
	  });    
	});

	// configuration of the observer:
	var config = { attributes: true, childList: true, characterData: true };

	// pass in the target node, as well as the observer options
	observer.observe(target, config);
	
	
});