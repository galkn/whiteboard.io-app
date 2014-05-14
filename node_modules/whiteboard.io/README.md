Whiteboard.io
============

#####Collaborative canvas drawing using Socket.io #####

###How to use###

In your Node.js app back-end script:

```javascript
server.listen(8080);
require('whiteboard.io')(server);
```

whiteboard.io-client.js exists inside whiteboard.io/lib. copy it over to your client javascript directory and require it in your code:
```html
<script src="/javascripts/whiteboard.io-client.js" />
```

To enable Whiteboard.io, in your client application file:
```javascript
$(function() {
	$("#canvas").whiteboard();
});
```