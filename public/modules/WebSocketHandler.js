import {RTCPeer} from "./RTCPeer.js";

export class WebSocketHandler {

    constructor(controller, url, resolve) {

        this.controller = controller;

        console.log("connecting websocket");
        this.socket = io(url);
        this.socket.connect();

        this.initEventListeners(resolve);

    }

    initEventListeners(resolve) {
        this.socket.on("connect", () => {
            console.log("websocket connected!");
            resolve();
        });

        this.socket.on("disconnect", () => {
            console.log("websocket disconnected!");
        });

        this.socket.on("updateJoinableSessionList", (data) => {
            if (!this.controller.gameSession
                && controller.activeScreen.populateSessionsList) {
                controller.activeScreen.populateSessionsList(data);
            }
        });

        this.socket.on("updateGameSession", (gameSession) => {
            this.controller.gameSession = gameSession;
            // TODO update list
            // TODO iterate over players, update scores etc.
            console.log(gameSession);
            console.log(this.controller.activeScreen.getState());

            // title state
            if (this.controller.activeScreen.getState() === "title-init" ||
                this.controller.activeScreen.getState() === "title-lobby") {
               this.controller.activeScreen.setPlayerNames(gameSession.players);
            }

        });

        this.socket.on("updatePlayer", (player) => {
            this.controller.player = player;
            // document.querySelectorAll(".player-waiting")[0].innerHTML = player.nickname;
            document.querySelectorAll(".player-name")[0].innerHTML = player.nickname;
            console.log(player);
        });

        this.socket.on("signalRTC", (data) => {
            // console.log(data);
            // get corresponding rtcPeer based on data.player
            // if this is the first signal, it does not exist yet and needs to be created
            let rtcPeer = controller.rtcPeers[data.player.uuid];
            if (!rtcPeer) {
                rtcPeer = new RTCPeer(false, data.player);
                controller.rtcPeers[data.player.uuid] = rtcPeer;
            }
            // signal the rtcPeer
            rtcPeer.signal(data.signalData);
        });

    }

    getAllJoinableSessions(callback) {
        this.socket.emit("getAllJoinableSessions", {}, callback);
    }

    // callback(sessionName)
    createGameSession(callback) {
        this.socket.emit("newSession", {nickname: $("#nicknameInput").val()}, callback);
    }

    // callback({message: "OK" | "does not exist" | "has started", currentPlayerList})
    joinGameSession(sessionName, callback) {
        this.socket.emit("joinSession", {nickname: $("#nicknameInput").val(), sessionName}, callback);
    }

    sendRtcSignal(signalData, otherPlayerId) {
        this.socket.emit("signalRTC", {signalData, otherPlayerId});
    }

    // TODO notify that posenet is ready (otherwise start should not be possible)
    // TODO start the session (only for gameMaster -> some flag for that (gamemaster is the one who creates a session)


}
