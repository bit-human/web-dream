import express from 'express';
import bodyParser from 'body-parser';

import http from 'http';
import { websocket } from './postman.js';

import { goGet } from './gogetter.js';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.send('ping');
});

app.get('/retrieve', (req, res) => {
	console.log('GET request');
	res.setHeader('Access-Control-Allow-Origin', '*');
	goGet(req, res);
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

websocket(server);
