const DialogueManager = require("./DialogueManager");
const IntentRecogniser = require("./IntentRecogniser");

const { DEBUG_MODE } = require("./constants");
const { randomInt } = require("./functions");

class Chatbot {

	constructor() {

		this.dialogueManager = new DialogueManager();
		this.intentRecogniser = new IntentRecogniser();
		this.questionNumber = 0;
		this.setQuestion("easy", "general-knowledge");

	}

	setQuestion(difficulty, category) {
		const filepath = `../data/questions/${category}/${difficulty}`;
		const questions = require(filepath).questions;
		// const index = randomInt(0, questions.length - 1);
		const index = 0;
		this.question = questions[index];
		this.options = this.question["incorrect_answers"].concat(this.question["correct_answer"]);
	}

	input(userName, userSpeech, next) {

		const mentions = this.extractMentions(userSpeech);

		console.log(`${userName}: ${userSpeech}`);

		if (DEBUG_MODE) {
			console.log(`Mentions: ${mentions.join(", ") || "-"}`);
		}

		this.intentRecogniser.recogniseIntent(userName, userSpeech, intent => {
			this.dialogueManager.decideAction(userName, intent.name, action => {
				const chatbotSpeech = `Intent: ${intent.string}, Action: ${action.value}`;
				next(chatbotSpeech);
			})
		});

	}

	extractMentions(userSpeech) {
		const mentions = [];
		for (let option of this.options) {
			const index = userSpeech.indexOf(option);
			if (index !== -1) {
				mentions.push(option);
			}
		}
		return mentions;
	}

}

module.exports = Chatbot;
