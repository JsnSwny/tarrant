const Room = require("./Room");

class RoomManager {

	constructor() {

		this.waitingRooms = [];
		this.activeRooms = {};

	}

	assignToRoom(socket) {

		let room;
		if (this.waitingRooms.length > 0) {
			room = this.waitingRooms.shift();
		}
		else {
			room = this.createNewRoom();
			this.waitingRooms.push(room);
		}

		room.addUser(socket);

		return room;

	}

}

module.exports = RoomManager;
