const Chatbot = require("./Chatbot");

class Room {

	constructor() {

		this.users = {};

	}

	activate() {
		this.chatbot = new Chatbot()
	}

}

module.exports = Room;
