const IntentRecogniser = require("./IntentRecogniser");
const DialogueManager = require("./DialogueManager");

const intentRecogniser = new IntentRecogniser();
const dialogueManager = new DialogueManager();

module.exports = {
    intentRecogniser,
    dialogueManager
}
