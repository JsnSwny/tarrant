const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const speech = require("@google-cloud/speech");
const _ = require("lodash");
const axios = require("axios");
const DialogueInputEmulator = require("./server/DialogueInputEmulator");
//const { Server } = require("socket.io");
const socketio = require("socket.io");
const { EMULATE_DIALOGUE } = require("./server/constants");
const { chatbot } = require("./server/objects");
const uuid = require("uuid");

// instantiate server object
const app = express();
const server = http.createServer(app);

const io = socketio(server, {
	cors: {
		origins: ["http://localhost:5000", "http://localhost:3000"],
		handlePreflightRequest: (req, res) => {
			res.writeHead(200, {
				"Access-Control-Allow-Origin": "http://localhost:5000",
				"Access-Control-Allow-Methods": "GET,POST",
				"Access-Control-Allow-Headers": "",
				"Access-Control-Allow-Credentials": true,
			});
			res.end();
		},
	},
});

// specify public directory
app.use(express.static(path.join(__dirname, "public")));

// specify API
app.use("/", require("./routes/api"));

const connections = [];
let userCount = 0;

function communicateToPlayers(text) {
	connections.forEach((socket) => {
		socket.emit("dialogue", { user: "HOST", text });
	});
}

let CHATBOT_OUTPUT_TARGET = EMULATE_DIALOGUE
	? console.log
	: communicateToPlayers;

// middleware for parsing post bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./speech-to-text-key.json";

const speechClient = new speech.SpeechClient();

const rooms = {};

function getUserIdFromSocketId(socketId) {
	for (const roomId in rooms) {
		const room = rooms[roomId];
		for (const user of room.users) {
			if (user.socketId === socketId) {
				return user.userId;
			}
		}
	}
	return null;
}

function getRoomId(socketId) {
	for (const roomId in rooms) {
		const users = rooms[roomId].users;
		const user = users.find((user) => user.socketId === socketId);
		if (user) {
			return roomId;
		}
	}
	return null;
}

io.on("connection", (socket) => {
	let assignedRoom = null;
	let assignedUserId = null;

	// Loop through the existing rooms and check if any have less than 2 users
	for (const roomId in rooms) {
		const { users } = rooms[roomId];
		if (users.length < 2) {
			// Room has less than 2 users, add the user to that room
			socket.join(roomId);
			assignedRoom = roomId;

			assignedUserId = 2;
			console.log(users);
			if (users[0].userId == 2) {
				assignedUserId = 1;
			}

			users.push({ userId: assignedUserId, socketId: socket.id });

			// START GAME

			// io.to(roomId).emit("some event");
			chatbot.startGame(io);
			// rooms = {"2123-1231-1241": users: [{userId: 1, socketId: 2}]}
		}
	}

	if (!assignedRoom) {
		// No room with less than 2 users found, create a new room
		const roomId = uuid.v4();
		socket.join(roomId);
		assignedRoom = roomId;
		rooms[roomId] = {
			users: [{ userId: 1, socketId: socket.id }],
		};

		// Assign the user an ID of 1
		assignedUserId = 1;
	}

	console.log(Object.values(rooms).map((item) => item.users));
	// Send the assigned room and user ID to the client
	socket.emit("receive_message", {
		text: `${assignedRoom}`,
		speaker: assignedUserId,
	});

	let recognizeStream = null;
	console.log("** a user connected - " + socket.id + " **\n");

	socket.on("disconnect", () => {
		console.log("** user disconnected ** \n");
		// Find the room containing the disconnected user and remove them
		const socketId = socket.id;

		for (const roomId in rooms) {
			const room = rooms[roomId];
			if (room.users) {
				const userIndex = room.users.findIndex(
					(user) => user.socketId === socketId
				);

				if (userIndex !== -1) {
					// The user is in this room, remove them from the room
					const user = room.users[userIndex];
					const userId = user.userId;
					room.users.splice(userIndex, 1);
					socket.leave(roomId);
					console.log(`User ${userId} has left room ${roomId}`);
					console.log(room);
					if (room.users.length == 0) {
						delete rooms[roomId];
					}
					break;
				}
			}
		}
	});

	const receiveDialogue = (dialogue) => {
		const speaker = getUserIdFromSocketId(socket.id);
		chatbot.input(speaker, dialogue);
		let room = getRoomId(socket.id);
		io.to(room).emit("receive_message", {
			text: dialogue,
			speaker: getUserIdFromSocketId(socket.id),
		});
	};

	socket.on("send_message", (data) => {
		receiveDialogue(data.message);
	});

	socket.on("startGoogleCloudStream", function (data) {
		startRecognitionStream(this, data);
	});

	socket.on("endGoogleCloudStream", function () {
		console.log("** ending google cloud stream **\n");
		stopRecognitionStream();
	});

	socket.on("send_audio_data", async (audioData) => {
		if (recognizeStream !== null) {
			try {
				// console.log(audioData.audio);
				recognizeStream.write(audioData.audio);
			} catch (err) {
				console.log("AHHH Error calling google api " + err);
			}
		} else {
			// console.log("RecognizeStream is null");
		}
	});

	function startRecognitionStream(client) {
		console.log("* StartRecognitionStream\n");
		console.log(request);
		try {
			recognizeStream = speechClient
				.streamingRecognize(request)
				.on("error", (err) => console.log(err))
				.on("data", (data) => {
					const transcription = data.results
						.map((result) => result.alternatives[0].transcript)
						.join("\n");

					result = data.results[0];

					words_info = result.alternatives[0].words;
					// const grouped = _.groupBy(words_info, (word) => word.speakerTag);
					words = words_info.map((item) => ({
						word: item.word,
						speaker: getUserIdFromSocketId(socket.id),
					}));

					if (result.isFinal) {
						receiveDialogue(transcription);
					}
				});
		} catch (err) {
			console.error("OHHH Error streaming google api " + err);
		}
	}

	function stopRecognitionStream() {
		if (recognizeStream) {
			console.log("* StopRecognitionStream \n");
			recognizeStream.end();
		}
		recognizeStream = null;
	}
});

const PORT = 5000;

server.listen(PORT);

console.log(`Listening on port ${PORT}.`);

const dialogueInputEmulator = new DialogueInputEmulator(chatbot, 1);

if (EMULATE_DIALOGUE) {
	setInterval(() => {
		dialogueInputEmulator.tick();
	}, 100);
}

// DELETE
// setTimeout(() => {
//	 chatbot.startGame()
// }, 1000);

setInterval(() => {
	chatbot.tick();
}, 100);

// =========================== GOOGLE CLOUD SETTINGS ================================ //

// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
const encoding = "LINEAR16";
const sampleRateHertz = 16000;
const languageCode = "ko-KR"; //en-US
const alternativeLanguageCodes = ["en-US", "ko-KR"];

const request = {
	config: {
		encoding: "LINEAR16",
		sampleRateHertz: 16000,
		languageCode: "en-US",
		enbleWordTimeOffsets: true,
		enableAutomaticPunctuation: true,
		model: "latest_long",
		metadata: {
			microphoneDistance: "NEARFIELD",
		},
		speechContexts: [
			{
				phrases: ["razer", "htc", "oculus", "google"],
			},
		],
		useEnhanced: true,
	},
	interimResults: true,
};
