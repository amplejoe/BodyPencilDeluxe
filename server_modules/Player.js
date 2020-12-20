const {v4: uuidv4} = require('uuid');

class Player {

    constructor() {
        this.uuid = uuidv4();
        this.nickname = null;
        this.score = 0;
        this.currentRole = null;     // "drawer" | "viewer"
        this.bodyPart = null;
        this.gameMaster = false;
    }
}

module.exports = Player;
