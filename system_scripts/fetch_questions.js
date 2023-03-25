const childProcess = require("child_process");
const fs = require("fs");

const { nLengthNumber } = require("../server/functions");

const API_URL = "https://opentdb.com/api.php?amount=50&difficulty=hard&type=multiple";

const STARTING_NUMBER = 201;
const CALLS_TO_MAKE = 100;
const DELAY_BETWEEN_CALLS = 3000;
const STARTING_FILENAME = nLengthNumber(4, STARTING_NUMBER) + ".json";
const TARGET_DIRECTORY = "api_responses/"

if (fs.existsSync(`${TARGET_DIRECTORY}${STARTING_FILENAME}`)) {
	console.log(`File ${TARGET_DIRECTORY}${STARTING_FILENAME} already exists`);
	process.exit(1);
}

console.log(`Making ${CALLS_TO_MAKE} API calls`);

for (let counter = 0; counter < CALLS_TO_MAKE; counter++) {
	setTimeout(() => {
		let fileIndex = STARTING_NUMBER + counter;
		const filename = nLengthNumber(4, fileIndex) + ".json";
		console.log(`Fetching ${filename}`);
		const command = `curl "${API_URL}" -o ${TARGET_DIRECTORY}${filename}`;
		childProcess.exec(command, (err, stdout) => {
			if (err) throw err;
		});
	}, counter * DELAY_BETWEEN_CALLS);
}
