import { got } from '../gogetter.js';

import pkg from 'follow-redirects';
const http = pkg.http;
const https = pkg.https;

const unix = (date) => { return date.getTime() / 1000 };
const start = unix(new Date('2007.03.01'));

export const gettext = async (json, client) => {
	getTumblr(json, client);
	getWikipedia(json, client);
}

const tags = ['?'];

// get tumblr info
function getTumblr(json, client) {
	var time = Math.floor(Math.random() * (unix(new Date()) - start)) + start;
	var tag = tags[Math.floor(Math.random() * tags.length)];
	https.get({ host: 'api.tumblr.com', path: `/v2/tagged?tag=${tag}&before=${time}&limit=1&api_key=aCoaPWBdaJhpwqjwQYJ50wW02EgYjwVK2mmc3yBU0Gs8fHGLZ3` }, function (res) {
		var response = '';
		res.on('data', (chunk) => {
			response = response + chunk.toString();
		}).on('end', () => {
			var data = JSON.parse(response);
			if (data.response[0]) {
				json.tn = data.response[0].blog_name;
				json.ti = data.response[0].id;
				
				console.log(`https://${json.tn}.tumblr.com/post/${json.ti}`);
				got(json, client);
			}
			else{
				json.tn = '';
				json.ti = '';
			}
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}

// get wikipedia info
function getWikipedia(json, client) {
	http.get({ host: 'en.wikipedia.org', path: `/w/api.php?format=json&action=query&generator=random&grnnamespace=0&grnlimit=1` }, function (res) {
		var response = '';
		res.on('data', (chunk) => {
			response = response + chunk.toString();
		}).on('end', () => {
			var data = JSON.parse(response);
			json.wt = encodeURIComponent(data.query.pages[Object.keys(data.query.pages)[0]].title);
			
			console.log(`https://en.wikipedia.org/wiki/${json.wt}`);
			got(json, client);
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}