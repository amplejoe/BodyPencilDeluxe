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
            console.log(gameSession);
            console.log(this.controller.activeScreen.getState());

            // title state
            if (this.controller.activeScreen.getState() === "title-init" ||
                this.controller.activeScreen.getState() === "title-lobby") {
                this.controller.activeScreen.setPlayerNames(gameSession.players);
                if (gameSession.players.length === 3 && controller.player.gameMaster) {
                    this.controller.activeScreen.enableGameStart();
                }
            } else {
                // show drawTerm
                $("#drawTerm").html(gameSession.drawTerm);

                //  update scores
                $(".player-score").show();
                // gameSession.players
                // TODO update scores (find correct slot)
            }

        });

        this.socket.on("roundStarted", (gameSession) => {
            controller.switchScreen('game');
        });

        this.socket.on("confirmStartDrawing", () => {
            if (controller.player.currentRole === "drawer") {
                controller.activeScreen.startDrawing();
            }
        });

        this.socket.on("tick", (time) => {
            $("#timer").html(time + " sec");
        });

        this.socket.on("timeover", (gameSession) => {
            $("#timer").html("time over");
            if (controller.player.currentRole === "drawer") {
                controller.activeScreen.stopDrawing();
            } else {
                controller.activeScreen.state = 3; // 3 == RATING
                toastr.success("Click on the winner drawing");
            }
        });

        this.socket.on("updatePlayer", (player) => {
            this.controller.player = player;
            // document.querySelectorAll(".player-waiting")[0].innerHTML = player.nickname;
            // document.querySelectorAll(".player-name")[0].innerHTML = player.nickname;
            // document.querySelector("#session-name-info").innerHTML = this.controller.gameSession.sessionName;
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

    startRound() {
        this.socket.emit("startRound", {});
    }

    sendDrawTerm(term) {
        this.socket.emit("startDrawing", term);
        $("#term-input-wrapper").hide();
    }

    sendRating(playerId) {
        this.socket.emit("sendRating", playerId);
    }

    sendRtcSignal(signalData, otherPlayerId) {
        this.socket.emit("signalRTC", {signalData, otherPlayerId});
    }

}
