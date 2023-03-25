const fs = require("fs");

const { nLengthNumber } = require("../server/functions");
const { FORMATTED_CATEGORIES } = require("../server/constants");

const TARGET_ARRAYS = {
	"mythology": [],
	"entertainment-film": [],
	"entertainment-cartoon-and-animations": [],
	"entertainment-music": [],
	"science-and-nature": [],
	"history": [],
	"entertainment-books": [],
	"geography": [],
	"science-computers": [],
	"general-knowledge": [],
	"science-gadgets": [],
	"sports": [],
	"entertainment-video-games": [],
	"entertainment-television": [],
	"celebrities": [],
	"science-mathematics": [],
	"vehicles": [],
	"entertainment-board-games": [],
	"entertainment-japanese-anime-and-manga": [],
	"animals": [],
	"art": [],
	"entertainment-comics": [],
	"politics": [],
	"entertainment-musicals-and-theatres": []
};

// replace HTML character references with unicode characters
function substituteCharRefs(string) {
	string = string.replace(/&#039;/g, "'");
	return string;
}

function formatQuestion(question) {
	question["correct_answers"] = formatPossibleAnswers(question["correct_answer"]);
	question["options"] = question["incorrect_answers"].map(substituteCharRefs);
	question["options"].push(substituteCharRefs(question["correct_answer"]));
	question.question = substituteCharRefs(question.question);
	for (let index = 0; index < question["incorrect_answers"].length; index++) {
		const answer = question["incorrect_answers"][index];
		question["incorrect_answers"][index] = formatPossibleAnswers(answer);
	}
}

function formatPossibleAnswers(answer) {
	const lowerCase = substituteCharRefs(answer).toLowerCase();
	const answers = [substituteCharRefs(answer), lowerCase];

	if (lowerCase.includes("the ")) answers.push(replaceAll(lowerCase, "the ", ""));
	if (lowerCase.includes("'")) answers.push(replaceAll(lowerCase, "'", ""));

	return answers;
}

function replaceAll(string, match, sub) {
	while (string.indexOf(match) !== -1) {
		string = string.replace(match, sub);
	}
	return string;
}

function formatQuestions(questions) {
	delete questions["response_code"];
	questions.questions = questions.results;
	delete questions.results;
	// display all answer options found in the questions dataset
	for (let question of questions.questions) {
		if (!question["correct_answers"]) {
			formatQuestion(question);
		} else {
			console.log("Already formatted");
		}
	}
	questions["formatted"] = true;
}

const TARGET_DIRECTORY = "api_responses/"

for (let fileIndex = 1; fileIndex < 301; fileIndex++) {
	const filename = `${nLengthNumber(4, fileIndex)}.json`;
	const path = `../${TARGET_DIRECTORY}${filename}`;
	const questions = require(path);
	formatQuestions(questions);
	for (let question of questions.questions) {
		let category = FORMATTED_CATEGORIES[question.category];
		let targetArray = TARGET_ARRAYS[category];
		let index = targetArray.findIndex(e => e.question === question.question);
		if (index === -1) targetArray.push(question);
	}
}

let acc = 0;

for (let key of Object.keys(TARGET_ARRAYS)) {
	const count = TARGET_ARRAYS[key].length;
	acc += count;
	console.log(`${key}: ${count} questions`);
	const object = { questions: TARGET_ARRAYS[key] };
	const targetFilename = `data/questions/${key}/hard.json`;
	fs.writeFileSync(targetFilename, JSON.stringify(object, null, 4));
}

console.log(`\nTotal: ${acc} questions`);

