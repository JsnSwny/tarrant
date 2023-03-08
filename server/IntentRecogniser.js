const { postMethodFetch } = require("./functions");
const childProcess = require("child_process");

class IntentRecogniser {

    constructor() {

    }

    // passes user speech to nlu server and receives recognised intent
    recogniseIntent(userSpeech, next) {
        
        let args = `localhost:5005/model/parse -d '{"text":"${userSpeech}"}'`;

        // call curl function to communicate user speech to nlu server for intent response
        // example: curl localhost:5005/model/parse -d '{"text":"hello"}'
        childProcess.exec("curl " + args, (err, stdout) => {
            if (err) {
                console.log("Shit there's an error");
                next({ "value": "server-side error: IntentRecogniser.recogniseIntent: failed to perform curl" });
                throw(err);
            }
            const object = JSON.parse(stdout);
            console.log(object);
            console.log(object.intent.name);
            let args = object.entities.map(entity => entity.value)
            if (args.length > 0) {
                next({ "value": `${object.intent.name}(${args.join(", ")})` });
            }
            else {
                next({ "value": `${object.intent.name}` });
            }
        });

    }

}

module.exports = IntentRecogniser;
