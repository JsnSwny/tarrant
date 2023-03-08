const express = require("express");
const path = require("path");
const { dialogueManager, intentRecogniser } = require("../server/objects");

const router = express.Router();

// receive user dialogue and respond
router.post("/api/speak-to-chatbot", (req, res) => {
    console.log("API POST: speak-to-chatbot");
    console.log(req.body);
    let userSpeech = req.body.value;
    console.log("USER SPEECH");
    console.log(userSpeech);
    intentRecogniser.recogniseIntent(userSpeech, response => {
        let intentName = response.value;
        let intent = "U1 " + intentName;
        dialogueManager.decideAction(intent, response => {
            console.log("DIAAA RESPONSE");
            console.log(response);
            let action = response.value;
            res.send({ value: `Intent: ${intentName}, Action: ${action}`});
        });
    });
});

// receive a line of speech from the client and respond with
// the name of the intent recognised
router.post("/api/recognise-intent", (req, res) => {
    console.log("API POST: recognise-intent");
    console.log(req.body);
    let userSpeech = req.body.value;
    intentRecogniser.recogniseIntent(userSpeech, response => {
        res.send(response);
    });
});

// receive the name of an intent from the client and respond
// with name of the appropriate action
router.post("/api/decide-action", (req, res) => {
    console.log("API POST: decide-action");
    console.log(req.body);
    let intent = req.body.value;
    dialogueManager.decideAction(intent, response => {
        res.send(response);
    });
});

module.exports = router;
