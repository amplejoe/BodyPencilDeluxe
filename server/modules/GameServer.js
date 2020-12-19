const SocketHandler = require("./SocketHandler");

class GameServer {

    constructor() {

    }

    start(http) {
        this.gameSessions = {};
        this.socketHandler = new SocketHandler(http, this);

    }

    printState() {
        console.log(this.gameSessions);
    }

}


var instance = null;
var getInstance = function () {
    if (instance === null) {
        instance = new GameServer();
    }
    return instance;
}

module.exports = getInstance(); // singleton object, same for all modules
