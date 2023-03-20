const fs = require("fs");

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

const CATEGORIES = ["general-knowledge", "history"];
const DIFFICULTIES = ["easy", "medium", "hard"];

for (let category of CATEGORIES) {
	for (let difficulty of DIFFICULTIES) {
		const filename = `data/questions/${category}/${difficulty}.json`;
		if (fs.existsSync(filename)) {
			const questions = require(`../data/questions/${category}/${difficulty}`);
			if (questions.formatted) {
				console.log("Already formatted!");
				continue;
			}
			console.log(`${filename} exists`);
			formatQuestions(questions);
			fs.writeFileSync(filename, JSON.stringify(questions, null, 4));
		}
	}
}
