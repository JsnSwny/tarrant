// make an API post and handle the JSON response
function postMethodFetch(data, uri, next) {
	fetch(uri, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((response) => next(response));
}

function element(id) {
	return document.getElementById(id);
}

// Note: This function is used only in the test page
function submit(apiName) {
	const DOMAIN_NAME = `137.195.118.51:5000`;
	const value = element(apiName + "-input").value;
	const target = DOMAIN_NAME + "api/" + apiName;
	console.log("Submitting " + target);
	postMethodFetch({ value }, target, (response) => {
		console.log(response);
		const elem = element(apiName + "-response");
		elem.innerHTML = elem.innerHTML + `<p>${response.value}</p>`;
	});
}

function sendSpeech() {
	const speech = element("dialogue-input").value;
	socket.emit("say", speech);
}

function log(text) {
	LOG_ELEMENT.innerHTML = LOG_ELEMENT.innerHTML + `<p>${text}</p>`;
}

const SERVER_URI = "localhost:5000";

function hearSpeech(serial) {
	const elem = document.getElementById("host-audio");
	setTimeout(() => {
		elem.src = `http://${SERVER_URI}/audios/${serial}.mp3`;
		elem.play();
	}, 2000);
}
