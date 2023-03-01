class IntentRecogniser {

    constructor() {

    }

    // TODO: Call Zein's RASA intent-recognition system from this function.
    recogniseIntent(userSpeech, next) {
        next({ "value": "EXAMPLE_INTENT" });
    }

}

module.exports = IntentRecogniser;
