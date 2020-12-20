import {Canvas} from '../components/Canvas.js';
import {globals} from '../globals.js'
import {SpeechRecognizer} from "../SpeechRecognizer.js";
import {BodyParts} from "../PoseDetector.js";

const ROUND_STATES = {
    "TASK_INPUT": 1,
    "DRAWING": 2,
    "RATING": 3,
    "FINISHED": 4
}

export class Game {
    constructor(poseDetector) {
        // init
        // this.player = player;
        this.state = ROUND_STATES.TASK_INPUT;

        this.canvas = null;
        this.canvasLeft = null;
        this.canvasRight = null;

        if (controller.player.currentRole === "drawer") {

            document.querySelector("#game-viewer").className = "hidden";
            document.querySelector("#game-drawer").className = "flex-centered";

            this.poseDetector = poseDetector;
            this.isDrawing = false;

            $("#bodyPartSelect").val(controller.player.bodyPart);

            console.log("The player");
            console.log(controller.player);

            this.showUserInfo();

        } else if (controller.player.currentRole === "viewer") {
            document.querySelector("#game-viewer").className = "flex-centered";
            document.querySelector("#game-drawer").className = "hidden";

            $("#term-input-wrapper").show();

            this.canvasLeft = new Canvas("canvas-left");
            this.canvasRight = new Canvas("canvas-right");

        } else {
            document.querySelector("#game-viewer").className = "hidden";
            document.querySelector("#game-drawer").className = "hidden";
            toastr.error("No role defined for player!");
        }

        console.log("Game initialized.");
    }

    startDrawing() {

        toastr.info("Draw using your: " + $("#bodyPartSelect").val());

        // speech
        this.speechRecognizer = new SpeechRecognizer(this);
        this.speechRecognizer.startRecognition();
        this.canvas = new Canvas("canvas");
        $('#pointer').show(); // show pointer

        // pose detection
        this.startPoseDetection();
        this.isDrawing = true;
    }

    stopDrawing() {
        this.poseDetector.stopDetectionLoop();
        this.speechRecognizer.stopRecognition();
    }

    resumeDrawing() {
        this.isDrawing = true;
    }

    pauseDrawing() {
        this.isDrawing = false;
        this.lastPosition = null;
    }

    showUserInfo() {
        // document.getElementById("game-info").classList.remove("hidden");
        document.getElementById("game-info").className = "flex-centered";
    }

    confirmDrawTerm() {
        let term = document.querySelector("#term-input").value;
        controller.websocketHandler.sendDrawTerm(term);

        // TODO: state transition: drawing/viewing
    }

    retry() {
        this.canvas.clear();
    }

    async startPoseDetection() {
        // find current bodypart
        let bpSelect = document.getElementById("bodyPartSelect");
        const bodyPart = BodyParts[bpSelect.value];
        console.log(`Start detection, bodypart: ${bpSelect.value}`);

        await this.poseDetector.stopDetectionLoop();
        this.lastPosition = null;
        this.poseDetector.startDetectionLoop(this, bodyPart, (position) => {
            // console.log(position);
            if (this.isDrawing && this.lastPosition) {
                this.canvas.draw(this.lastPosition, position, globals.selectedLineWidth, globals.selectedColor)
            }
            this.canvas.movePointer(position);
            this.lastPosition = position;

            for (let rtcPeer of Object.values(controller.rtcPeers)) {
                // rtcPeer.sendPosition(position);
                rtcPeer.sendImage(this.canvas.toBase64());
            }
        });
    }

    getState() {
        return this.state;
    }

    leftCanvasClicked() {
        if (this.state === ROUND_STATES.RATING) {
            const playerId = Object.values(controller.rtcPeers).filter(peer => peer.canvasSide === "left").map(peer => peer.otherPlayerId)[0];
            controller.websocketHandler.sendRating(playerId);

            console.log(playerId + " gets a point");
            // TODO find the nick of this player
            toastr.success(playerId + " gets a point");
            toastr.success("Next round will start in 10 seconds");
            setTimeout(() => {
                controller.websocketHandler.startRound();
            }, 10000);

        }
    }

    rightCanvasClicked() {
        if (this.state === ROUND_STATES.RATING) {
            const playerId = Object.values(controller.rtcPeers).filter(peer => peer.canvasSide === "right").map(peer => peer.otherPlayerId)[0];
            controller.websocketHandler.sendRating(playerId);

            console.log(playerId + " gets a point");
            // TODO find the nick of this player
            toastr.success(playerId + " gets a point");
            toastr.success("Next round will start in 10 seconds");
            setTimeout(() => {
                controller.websocketHandler.startRound();
            }, 10000);
        }
    }

}
