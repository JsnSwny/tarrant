const express = require("express");
const path = require("path");
const { chatbot, dialogueManager, intentRecogniser } = require("../server/objects");

const router = express.Router();

// receive user dialogue and respond
router.post("/api/speak-to-chatbot", (req, res) => {
    console.log("API POST: speak-to-chatbot");
    console.log(req.body);
    let rawInput = req.body.value;
    rawInput = rawInput.split(" ");
    let userName = rawInput[0]
    let userSpeech = rawInput.slice(1).join(" ")
    chatbot.input(userName, userSpeech, response => {
        res.send({ value: response });
    });
});

module.exports = router;
