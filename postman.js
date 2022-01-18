import { WebSocketServer } from 'ws';

export const websocket = (server) => {
	var wss = new WebSocketServer({ server: server, path: "/websocket" });
	
	wss.on('connection', function connection(ws) {
		var ip = ws._socket.remoteAddress;
		
	    ws.on('message', function(message) {
			if (message.toString() == '')
				setTimeout(() => { ws.send(''); }, 25000);
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
