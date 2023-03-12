const questions = require("../data/questions/general-knowledge/easy").questions;

// replace HTML character references with unicode characters
function substituteCharRefs(string) {
	string = string.replace(/&#039;/g, "'");
	return string;
}

// display all answer options found in the questions dataset
for (let question of questions) {
	console.log(substituteCharRefs(question["correct_answer"]));
	for (let answer of question["incorrect_answers"]) {
		console.log(substituteCharRefs(answer));
	}
}
