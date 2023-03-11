const axios = require("axios");
const { makePostRequest } = require("./functions");

class IntentRecogniser {

	constructor() {

	}

	// passes user speech to nlu server and receives recognised intent
	recogniseIntent(user, speech, next) {
		makePostRequest("localhost:5005/model/parse", { "text": speech }, response => {
			const intent = this.extractIntent(user, response);
			next(intent);
		});
	}

	extractIntent(user, rasaResponse) {
		const name = rasaResponse.intent.name;
		let args = [];
		if (rasaResponse.entities) {
			args = rasaResponse.entities.map(entity => entity.value);
		}
		let string = name;
		if (args.length > 0) {
			string = `${string}(${args.join(", ")})`;
		}
		return { user, name, args, string };
	}
}

module.exports = IntentRecogniser;
