class DialogueInputEmulator {

	constructor(chatbot, transcriptID) {
		this.chatbot = chatbot;
		this.transcript = require(`../data/test_dialogues/${transcriptID}.json`);
		this.lastTimeStamp = 0;
		this.lineIndex = -1;
		this.nextLine();
	}

	nextLine() {
		this.line = this.transcript.lines[++this.lineIndex];
		this.lastTimestamp = Math.floor(Date.now() / 1000);
	}

	tick() {
		let elapsed = Math.floor(Date.now() / 1000) - this.lastTimestamp;
		if (elapsed < this.line.wait) return;

		const userName = `U${this.line.user}`;
		const userSpeech = this.line.text;
		this.lastTimestamp = Math.floor(Date.now() / 1000);
		this.chatbot.input(userName, userSpeech);
		this.nextLine();

	}

}

module.exports = DialogueInputEmulator;
