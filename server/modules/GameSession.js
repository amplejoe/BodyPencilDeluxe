const GAME_STATES = {
    "LOBBY": 0,
    "TASK_INPUT": 1,
    "DRAWING": 2,
    "RATING": 3
}

class GameSession {

    constructor(sessionName) {
        this.sessionName = sessionName;
        this.players = [];
        this.state = GAME_STATES.LOBBY;
    }

    // TODO emit "updateGameSession" event when something changes

    addPlayer(player) {
        if (this.state === GAME_STATES.LOBBY) {
            player.gameSession = this;
            this.players.push(player);
        } else {
            console.log("cannot add player in game state " + this.state);
        }
    }

}

module.exports = GameSession;
