const DialogueManager = require("./DialogueManager");
const IntentRecogniser = require("./IntentRecogniser");

const { DEBUG_MODE } = require("./constants");
const { randomElement, randomInt, timeElapsed } = require("./functions");

class Chatbot {

	constructor(outputTarget) {

		this.outputTarget = outputTarget;
		this.paused = true;
		this.flow = require("../data/chatbot/flow");
		this.actions = require("../data/chatbot/nlg");
		this.intentResponses = require("../data/chatbot/intent_responses");
		this.dialogueManager = new DialogueManager();
		this.intentRecogniser = new IntentRecogniser();
		this.questionNumber = 0;
		this.currentPrize = 0;
		this.changeState("next-question");
		this.answerSuggested = "";
		this.lastTimestamp = Math.floor(Date.now() / 1000);
		this.intentsDecided = 0;
		this.intentsChanged = 0;

	}

	nextQuestion() {
		this.setQuestion("easy", "general-knowledge");
		this.questionNumber++;
		this.currentPrize += 250;
	}

	changeState(state) {
		console.log(`\n===== ${state} =====`);
		this.state = state;
		const flowConfig = this.flow[this.state];
		eval(flowConfig.EXEC);
	}

	utter(action, args = []) {
		let speech = this.nlg(action, args);
		this.say(speech)
	}

	setQuestion(difficulty, category) {
		const filepath = `../data/questions/${category}/${difficulty}`;
		const questions = require(filepath).questions;
		// const index = randomInt(0, questions.length - 1);
		const index = 0;
		this.question = questions[index];
		this.options = this.question["incorrect_answers"].concat(this.question["correct_answer"]);
	}

	tick() {
		let action = this.decideFinalAction("do nothing");
		this.utter(action, action.args);
	}

	input(userName, userSpeech) {

		this.lastTimestamp = Math.floor(Date.now() / 1000);

		const mentions = this.extractMentions(userSpeech);

		console.log(`\n${userName}: ${userSpeech}`);

		if (DEBUG_MODE) {
			console.log(`Mentions: ${mentions.join(", ") || "-"}`);
		}

		this.intentRecogniser.recogniseIntent(userName, userSpeech, intent => {
			if (DEBUG_MODE) console.log(`Intent: ${intent.string}`);
			this.decideFinalIntent(intent, mentions);
			if (Object.keys(this.intentResponses).includes(intent.name)) {
				eval(this.intentResponses[intent.name].EXEC);
			}
			this.dialogueManager.decideAction(userName, intent.name, action => {
				this.decideFinalAction(action);
				this.performAction(action);
			});
		});

	}

	performAction(action, args = []) {
		this.lastTimestamp = Math.floor(Date.now() / 1000);
		this.utter(action, args);
	}

	say(text) {
		if (text === "") return;
		if (this.outputTarget === console.log) {
			text = `\nHOST: ${text}`;
		}
		this.outputTarget(text);
		this.lastTimestamp = Math.floor(Date.now() / 1000);
	}

	nlg(action, args) {
		if (action == "do nothing") return "";
		if (Object.keys(this.actions).includes(action)) {
			let speech = randomElement(this.actions[action].examples);
			for (let argIndex = 0; argIndex < args.length; argIndex++) {
				let index = speech.indexOf(`[${argIndex + 1}]`);
				while (index !== -1) {
					speech = speech.replace(`[${argIndex + 1}]`, args[argIndex]);
					index = speech.indexOf(`[${argIndex + 1}]`);
				}
				speech = speech.replace(/\[${argIndex}\]/g, args[argIndex])
			}
			return speech
		}
		else {
			return action;
		}
	}

	decideFinalAction(action) {
		if (action === "do nothing" && timeElapsed(this.lastTimestamp) > 4) {
			action = "prompt";
		}
		return action;
	}

	decideFinalIntent(intent, mentions) {
		let originalIntentName = intent.name;
		if (mentions.length > 0 && intent.name === "offer-to-answer") {
			intent.name = "offer-answer";
			intent.args = mentions;
		}
		else if (intent.name == "agreement" && mentions.length > 0) {
			intent.name = "offer-answer";
			intent.args = mentions;
		}
		this.intentsDecided++;
		if (originalIntentName !== intent.name) {
			intent.string = this.intentRecogniser.stringifyIntent(intent.name, intent.args);
			if (DEBUG_MODE) {
				console.log(`Changed intent: ${originalIntentName} -> ${intent.string}`);
			}
			this.intentsChanged++;
		}
	}

	extractMentions(userSpeech) {
		const mentions = [];
		for (let option of this.options) {
			const index = userSpeech.toLowerCase().indexOf(option.toLowerCase());
			if (index !== -1) {
				mentions.push(option);
			}
		}
		return mentions;
	}

	isCorrectAnswer(answer) {
		return answer.toLowerCase() === this.question["correct_answer"].toLowerCase()
	}

	handleOfferAnswer(args) {
		console.log("HANDLING OFFER ANSWER");
		console.log(args);
		if (this.isCorrectAnswer(args[0])) {
			this.utter("say-correct");
		}
		else {
			this.utter("say-incorrect", [this.question["correct_answer"]]);
		}
		this.changeState("next-question");
	}

}

module.exports = Chatbot;
