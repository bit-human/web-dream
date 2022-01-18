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
			json.wt = encodeURIComponent(data.query.pages[Object.keys(data.query.pages)[0]].title);
			console.log(`https://en.wikipedia.org/wiki/${json.wt}`);
			got(json, client);
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}
