import { got } from '../gogetter.js';

import pkg from 'follow-redirects';
const http = pkg.http;

// get wikipedia info
export const gettext = async (json, client) => {
	http.get({ host: 'en.wikipedia.org', path: `/w/api.php?format=json&action=query&generator=random&grnnamespace=0&grnlimit=1` }, function (res) {
		var response = '';
		res.on('data', (chunk) => {
			response = response + chunk.toString();
		}).on('end', () => {
			var data = JSON.parse(response);
			var title = encodeURIComponent(data.query.pages[Object.keys(data.query.pages)[0]].title);
			secondCall(title, json, data, client);
//			json.wt = encodeURIComponent(data.query.pages[Object.keys(data.query.pages)[0]].title);
//			console.log(`https://en.wikipedia.org/wiki/${json.wt}`);
//			got(json, client);
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}

function secondCall(title, json, data, client) {
	request(`/w/api.php?action=parse&page=${title}&format=json`, (data) => {
		json.wt = title;
		json.tx = data.parse.text['*'];
		console.log(`https://en.wikipedia.org/wiki/${json.wt}`);
		got(json, client);
	});
}

function request(path, callback) {
	http.get({ host: 'en.wikipedia.org', path: path }, function (res) {
		var response = '';
		res.on('data', (chunk) => {
			response = response + chunk.toString();
		}).on('end', () => {
			callback(JSON.parse(response));
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}
