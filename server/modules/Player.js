class Player {

    constructor(nickname, websocket) {
        console.log("creating player " + nickname);
        this.nickname = nickname;
        this.score = 0;
        this.websocket = websocket;
    }

}

module.exports = Player;
