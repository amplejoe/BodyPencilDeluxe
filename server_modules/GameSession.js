class GameSession {

    static GAME_STATES = {
        "LOBBY": 0,
        "TASK_INPUT": 1,
        "DRAWING": 2,
        "RATING": 3,
        "FINISHED": 4
    }

    constructor(sessionName) {
        this.sessionName = sessionName;
        this.players = [];
        this.state = GameSession.GAME_STATES.LOBBY;
    }

    // TODO emit "updateGameSession" event when something changes

    isJoinable() {
        return this.state === GameSession.GAME_STATES.LOBBY && this.players.length < 3;
    }

    addPlayer(player) {
        if (this.state === GameSession.GAME_STATES.LOBBY) {
            this.players.push(player);
        } else {
            console.log("cannot add player in game state " + this.state);
        }
    }

}

module.exports = GameSession;
