var serverURL = "https://web-dream-server.herokuapp.com";
const socketURL = serverURL.replace(/^http/, 'ws') + '/websocket';

const sPageURL = split(window.location.search.substring(1), /\\?/i, 2);

var loaded = [false, false];
var bgColor, flickr, wikipedia, freesound;
	
image.addEventListener('load', () => {
	loaded[0] = true;
	display();
});

var fileText;

// create and set download button link
function createFile() {
	window.URL.revokeObjectURL(download.href);
	download.href = window.URL.createObjectURL(new Blob([fileText + '\n' + date() + chat.innerHTML], { type: 'text/plain' }));
}

// create websocket
var webSocket = new WebSocket(socketURL);

webSocket.onopen = () => { webSocket.send(''); }

webSocket.onmessage = (messageEvent) => {
	if (messageEvent.data == '') {
		setTimeout(() => { webSocket.send(''); }, 50000);
//		console.log('ping ' + new Date().getTime());
	}
	else
		updateChat(messageEvent.data);
};

webSocket.onclose = () => { updateChat('disconnected ' + new Date().getTime()); }

// on form submit
form.addEventListener('submit', (event) => {
	event.preventDefault();

	var message = field.value;
	form.reset();

	if (webSocket.readyState == 1)
		webSocket.send(message);
});

function updateChat(message) {
	chat.innerHTML = chat.innerHTML + '\n' + message;
	console.log(message);
	
	createFile();
}

// when loading from url
if (sPageURL[2] != '') {
	if (sPageURL[2] == 'new')
		nextClick();
	else {
		var json = {};
		
		// get data from url arguments
		split(sPageURL[2], /&/i, 12).forEach(arg => {
			var keyVal = split(arg, /=/i, 1);
			json[keyVal[0]] = keyVal[1];
		});
	
		// convert hex string to rgb array
		var hex = json.co;
		json.co = [];
		for (i = 0; i < 3; i++)
			json.co[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
	
		createPage(json);
	}
}

// on door click
function nextClick() {
	title.innerHTML = "Please wait...";

	// hide buttons
	next.style.display = 'none';
	loading.style.display = 'block';

	// hide elements
	audio.pause();
	panel.style.display = 'none';
	document.body.style.color = '#fff';
	document.body.style.backgroundColor = '#000';
	field.style.color = '#fff';
	
	image.src = "";
	text.innerHTML = "";
	
	// make http get request to server
	$.ajax({
		url: serverURL + '/retrieve',
		type: 'GET',
		success: (json) => {
			// generate random rgb array
			json.co = [];
			for (i = 0; i < 3; i++)
				json.co[i] = Math.floor(Math.random() * 256);
	
			createPage(json);
		}
	}).fail(() => {
		title.innerHTML = "Failed to connect";
	});
}

// attempt to play audio
function playAudio() {
	if (!audio.muted)
		audio.play().then(() => {}).catch(changeMute);
}

// on speaker click
function muteClick() {
	audio.play().then(changeMute).catch(() => {});
}

// change mute status
function changeMute() {
	audio.muted = !audio.muted;
	mute.src = `images/${audio.muted ? "muted":"speaker"}.gif`;
	audio.defaultMuted = !audio.defaultMuted;
}

// on load or on server response to door click
function createPage(json) {
	title.innerHTML = "Web Dream";

	// set page elements
	image.src = `https://farm${json.fr}.staticflickr.com/${json.sr}/${json.pi}_${json.sc}_b.jpg`;

	source.src = `https://freesound.org/data/previews/${json.sb}/${json.si}_${json.ss}-lq.mp3`;
	audio.load();
	audio.volume = .5;
	
	// create source links
	flickr = `https://www.flickr.com/photos/${json.ow}/${json.pi}`;
	wikipedia = `https://en.wikipedia.org/wiki/${json.wt}`;
	freesound = `https://freesound.org/people/${json.au}/sounds/${json.si}/`;
	
	getText(json);

	// convert rgb array to hex string
	var rgb = json.co;
	json.co = '';
	for (var i = 0; i < 3; i++)
		json.co = json.co + ('00'+rgb[i].toString(16)).slice(-2);
	
	bgColor = json.co;

	// create share link
    share.href = sPageURL[0] + '?';
	Object.keys(json).forEach(arg => {
		share.href = share.href + `${arg}=${json[arg]}&`;
	})
	share.href = share.href.substring(0, share.href.length-1);

	// create file download
	fileText = share.href + '\n' + `${rgb[0]}, ${rgb[1]}, ${rgb[2]}` + '\n' + flickr + `\n` + wikipedia + '\n' + freesound;
	download.download = 'Dream ' + rgb[0] + rgb[1] + rgb[2] + '.txt';
	createFile();

	// determine black or white text color
	textColor = blackorwhite(rgb);
}

function display() {
	if (loaded[0] && loaded[1]) {
		field.style.color = textColor;
		document.body.style.color = textColor;
		
		// display elements
		document.body.style.background = '#' + bgColor;
		panel.style.display = 'block';
		playAudio();
	
		// display buttons
		loading.style.display = 'none';
		next.style.display = 'block';
		
		loaded = [false, false];

		console.log(share.href);
		console.log(flickr);
		console.log(wikipedia);
		console.log(freesound);
	}
}

// get text from wikipedia
function getText(json) {
	$.ajax({
		url: `https://en.wikipedia.org/w/api.php?action=parse&page=${json.wt}&format=json`,
		type: 'GET',
	    dataType: 'jsonp',
		success: (data) => {
			text.innerHTML = text.innerHTML + processArticle(data.parse.text['*']);
			loaded[1] = true;
			display();
		}
	}).fail(() => {
		text.innerHTML = text.innerHTML + `<a href="${wikipedia}">${wikipedia}</a>\n`;
	});
}

// process wikipedia article
function processArticle(text) {
	var article = ''
	
	// remove everything except paragraphs
	var index = text.indexOf("<p>");
	var list = text.indexOf("<ul>")
	while (index != -1) {
		var end = text.indexOf("</p>", index) + "</p>".length;
		article = isolate(text.substring(index, end), article);
		index = text.indexOf("<p>", end);
		
		// add lists
		if (list != -1 && list < index) {
			end = text.indexOf("</ul>", list) + "</ul>".length;
			article = isolate(text.substring(list, end), article);
			list = text.indexOf("<ul>", end);
		}
	}
	
	// add lists
	if (list != -1) {
		var end = text.indexOf("</ul>", list) + "</ul>".length;
		article = isolate(text.substring(list, end), article);
		list = text.indexOf("<ul>", end);
	}
	
	return article;
}

function isolate(paragraph, article) {
	// remove any link references
	var start = 0;
	var ref = paragraph.indexOf("<a");
	while (ref != -1) {
		article = article + paragraph.substring(start, ref);
		start = paragraph.indexOf(">", ref) + 1;
		ref = paragraph.indexOf("</a", start);
		
		article = article + paragraph.substring(start, ref);
		start = paragraph.indexOf(">", ref) + 1;
		ref = paragraph.indexOf("<a", start);
	}
	
	return article + paragraph.substring(start);
}

// determine black or white text based on background
function blackorwhite(rgb) {
	var l = [];
	for (i = 0; i < 3; i++) {
		l[i] = rgb[i] / 255.0;
		l[i] = l[i] <= 0.03928 ? l[i] / 12.92 : ((l[i] + 0.055) / 1.055) ** 2.4;
	}

	return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2] > 0.179 ? '#000' : '#fff';
}

//return formatted date
function date() {
	const digits = (num) => { return num.toLocaleString('en-US', { minimumIntegerDigits: 2 }); }
	var date = new Date();
	return `${date.getFullYear()}-${digits(date.getMonth() + 1)}-${digits(date.getDate())} ${digits(date.getHours())}:${digits(date.getMinutes())}:${digits(date.getSeconds())}.${date.getMilliseconds()}`;
}

// creates limit number of splits by regexp separator
function split(input, separator, limit) {
	separator = new RegExp(separator, 'g');

	const output = [];
	let finalIndex = 0;

	while (limit--) {
		const lastIndex = separator.lastIndex;
		const search = separator.exec(input);

		if (search === null)
			break;

		finalIndex = separator.lastIndex;
		output.push(input.slice(lastIndex, search.index));
	}

	output.push(input.slice(finalIndex));

	return output;
}
