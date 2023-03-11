const DialogueManager = require("./DialogueManager");
const IntentRecogniser = require("./IntentRecogniser");

class Chatbot {

	constructor() {

		this.dialogueManager = new DialogueManager();
		this.intentRecogniser = new IntentRecogniser();

	}

	input(userName, userSpeech, next) {

		console.log(`${userName}: ${userSpeech}`);
		this.intentRecogniser.recogniseIntent(userName, userSpeech, intent => {
			this.dialogueManager.decideAction(userName, intent.name, action => {
				const chatbotSpeech = `Intent: ${intent.string}, Action: ${action.value}`;
				next(chatbotSpeech);
			})
		});

	}

}

module.exports = Chatbot;
