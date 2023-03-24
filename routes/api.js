const express = require("express");
const fs = require("fs")
const parse = require("csv-parse").parse;
const path = require("path");
const { chatbot, dialogueManager, intentRecogniser } = require("../server/objects");
const { insertIntoLeaderboard } = require("../server/functions");

const router = express.Router();

// receive user dialogue and respond
router.post("/api/speak-to-chatbot", (req, res) => {
    console.log("API POST: speak-to-chatbot");
    console.log(req.body);
    let rawInput = req.body.value;
    rawInput = rawInput.split(" ");
    let userName = rawInput[0];
    let userSpeech = rawInput.slice(1).join(" ");
    chatbot.input(userName, userSpeech, (response) => {
        res.send({ value: response });
    });
});

router.get("/api/leaderboard", (req, res) => {
	console.log("API GET: leaderboard");
	fs.readFile("leaderboard.csv", (err, data) => {
		parse(data, { "columns": false, "trim": true }, (err, rows) => {
			const leaderboard = [];
			for (let row of rows) {
				insertIntoLeaderboard(leaderboard, {
					user1: row[0],
					user2: row[1],
					winnings: Number(row[2])
				});
			}
			res.send({ leaderboard });
		});
	});
});

module.exports = router;
