const childProcess = require("child_process");
const axios = require("axios");
const { makePostRequest } = require("./functions");

class DialogueManager {
	constructor() {}

	decideAction(user, intent, next) {
		const postObject = { input: `${user} ${intent}` };
		makePostRequest("http://localhost:8000/api/get_action/", postObject, response => {
			next(response.action);
		});
	}
}

module.exports = DialogueManager;
