// replace HTML character references with unicode characters
function substituteCharRefs(string) {
	string = string.replace(/&#039;/g, "'");
	return string;
}

function fixQuestion(question) {
	question["correct_answer"] = substituteCharRefs(question["correct_answer"]);
	incorrectAnswers = question["incorrect_answers"];
	for (let index = 0; index < incorrectAnswers.length; index++) {
		const answer = question["incorrect_answers"][index];
		question["incorrect_answers"][index] = fixIncorrectAnswers(answer);
	}
}

function fixIncorrectAnswers(answer) {
	return [substituteCharRefs(answer)];
}

function fixQuestions(category, difficulty) {
	const questions = require(`../data/questions/${category}/${difficulty}`).questions;

	// display all answer options found in the questions dataset
	for (let question of questions) {
		fixQuestion(question);
	}

	console.log(questions);
}

fixQuestions("general-knowledge", "easy")
