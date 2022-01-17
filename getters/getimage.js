import { got } from '../gogetter.js';

import Flickr from 'flickr-sdk';
const apiKey = '7263a42ae5633ab98f85cb019413d92a';

const unix = (date) => { return date.getTime() / 1000 };
const start = unix(new Date('2005.01.01'));

// get flickr info
export const getimage = async (json, client) => {
	new Flickr(apiKey).photos.search({
		'per_page': 1,
		'media': 'photos',
		'max_upload_date': Math.random() * (unix(new Date()) - start) + start
	}).then((res) => {
		assign(json, res.body.photos.photo[0]);
		console.log(`https://www.flickr.com/photos/${json.ow}/${json.pi}`);
		got(json, client);
	}).catch((err) => {
		console.error(`Got error: ${err}`);
		if (err.name == 'TypeError')
			getimage(json, client);
	});
}

// assign json attributes
function assign(json, photo) {
	json.fr = photo.farm;
	json.sr = photo.server;
	json.pi = photo.id;
	json.sc = photo.secret;
	json.ow = photo.owner;
}
