export class WebSocketHandler {

    constructor(controller, url, resolve) {

        this.controller = controller;

        console.log("connecting websocket");
        this.socket = io(url);
        this.socket.connect();

        this.initEventListeners(resolve);

        // TODO: TMP remove and resolve on socket connect
        console.log("TMP: Websockethandler resolving after 2000ms...");
        setTimeout(
            () => {
                console.log("... Websockethandler connected!");
                resolve();
            }, 2000
        );
    }

    initEventListeners(resolve) {
        this.socket.on("connect", () => {
            console.log("websocket connected!");
            resolve();
        });

        this.socket.on("disconnect", () => {
            console.log("websocket disconnected!");
        });

        this.socket.on("updateJoinableSessionList", (sessions) => {
            // TODO update list
        });

        this.socket.on("updateGameSession", (gameSession) => {
            this.controller.gameSession = gameSession;
        });

        this.socket.on("updatePlayer", (player) => {
            this.controller.player = player;
        });


    }

    getAllJoinableSessions(callback) {
        this.socket.emit("getAllJoinableSessions", {}, callback);
    }

    // callback(sessionName)
    createGameSession(callback) {
        // TODO create a input #nicknameInput
        this.socket.emit("newSession", {nickname: $("#nicknameInput").val()}, callback);
    }

    // callback({message: "OK" | "does not exist" | "has started", currentPlayerList})
    joinGameSession(sessionName, callback) {
        // webRTC negotiation: every time a client joins,
        // it gets a list of all previous clients and sends an webrtc offer to each
        this.socket.emit("joinSession", {nickname: $("#nicknameInput").val(), sessionName}, callback);
    }

    // TODO notify that posenet is ready (otherwise start should not be possible)
    // TODO start the session (only for gameMaster -> some flag for that (gamemaster is the one who creates a session)


}
