const { currentTime, timeElapsed } = require("./functions");

class DialogueInputEmulator {
    constructor(chatbot, transcriptID) {
        this.chatbot = chatbot;
        this.transcript = require(`../data/test_dialogues/${transcriptID}.json`);
        this.lastTimeStamp = 0;
        this.lineIndex = -1;
        this.totalLines = this.transcript.lines.length;
        this.nextLine();
    }

    nextLine() {
        this.line = this.transcript.lines[++this.lineIndex];
        this.lastTimestamp = currentTime();
    }

    tick() {
        let elapsed = timeElapsed(this.lastTimestamp);
        if (this.lineIndex >= this.totalLines || elapsed < this.line.wait)
            return;

        const userName = `U${this.line.user}`;
        const userSpeech = this.line.text;
        this.lastTimestamp = currentTime();
        this.chatbot.input(userName, userSpeech);
        this.nextLine();
    }
}

module.exports = DialogueInputEmulator;
