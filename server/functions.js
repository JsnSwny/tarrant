const childProcess = require("child_process");
const axios = require("axios");
const {
    COLOUR_WHITE_LIGHT,
    COLOUR_NONE,
    ON_UNIX,
    TIME_SCALE_FACTOR,
} = require("./constants");

if (ON_UNIX) {
    module.exports.makePostRequest = (uri, object, next) => {
        let command = `curl ${uri} -d '${JSON.stringify(object)}'`;
        childProcess.exec(command, (err, stdout) => {
            if (err) {
                console.log("Shit there's an error");
                next({ value: "server-side error: failed to perform curl" });
                throw err;
            }
            const response = JSON.parse(stdout);
            next(response);
        });
    };
} else {
    module.exports.makePostRequest = (uri, object, next) => {
        axios.post(uri, object).then((res) => next(res.data));
    };
}

// return a random integer between min and max
function randomInt(min, max) {
    const range = max - min;
    return min + Math.floor(Math.random() * range);
}

function randomElement(array) {
    const index = randomInt(0, array.length - 1);
    return array[index];
}

module.exports.replace = (string, match, substitute) => {
    let index = string.indexOf(match);
    while (index !== -1) {
        string = string.replace(match, substitute);
        index = string.indexOf(match);
    }
    return string;
};

module.exports.shuffle = (array) => {
    const arrayLength = array.length;
    const temp = array.splice(0);
    for (let counter = 0; counter < arrayLength; counter++) {
        const index = randomInt(0, temp.length - 1);
        array.push(temp[index]);
        temp.splice(index, 1);
    }
};

module.exports.now = () => {
    return Math.floor(Date.now() / 1000);
};

module.exports.timeElapsed = (since) => {
    return TIME_SCALE_FACTOR * (module.exports.now() - since);
};

module.exports.currentTime = () => {
    return Math.floor(Date.now() / 1000);
};

module.exports.whisper = (text, show = True) => {
    if (show) console.log(`${COLOUR_WHITE_LIGHT}${text}${COLOUR_NONE}`);
};

module.exports.randomElement = randomElement;
module.exports.randomInt = randomInt;
