const io = require('socket.io');
let faker = require('faker');
const GameSession = require("./GameSession");
const Player = require("./Player");

class SocketHandler {

    constructor(http, gameServer) {
        this.gameServer = gameServer;
        this.io = io(http, {
            cors: {
                origin: '*',
            }
        });
        this.io.on('connection', this.playerConnected.bind(this));
    }

    playerConnected(socket) {
        console.log("new player connected");

        // TODO assign unique id to player  (uuid)

        socket.on('getAllJoinableSessions', (data, callback) => {
            // TODO all sessions in LOBBY state
            // TODO an alle sockets push benachrichtigung über joinable sessions wenn,
            //      - startSession
            //      - removeSession (gamemaster
        });

        socket.on('newSession', (data, callback) => {

            const player = new Player(data.nickname, socket);
            socket.player = player;

            const sessionName = faker.fake("{{company.catchPhrase}}"); // TODO ensure uniqueness
            const gameSession = new GameSession(sessionName);
            gameSession.addPlayer(player);
            socket.gameSession = gameSession;

            this.gameServer.gameSessions[sessionName] = gameSession;

            // TODO return player object
            callback({sessionName: sessionName});

            this.gameServer.printState();

        });
        socket.on('joinSession', (data, callback) => {

            const player = new Player(data.nickname, socket);
            socket.player = player;

            // TODO check if session is still joinable (in LOBBY state)
            // TODO  wenn 3 spieler (voll) -> nicht joinable
            // TODO  extract method getJoinableSessions()
            //             - LOBBY state, gamemaster vorhanden, weniger als 3 spieler
            const sessionName = data.sessionName;
            const gameSession = this.gameServer.gameSessions[sessionName];
            if (gameSession) {
                gameSession.addPlayer(player);
                socket.gameSession = gameSession;
                callback({message: "OK", currentPlayerList: gameSession.players});
            } else {
                callback({err: `Session ${sessionName} does not exist or has already been started`});
            }

            // TODO emit updateGameSession for all current player of the session

            this.gameServer.printState();
        });

        socket.on('startSession', (data, callback) => {
            // TODO
        });

        socket.on('offerRTC', (data, callback) => {

        });


        socket.on('disconnect', () => {
            // TODO handle disconnection
            const session = (socket.gameSession) ? socket.gameSession.sessionName : null;
            console.log(`player disconnected: ${player.nickname}; session: ${session}`);

            // TODO if player.gameMaster -> abort session -> disconnect all sockets of this session
            //      -> session aus session liste löschen + push emit joinableSessions

        });

        socket.on('error', (error) => {
            // TODO handle errors
            console.log("socket error " + error);
        });

    }

}


module.exports = SocketHandler;
