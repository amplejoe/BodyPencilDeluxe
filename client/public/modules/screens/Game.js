import {Canvas} from '../components/Canvas.js';
import {globals} from '../globals.js'
import {SpeechRecognizer} from "../SpeechRecognizer.js";
import {BodyParts} from "../PoseDetector.js";

export class Game {
    constructor(poseDetector) {
        // init
        this.poseDetector = poseDetector;
        this.isDrawing = false;

        // speech
        this.speechRecognizer = new SpeechRecognizer(this);
        this.speechRecognizer.startRecognition();
        this.canvas = new Canvas();
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
        });
    }
}
