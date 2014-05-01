$(function() {
	
	window.socket = io.connect('http://localhost');
	socket.on("resp", function(data) {		
		console.log(data);
		$("#" + data._id).attr("style", data._style);
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
			e.preventDefault();

			drag_x = e.pageX - distance_in_x;
			drag_y = e.pageY - distance_in_y;
			
			circle.css({position: "fixed", top: drag_y, left: drag_x});
		}
	});
	$(document).mouseup(function(e) {
		isDragged = false;
	});
	//socket.emit('doSomething', {el: "#circle", x: drag_x, y: drag_y});
	
	
	// select the target node
	var target = circle.get(0);
	window.mutatedCircle;
	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
	  mutations.forEach(function(mutation) {
		//window.mutated = mutation;
		//window.mutatedCircle = mutation.target;
		socket.emit('doSomething', {_id: mutation.target.id, _style: $(mutation.target).attr('style')});
	  });    
	});

	// configuration of the observer:
	var config = { attributes: true, childList: true, characterData: true };

	// pass in the target node, as well as the observer options
	observer.observe(target, config);
	
});