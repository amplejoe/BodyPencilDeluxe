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

        this.playerToSocketMap = {};  // auxiliary map from player uuid -> socket
        // TODO keep this clean (i.e. upon disconnect)

        this.io.on('connection', this.playerConnected.bind(this));
    }

    playerConnected(socket) {
        const player = new Player();
        console.log("new player connected " + player.uuid);

        socket.player = player;
        this.playerToSocketMap[player.uuid] = socket;
        // we need this map for exchange of RTC signals
        // we could also set the socket as a member of player,
        // but then we cannot send the object to the client (because socket is a too complex object)

        socket.on('getAllJoinableSessions', (data, callback) => {
            // TODO all sessions in LOBBY state
            // TODO an alle sockets push benachrichtigung über joinable sessions wenn,
            //      - startSession
            //      - removeSession (gamemaster
        });

        socket.on('newSession', (data, callback) => {

            // nickname is set when starting or joining a session
            player.nickname = data.nickname;
            player.gameMaster = true;   // the player who creates the session is the game master

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

            // nickname is set when starting or joining a session
            player.nickname = data.nickname;


            // TODO check if session is still joinable (in LOBBY state)
            // TODO  wenn 3 spieler (voll) -> nicht joinable
            // TODO  extract method getJoinableSessions()
            //             - LOBBY state, gamemaster vorhanden, weniger als 3 spieler
            const sessionName = data.sessionName;
            const gameSession = this.gameServer.gameSessions[sessionName];
            if (gameSession) {
                gameSession.addPlayer(player);
                socket.gameSession = gameSession;
                console.log(gameSession.players);
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

        socket.on('signalRTC', data => {
            let otherSocket = this.playerToSocketMap[data.otherPlayer.uuid];
            if (otherSocket) {
                otherSocket.emit('signalRTC', {signalData: data.signalData, player: player});
            } else {
                console.log("found no socket for player " + data.otherPlayer.uuid);
            }
        });


        socket.on('disconnect', () => {
            // TODO handle disconnection
            const sessionName = (socket.gameSession) ? socket.gameSession.sessionName : null;
            console.log(`player disconnected: ${player.uuid}; session: ${sessionName}; gameMaster: ${player.gameMaster}`);

            if (player.gameMaster) {
                // TODO if player.gameMaster -> abort session -> disconnect all sockets of this session
                //      -> session aus session liste löschen + push emit joinableSessions
            }

        });

        socket.on('error', (error) => {
            // TODO handle errors
            console.log("socket error " + error);
        });

    }

}


module.exports = SocketHandler;
