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

            console.log("The player");
            console.log(controller.player);

            // speech
            this.speechRecognizer = new SpeechRecognizer(this);
            this.speechRecognizer.startRecognition();
            this.canvas = new Canvas("canvas");
            $('#pointer').show(); // show pointer

            // pose detection
            // TODO start the loop based on game logic (and start command)
            this.startPoseDetection();
            this.startDrawing();

            // TODO remove!  (just for testing)
            setTimeout(() => {
                this.poseDetector.stopDetectionLoop();
                this.speechRecognizer.stopRecognition();
            }, 60000);

            this.showUserInfo();

        } else if (controller.player.currentRole === "viewer") {
            document.querySelector("#game-viewer").className = "hidden";
            document.querySelector("#game-drawer").className = "flex-centered";

            this.canvasLeft = new Canvas("canvas-left");
            this.canvasRight = new Canvas("canvas-right");

        } else {
            toastr.error("No role defined for player!");
        }




        console.log("Game initialized.");
    }

    showUserInfo() {
        // document.getElementById("game-info").classList.remove("hidden");
        document.getElementById("game-info").className = "flex-centered";
    }

    startDrawing() {
        this.isDrawing = true;
    }

    pauseDrawing() {
        this.isDrawing = false;
        this.lastPosition = null;
    }

    confirmDrawTerm(){
        let term = document.querySelector("#term-input").value;
        console.log(term);
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
                rtcPeer.sendPosition(position);
            }
        });
    }

    getState() {
        return this.state;
    }

    getRole() {
        return this.player.role;
    }
}
