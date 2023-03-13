function handleEnterIntoGame(data) {
	USER = data.user;
	log(`You are User ${USER}`);
}

function handleDialogue(data) {
	log(`${data.user}: ${data.text}`);
}
