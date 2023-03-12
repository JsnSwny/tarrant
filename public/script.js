// const DOMAIN_NAME = "http://localhost:5000/";

const socket = io("ws://localhost:5000");

socket.on("connect", () => {
	console.log("I'm playing");

	socket.on("enter-into-game", data => {
		console.log("Entered into game");
		console.log(data);
	});

});

// make an API post and handle the JSON response
function postMethodFetch(data, uri, next) {
    fetch(uri, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(response => next(response));
}

function element(id) {
    return document.getElementById(id);
}

// Note: This function is used only in the test page
function submit(apiName) {
    const DOMAIN_NAME = "http://localhost:5000/";
    const value = element(apiName + "-input").value;
    const target = DOMAIN_NAME + "api/" + apiName;
    console.log("Submitting " + target);
    postMethodFetch({ value }, target, response => {
        console.log(response);
        const elem = element(apiName + "-response");
        elem.innerHTML = elem.innerHTML + `<p>${response.value}</p>`;
    });
}

function sendSpeech() {
	const speech = element("dialogue-input").value;
	socket.emit("say", speech);
}
