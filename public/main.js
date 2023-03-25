// const DOMAIN_NAME = "http://localhost:5000/";

const socket = io(SOCKETS_URI);

socket.on("connect", () => {
    console.log(`Connected to ${SOCKETS_URI}.`);

    socket.on("enter-into-game", handleEnterIntoGame);
    socket.on("dialogue", handleDialogue);
});

setTimeout(() => {
	hearSpeech("77b824a4-d3ba-40a2-bc31-94b963e45049");
}, 5000);
