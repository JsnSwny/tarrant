const axios = require("axios");
const { DEBUG_NLU, CONTRACTION_SUBSTITUTIONS } = require("./constants");
const { makePostRequest, replace } = require("./functions");

class IntentRecogniser {
    constructor() {}

    // passes user speech to nlu server and receives recognised intent
    recogniseIntent(user, speech, next) {
        speech = this.preIntentRecognition(speech);
        makePostRequest(
            "http://0.0.0.0:5005/model/parse",
            { text: speech },
            (response) => {
                if (DEBUG_NLU) console.log(response);
                const intent = this.extractIntent(user, response);
                next(intent);
            }
        );
    }

    preIntentRecognition(speech) {
        for (let s of CONTRACTION_SUBSTITUTIONS) {
            speech = replace(speech, s[0], s[1]);
        }
        speech = replace(speech, "'", "");
        return speech;
    }

    stringifyIntent(name, args) {
        let string = name;
        if (args.length > 0) {
            string = `${string}(${args.join(", ")})`;
        }
        return string;
    }

    extractIntent(user, rasaResponse) {
        const name = rasaResponse.intent.name;
        let args = [];
        if (rasaResponse.entities) {
            args = rasaResponse.entities.map((entity) => entity.value);
        }
        let string = this.stringifyIntent(name, args);
        return { user, name, args, string };
    }
}

module.exports = IntentRecogniser;
