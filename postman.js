import { WebSocketServer } from 'ws';

var connected;

export const websocket = (server) => {
	var wss = new WebSocketServer({ server: server, path: "/websocket" });
	
	wss.on('connection', function connection(ws, req) {
		
		var ip = req.headers['x-forwarded-for'].split(', ')[0] || req.socket.remoteAddress.split(':')[2];
		
	    ws.on('message', function(message) {
			if (message.toString() == '')
				setTimeout(() => { ws.send(''); }, 50000);
			else
				wss.broadcast(`${ip}: ${message.toString()}`);
	    });
	    ws.on('close', () => wss.broadcast(`${ip} is disconnected`));
	    
		wss.broadcast(`${ip} is connected`);
	});
	
	wss.broadcast = function broadcast(msg) {
	   console.log(msg);
	   
	   wss.clients.forEach(function each(client) {
	       client.send(msg);
	    });
	};
}
