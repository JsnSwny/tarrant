const childProcess = require("child_process");
const { ON_UNIX } = require("./constants");

if (ON_UNIX) {
    module.exports.makePostRequest = (uri, object, next) => {
        const command = `curl ${uri} -d '${JSON.stringify(object)}'`;
        childProcess.exec(command, (err, stdout) => {
            if (err) {
                console.log("Shit there's an error");
                next({ "value": "server-side error: failed to perform curl" });
                throw(err);
            }
            const response = JSON.parse(stdout);
            next(response);
        });
    }
}
else {
    module.exports.makePostRequest = (uri, object, next) => {
        axios.post(uri, object).then(next).catch((err) => console.log(err));
    }
}

// return a random integer between min and max
module.exports.randomInt = (min, max) => {
    const range = max - min;
    return min + Math.floor(Math.random() * range);
};
