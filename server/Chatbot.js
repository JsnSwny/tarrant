const DialogueManager = require("./DialogueManager");
const IntentRecogniser = require("./IntentRecogniser");

const { COLOUR_CYAN, COLOUR_NONE, COLOUR_WHITE_BOLD, DEBUG_MODE } = require("./constants");
const { randomElement, randomInt, shuffle, timeElapsed, whisper } = require("./functions");

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
		this.action = { name: "prompt", args: [], wait: 0, eval: "" };
		this.changeState("next-question");
		this.answerOffered = "";
		this.lastTimestamp = Math.floor(Date.now() / 1000);
		this.intentsDecided = 0;
		this.intentsChanged = 0;

	}

	nextQuestion() {
		this.setQuestion("easy", "general-knowledge");
		this.options = this.question["incorrect_answers"].concat(this.question["correct_answer"]);
		shuffle(this.options);
		this.questionNumber++;
		this.currentPrize += 250;
	}

	changeState(state) {
		console.log(`\n========== ${state} ==========`);
		this.state = state;
		this.stateConfig = this.flow[this.state];
		this.setEvalAction(this.stateConfig.EXEC);
		if (timeElapsed(this.lastTimestamp) >= this.action.wait) {
			this.performAction();
		}
	}

	utter(action, args = []) {
		let speech = this.nlg(action, args);
		this.say(speech)
	}

	setQuestion(difficulty, category) {
		const filepath = `../data/questions/${category}/${difficulty}`;
		const questions = require(filepath).questions;
		// const index = randomInt(0, questions.length - 1);
		const index = this.questionNumber;
		this.question = questions[index];
		this.options = this.question["incorrect_answers"].concat(this.question["correct_answer"]);
	}

	tick() {
		this.decideFinalAction("do nothing");

		if (timeElapsed(this.lastTimestamp) >= this.action.wait) {
			this.performAction();
		}
	}

	updateTimeStamp() {
		this.lastTimestamp = Math.floor(Date.now() / 1000);
	}

	input(userName, userSpeech) {

		this.updateTimeStamp();

		const mentions = this.extractMentions(userSpeech);

		console.log(`\n${userName}: ${COLOUR_WHITE_BOLD}${userSpeech}${COLOUR_NONE}`);

		whisper(`Mentions: ${mentions.join(", ") || "-"}`, DEBUG_MODE);

		this.intentRecogniser.recogniseIntent(userName, userSpeech, intent => {
			whisper(`Intent: ${intent.string}`, DEBUG_MODE);
			this.decideFinalIntent(intent, mentions, userSpeech);
			if (Object.keys(this.stateConfig).includes(intent.name)) {
				this.setEvalAction(this.stateConfig[intent.name]);
			}
			else if (Object.keys(this.stateConfig).includes("DEFAULT")) {
				this.setEvalAction(this.stateConfig.DEFAULT);
			}
			this.dialogueManager.decideAction(userName, intent.name, action => {
				this.decideFinalAction(action);
				if (timeElapsed(this.lastTimestamp) >= this.action.wait) {
					this.performAction();
				}
			});
		});

	}

	performAction() {
		if (this.action.eval !== "") {
			eval(this.action.eval);
			this.updateTimeStamp();
		}
		else {
			this.utter(this.action.name, this.action.args);
			this.updateTimeStamp();
		}
		this.setAction("do nothing", [], 0, "");
	}

	say(text) {
		if (text === "") return;
		if (this.outputTarget === console.log) {
			text = `\nHOST: ${COLOUR_CYAN}${text}${COLOUR_NONE}`;
		}
		this.outputTarget(text);
		this.updateTimeStamp();
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
			return speech;
		}
		else {
			return action;
		}
	}

	decideFinalAction(action) {
		if (action === "do nothing" && !this.holdingAction()) return;

		if (!this.holdingAction() && timeElapsed(this.lastTimestamp) > this.action.wait) {
			this.setAction("prompt")
		}
		else if (Object.keys(this.stateConfig).includes(action)) {
			this.setEvalAction(this.stateConfig[action]);
		}
	}

	holdingAction() {
		return (this.action.eval !== "" || this.action.name !== "do nothing");
	}

	setAction(name, args = [], wait = 0, evalString = "") {
		this.action.name = name;
		this.action.args = args;
		this.action.wait = wait;
		this.setEvalAction(evalString);
	}

	setEvalAction(evalSpec) {
		let string;
		let wait;
		if (typeof evalSpec === "string") {
			wait = 0;
			string = evalSpec;
		}
		else {
			wait = evalSpec[0];
			string = evalSpec[1];
		}
		this.action.wait = wait;
		this.action.eval = string;
	}

	decideFinalIntent(intent, mentions, speech) {
		let originalIntentName = intent.name;
		if (speech === "no") {
			intent.name = "reject";
		}
		else if (speech === "yes") {
			intent.name = "agreement";
		}
		else if (mentions.length > 0 && intent.name === "offer-to-answer") {
			intent.name = "offer-answer";
			intent.args = mentions;
		}
		else if (intent.name === "agreement" && mentions.length > 0) {
			intent.name = "offer-answer";
			intent.args = mentions;
		}
		else if (intent.name === "reject-option" && mentions.length === 0) {
			intent.name = "reject";
		}
		else if (intent.name === "reject-option" && mentions.length > 0) {
			intent.args = mentions;
		}
		this.intentsDecided++;
		intent.string = this.intentRecogniser.stringifyIntent(intent.name, intent.args);
		if (originalIntentName !== intent.name) {
			whisper(`Changed intent: ${originalIntentName} -> ${intent.string}`, DEBUG_MODE);
			this.intentsChanged++;
		}
		this.lastIntent = intent;
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
		this.answerOffered = args[0];
	}

	acceptAnswer() {
		if (this.isCorrectAnswer(this.answerOffered)) {
			this.utter("say-correct");
		}
		else {
			this.utter("say-incorrect", [this.question["correct_answer"]]);
		}
		this.changeState("next-question");
	}

}

module.exports = Chatbot;
