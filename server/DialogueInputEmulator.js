class DialogueInputEmulator {

	constructor(chatbot) {
		this.chatbot = chatbot;
	}

	tick() {

		const userName = "U1";
		const userSpeech = "I think it is London";
		this.chatbot.input(userName, userSpeech, chatbotSpeech => {
			console.log(chatbotSpeech);
		});

	}

}

module.exports = DialogueInputEmulator;
