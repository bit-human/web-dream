import { getmp3 } from './getters/getmp3.js';
import { getimage } from './getters/getimage.js';
import { gettext } from './getters/gettext.js';

export const goGet = async (req, res) => {
	var json = {};
	getimage(json, res);
	getmp3(json, res);
	gettext(json, res);
}

export const got = (json, res) => {
	if (json.au !== undefined && json.ow !== undefined && json.wt !== undefined) {
		res.send(json);
		console.log(JSON.stringify(json));
	}
}
