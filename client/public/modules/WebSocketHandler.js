export class WebSocketHandler {

    constructor(url) {
        console.log("connecting websocket");
        this.socket = io(url, {
            query: {
                nickname: "johndoe"
            }
        });
        this.socket.connect();

        this.socket.on("connect", () => {
            console.log("websocket connected!");
        })

    }

    createGameSession(callback) {
        this.socket.emit("newSession", {}, callback);
    }

    joinGameSession(sessionName, callback) {
        this.socket.emit("joinSession", {sessionName}, callback);
    }

}
