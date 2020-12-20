const {v4: uuidv4} = require('uuid');

class Player {

    constructor() {
        this.uuid = uuidv4();
        this.nickname = null;
        this.score = 0;
        this.currentRole = null     // TODO  drawer | viewer
        this.gameMaster = false;
    }

    // TODO emit "updatePlayer" event when something changes

}

module.exports = Player;
