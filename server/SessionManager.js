const { randomInt } = require("./functions");

class SessionManager {
    constructor() {
        this.sessions = {};
    }

    createNewSession() {
        const serialNumber = this.createSerialNumber();
        const session = {};
        this.sessions[serialNumber] = session;
        return session;
    }

    createSerialNumber() {
        return randomInt(1000, 9999).toString();
    }
}

module.exports = SessionManager;
