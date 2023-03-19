const childProcess = require("child_process");

const DialogueManager = require("./DialogueManager");
const IntentRecogniser = require("./IntentRecogniser");

const {
	COLOUR_CYAN,
	COLOUR_NONE,
	COLOUR_WHITE_BOLD,
	DEBUG_MODE,
} = require("./constants");
const {
	now,
	randomElement,
	randomInt,
	shuffle,
	timeElapsed,
	whisper,
} = require("./functions");

class Chatbot {
	constructor(room) {
		this.paused = true;
		this.flow = require("../data/chatbot/flow");
		this.actions = require("../data/chatbot/nlg");
		this.intentResponses = require("../data/chatbot/intent_responses");
		this.sockets = [null, null];
		this.dialogueManager = new DialogueManager();
		this.intentRecogniser = new IntentRecogniser();
		this.questionNumber = 0;
		this.totalQuestions = 2;
		this.currentPrize = 0;
		this.action = { name: "prompt", args: [], wait: 0, eval: "" };
		this.lastTimestamp = now();
		this.lastInputTimestamp = now();
		this.intentsDecided = 0;
		this.intentsChanged = 0;
		this.timeScaleFactor = 0.2;
		this.USER_1_NAME = "Abraham";
		this.USER_2_NAME = "Eleanor";
		this.hasLifelineFiftyFifty = true;
		this.hasLifelineAskTheAudience = true;
		this.io = null;
	}

	startGame(io) {
		this.io = io;
		this.nextQuestion(true);
		this.paused = false;
		if (this.io) {
			this.io.emit("start_game");
		}
	}

	nextQuestion(firstQuestion = false) {
		if (firstQuestion) {
			this.questionNumber = 1;
		} else {
			this.questionNumber++;
		}
		this.setQuestion("easy", "general-knowledge");
		this.options = this.question["incorrect_answers"].map((options) => options);
		this.options.push(this.question["correct_answers"]);
		shuffle(this.options);
		this.options.push(this.question["correct_answers"]);

		this.currentPrize += 250;
		this.answerOffered = "";
		this.changeState("question", [true]);
		console.log(this.question);
		if (this.io) {
			this.io.emit("next_question", {
				questionNumber: this.questionNumber,
				question: this.question,
			});
		}
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
		this.say(speech);
	}

	setQuestion(difficulty, category) {
		const filepath = `../data/questions/${category}/${difficulty}`;
		const questions = require(filepath).questions;
		// const index = randomInt(0, questions.length - 1);
		const index = this.questionNumber;
		this.question = questions[index];
		this.options = this.question["incorrect_answers"].concat(
			this.question["correct_answer"]
		);
	}

	tick() {
		if (this.paused) return;
		this.decideFinalAction("do nothing");
		this.performAction();
	}

	input(userName, userSpeech) {
		this.lastTimestamp = now();
		this.lastInputTimestamp = now();

		const mentions = this.extractMentions(userSpeech);

		console.log(
			`\n${userName}: ${COLOUR_WHITE_BOLD}${userSpeech}${COLOUR_NONE}`
		);

		whisper(`Mentions: ${mentions.join(", ") || "-"}`, DEBUG_MODE);

		this.intentRecogniser.recogniseIntent(userName, userSpeech, (intent) => {
			whisper(`Intent: ${intent.string}`, DEBUG_MODE);
			this.decideFinalIntent(intent, mentions, userSpeech);
			this.dialogueManager.decideAction(userName, intent.name, (action) => {
				this.decideFinalAction(action, intent);
				this.performAction();
			});
		});
	}

	performAction() {
		if (timeElapsed(this.lastTimestamp) < this.action.wait) return;

		if (this.action.eval !== "") {
			eval(this.action.eval);
			this.lastTimestamp = now();
		} else if (this.action.name !== "do nothing") {
			this.utter(this.action.name, this.action.args);
			this.lastTimestamp = now();
		}
		this.setAction("do nothing", [], 0, "");
	}

	say(text) {
		if (text === "") return;
		if (this.io) {
			this.io.emit("receive_message", {
				text: text,
				speaker: "HOST",
			});
		}
		text = `\nHOST: ${COLOUR_CYAN}${text}${COLOUR_NONE}`;
		console.log(text);

		this.lastTimestamp = now();
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
				speech = speech.replace(/\[${argIndex}\]/g, args[argIndex]);
			}
			return speech;
		} else {
			return action;
		}
	}

	decideFinalAction(action, intent = undefined) {
		if (intent) {
			if (Object.keys(this.stateConfig).includes(intent.name)) {
				this.setEvalAction(this.stateConfig[intent.name]);
			} else if (Object.keys(this.stateConfig).includes("DEFAULT")) {
				this.setEvalAction(this.stateConfig.DEFAULT);
			} else {
				console.log("Da fuck");
			}
		} else if (Object.keys(this.stateConfig).includes("SILENCE")) {
			const CONFIG_SPEC_VALUE = this.stateConfig.SILENCE;
			const silenceValue = CONFIG_SPEC_VALUE;
			if (timeElapsed(this.lastTimestamp) >= silenceValue[0]) {
				this.setEvalAction(silenceValue[1]);
			}
		}
	}

	holdingAction() {
		return this.action.eval !== "" || this.action.name !== "do nothing";
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
		} else {
			wait = evalSpec[0];
			string = evalSpec[1];
		}
		this.action.wait = wait;
		this.action.eval = string;
		if (string === "") return;
		whisper(`Eval action: ${string}`, DEBUG_MODE && wait === 0);
		whisper(
			`Eval action in ${wait} seconds: ${string}`,
			DEBUG_MODE && wait > 0
		);
	}

	decideFinalIntent(intent, mentions, speech) {
		let originalIntentName = intent.name;
		let originalIntentArgs = intent.args;
		let originalIntentString = intent.string;
		if (speech === "no") {
			intent.name = "reject";
		} else if (speech === "yes") {
			intent.name = "agreement";
		} else if (mentions.length > 0 && intent.name === "offer-to-answer") {
			intent.name = "offer-answer";
			intent.args = mentions;
		} else if (intent.name === "agreement" && mentions.length > 0) {
			intent.name = "offer-answer";
			intent.args = mentions;
		} else if (intent.name === "reject-option" && mentions.length === 0) {
			intent.name = "reject";
		} else if (intent.name === "reject-option" && mentions.length > 0) {
			intent.args = mentions;
		}
		this.intentsDecided++;
		intent.string = this.intentRecogniser.stringifyIntent(
			intent.name,
			intent.args
		);
		if (originalIntentName !== intent.name) {
			whisper(
				`Changed intent: ${originalIntentString} -> ${intent.string}`,
				DEBUG_MODE
			);
			this.intentsChanged++;
		} else if (originalIntentArgs !== intent.args) {
			whisper(
				`Added intent args: ${originalIntentString} -> ${intent.string}`,
				DEBUG_MODE
			);
		}
		this.lastIntent = intent;
	}

	extractMentions(userSpeech) {
		const mentions = [];
		if (this.options) {
			for (let optionsArray of this.options) {
				if (this.containsMentions(userSpeech, optionsArray)) {
					mentions.push(optionsArray[0]);
				}
			}
		}
		return mentions;
	}

	containsMentions(dialogue, options) {
		for (let option of options) {
			const index = dialogue.toLowerCase().indexOf(option.toLowerCase());
			if (index !== -1) {
				return true;
			}
		}
		return false;
	}

	isCorrectAnswer(answer) {
		return this.question["correct_answers"].includes(answer.toLowerCase());
	}

	isIncorrectAnswer(answer) {
		for (let answers of this.question["incorrect_answers"]) {
			if (answers.includes(answer.toLowerCase())) {
				return true;
			}
		}
		return false;
	}

	handleOfferAnswer(args) {
		this.answerOffered = args[0];
	}

	acceptAnswer() {
		if (this.isCorrectAnswer(this.answerOffered)) {
			this.utter("say-correct");
		} else {
			this.utter("say-incorrect", [this.question["correct_answer"]]);
		}
		if (this.questionNumber < this.totalQuestions) {
			this.nextQuestion();
		} else {
			this.changeState("end-of-game");
		}
	}

	handleQuestionSilence() {
		if (this.answerOffered !== "") {
			this.utter("repeat-answer", [this.answerOffered]);
			this.changeState("seek-confirmation");
		} else {
			this.say("I'll give you a bit more time. (delete)");
		}
	}

	handleRejectOption(args) {
		this.answerOffered = "";
		this.offerGuidance();
	}

	offerGuidance() {
		if (false && this.hasLifelineFiftyFifty && this.hasLifelineAskTheAudience) {
			this.utter("offer-lifelines");
		} else if (this.hasLifelineFiftyFifty) {
			this.utter("offer-fifty-fifty");
		} else if (this.hasLifelineAskTheAudience) {
			this.utter("offer-ask-the-audience");
		}
	}

	stateQuestion(args) {
		// args[0] is a boolean specifying whether the question should be stated in full
		if (args[0])
			this.utter("question", [
				this.questionNumber,
				this.currentPrize,
				this.question.question,
				this.question.options,
			]);
		else
			this.utter("question-brief", [
				this.questionNumber,
				this.currentPrize,
				this.question.question,
				this.question.options,
			]);
	}

	handleEndOfGame() {
		const command = `echo "${this.USER_1_NAME},${this.USER_2_NAME},${this.questionNumber}" >> leaderboard.csv`;
		childProcess.exec(command, (err, stdout) => {
			if (err) throw err;
			console.log("Written to leaderboard");
		});
		if (this.io) {
			this.io.emit("end_of_game");
		}
	}
}

module.exports = Chatbot;
