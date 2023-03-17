const childProcess = require("child_process");

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
		this.totalQuestions = 1;
		this.currentPrize = 0;
		this.action = { name: "prompt", args: [], wait: 0, eval: "" };
		this.nextQuestion();
		this.updateTimeStamp();
		this.intentsDecided = 0;
		this.intentsChanged = 0;
		this.timeScaleFactor = 0.2;
		this.USER_1_NAME = "Abraham";
		this.USER_2_NAME = "Eleanor";

	}

	nextQuestion() {
		this.setQuestion("easy", "general-knowledge");
		this.options = this.question["incorrect_answers"].concat(this.question["correct_answer"]);
		shuffle(this.options);
		this.questionNumber++;
		this.currentPrize += 250;
		this.answerOffered = "";
		this.changeState("question", [true]);
	}

	changeState(state, stateArgs = []) {
		this.stateArgs = stateArgs;
		console.log(`\n========== ${state} [${stateArgs.join(", ")}] ==========`);
		this.state = state;
		this.stateConfig = this.flow[this.state];
		this.setEvalAction(this.stateConfig.EXEC);
		this.performAction();
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
		this.performAction();
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
			this.dialogueManager.decideAction(userName, intent.name, action => {
				this.decideFinalAction(action, intent);
				this.performAction();
			});
		});

	}

	performAction() {
		if (timeElapsed(this.lastTimestamp) < this.action.wait) return;

		if (this.action.eval !== "") {
			eval(this.action.eval);
			this.updateTimeStamp();
		}
		else if (this.action.name !== "do nothing") {
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

	decideFinalAction(action, intent = undefined) {
		if (intent) {
			if (Object.keys(this.stateConfig).includes(intent.name)) {
				this.setEvalAction(this.stateConfig[intent.name]);
			}
			else if (Object.keys(this.stateConfig).includes("DEFAULT")) {
				this.setEvalAction(this.stateConfig.DEFAULT);
			}
		}
		else if (Object.keys(this.stateConfig).includes("SILENCE") && timeElapsed(this.lastTimestamp) >= this.stateConfig.SILENCE[0]) {
			this.setEvalAction(this.stateConfig.SILENCE[1]);
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
		if (string === "") return;
		whisper(`Eval action: ${string}`, (DEBUG_MODE && wait === 0));
		whisper(`Eval action in ${wait} seconds: ${string}`, (DEBUG_MODE && wait > 0));
	}

	decideFinalIntent(intent, mentions, speech) {
		let originalIntentName = intent.name;
		let originalIntentArgs = intent.args;
		let originalIntentString = intent.string;
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
			whisper(`Changed intent: ${originalIntentString} -> ${intent.string}`, DEBUG_MODE);
			this.intentsChanged++;
		}
		else if (originalIntentArgs !== intent.args) {
			whisper(`Added intent args: ${originalIntentString} -> ${intent.string}`, DEBUG_MODE);
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
		if (this.questionNumber < this.totalQuestions) {
			this.nextQuestion();
		}
		else {
			this.changeState("end-of-game");
		}
	}

	handleQuestionSilence() {
		if (this.answerOffered !== "") {
			this.utter('repeat-answer', [this.answerOffered]);
			this.changeState('seek-confirmation');
		}
		else {
			this.say("I'll give you a bit more time. (delete)");
		}
	}

	handleRejectOption(args) {
		this.answerOffered = "";
		this.offerGuidance();
	}
	
	offerGuidance() {
		this.say("Remember that you have two lifelines");
	}

	stateQuestion(args) {
		// args[0] is a boolean specifying whether the question should be stated in full
		if (args[0]) this.utter("question", [this.questionNumber, this.currentPrize, this.question.question, this.options]);
		else this.utter("question-brief", [this.questionNumber, this.currentPrize, this.question.question, this.options]);
	}

	handleEndOfGame() {
		const command = `echo "${this.USER_1_NAME},${this.USER_2_NAME},${this.questionNumber}" >> leaderboard.csv`;
		childProcess.exec(command, (err, stdout) => {
			if (err) throw(err);
			console.log("Written to leaderboard");
		});
	}

}

module.exports = Chatbot;
