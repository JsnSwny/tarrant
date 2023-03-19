const fs = require("fs");

// replace HTML character references with unicode characters
function substituteCharRefs(string) {
	string = string.replace(/&#039;/g, "'");
	return string;
}

function formatQuestion(question) {
	question["correct_answers"] = [substituteCharRefs(question["correct_answer"])];
	incorrectAnswers = question["incorrect_answers"];
	for (let index = 0; index < incorrectAnswers.length; index++) {
		const answer = question["incorrect_answers"][index];
		question["incorrect_answers"][index] = formatIncorrectAnswers(answer);
	}
}

function formatIncorrectAnswers(answer) {
	return [substituteCharRefs(answer)];
}

function formatQuestions(questions) {
	// display all answer options found in the questions dataset
	for (let question of questions.questions) {
		if (!question["correct_answers"]) {
			formatQuestion(question);
		}
		else {
			console.log("Already formatted");
		}
	}
	questions["formatted"] = true;

}

const CATEGORIES = ["general-knowledge", "history"];
const DIFFICULTIES = ["easy", "medium", "hard"];

for (let category of CATEGORIES) {
	for (let difficulty of DIFFICULTIES) {
		const filename = `data/questions/${category}/${difficulty}.json`;
		if (fs.existsSync(filename)) {
			const questions = require(`../data/questions/${category}/${difficulty}`);
			if (questions.formatted) continue;
			console.log(`${filename} exists`);
			formatQuestions(questions);
			fs.writeFileSync(filename, JSON.stringify(questions, null, 4));
		}
	}
}