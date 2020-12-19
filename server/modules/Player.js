class Player {

    // TODO add gameSession?
    constructor(nickname, websocket) {
        console.log("creating player " + nickname);
        this.nickname = nickname;
        this.score = 0;
        this.currentRole;   // TODO  drawer | viewer
        this.ready = false; // TODO set to true when posenet is loaded
        this.gameMaster = false;    // TODO set true if new session
        // this.websocket = websocket;  // TODO do we really need that? -> makes problems when we try to send that to a client
    }

    // TODO emit "updatePlayer" event when something changes

}

module.exports = Player;
