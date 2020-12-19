const socketio = require('socket.io');
let faker = require('faker');
const GameSession = require("./GameSession");
const Player = require("./Player");

class SocketHandler {

    constructor(http, gameServer) {
        this.gameServer = gameServer;
        this.io = socketio(http, {
            cors: {
                origin: '*',
            }
        });
        this.io.on('connection', this.playerConnected.bind(this));
    }

    playerConnected(socket) {
        console.log("new player connected");

        const nickname = socket.request._query.nickname;
        const player = new Player(nickname, socket);
        socket.player = player;

        socket.on('newSession', (data, callback) => {

            const sessionName = faker.fake("{{company.catchPhrase}}"); // TODO ensure uniqueness
            const gameSession = new GameSession(sessionName);
            gameSession.addPlayer(player);
            socket.gameSession = gameSession;

            this.gameServer.gameSessions[sessionName] = gameSession;

            callback({sessionName: sessionName});

            this.gameServer.printState();

        });
        socket.on('joinSession', (data, callback) => {
            const sessionName = data.sessionName;
            const gameSession = this.gameServer.gameSessions[sessionName];
            if (gameSession) {
                gameSession.addPlayer(player);
                socket.gameSession = gameSession;
                callback({message: "OK"});
            } else {
                callback({err: `Session ${sessionName} does not exist`});
            }

            this.gameServer.printState();
        });

        socket.on('offerRTC', (data, callback) => {

        });


        socket.on('disconnect', () => {
            // TODO handle disconnection
            const session = (socket.gameSession) ? socket.gameSession.sessionName : null;
            console.log(`player disconnected: ${player.nickname}; session: ${session}`);
        });

        socket.on('error', (error) => {
            // TODO handle errors
            console.log("socket error " + error);
        });

    }

}


module.exports = SocketHandler;
