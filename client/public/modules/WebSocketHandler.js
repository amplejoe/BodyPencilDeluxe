export class WebSocketHandler {

    constructor(controller, url) {

        this.controller = controller;

        console.log("connecting websocket");
        this.socket = io(url, {
            query: {
                nickname: "johndoe"
            }
        });
        this.socket.connect();

        this.initEventListeners();
    }

    initEventListeners() {
        this.socket.on("connect", () => {
            console.log("websocket connected!");
        });

        this.socket.on("disconnect", () => {
            console.log("websocket disconnected!");
        })

        this.socket.on("updatePlayer", (player) => {
            this.controller.player = player;
        });
    }

    // callback(sessionName)
    createGameSession(callback) {
        this.socket.emit("newSession", {}, callback);
    }

    // callback({message: "OK" | "does not exist", currentPlayerList})
    joinGameSession(sessionName, callback) {
        // webRTC negotiation: every time a client joins,
        // it gets a list of all previous clients and sends an webrtc offer to each
        this.socket.emit("joinSession", {sessionName}, callback);
    }

    // TODO notify that posenet is ready (otherwise start should not be possible)
    // TODO start the session (only for gameMaster -> some flag for that (gamemaster is the one who creates a session)




}
