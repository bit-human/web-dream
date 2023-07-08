import { got } from '../gogetter.js';

import pkg from 'follow-redirects';
const http = pkg.http;

// get freesound info
export const getmp3 = async (json, client) => {
	http.get({ host: 'freesound.org', path: '/browse/random/' }, function (res) {
		res.on("data", (chunk) => {
			var html, loc;
			if (json.au === undefined && (loc = (html = chunk.toString()).indexOf('og:audio"')) != -1) {
				assign(json, loc, html);
				console.log(`https://freesound.org/people/${json.au}/sounds/${json.si}`);
				got(json, client);
			}
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}

// assign json attributes
function assign(json, loc, html) {
	loc = loc + 'og:audio" content="https://freesound.orghttps://cdn.freesound.org/previews/'.length;
	var end = html.indexOf('/', loc);
	json.sb = html.substring(loc, end);
	
	loc = end + 1;
	end = html.indexOf('_', loc);
	json.si = html.substring(loc, end);
	
	loc = end + 1;
	end = html.indexOf('-', loc);
	json.ss = html.substring(loc, end);
	
	loc = end + '-lq.mp3" />|    <meta property="og:audio:artist" content="'.length;
	end = html.indexOf('"', loc);
	json.au = encodeURIComponent(html.substring(loc, end));
}
