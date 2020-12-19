import {Canvas} from '../components/Canvas.js';
import {globals} from '../globals.js'
import {SpeechRecognizer} from "../SpeechRecognizer.js";
import {BodyParts} from "../PoseDetector.js";

export class Game {
    constructor(poseDetector) {
        this.poseDetector = poseDetector;
        this.speechRecognizer = new SpeechRecognizer(this.poseDetector);
        this.speechRecognizer.startRecognition();
        this.canvas = new Canvas();

        // start detection

        // TODO start the loop based on game logic (and start command)
        this.startPoseDetection();

        // TODO remove!  (just for testing)
        setTimeout(() => {
            this.poseDetector.stopDetectionLoop();
            this.speechRecognizer.stopRecognition();
        }, 60000);

        console.log("Game initialized.");
    }

    startPoseDetection() {
        // find current bodypart
        let bpSelect = document.getElementById("bodyPartSelect");
        const bodyPart = BodyParts[bpSelect.value];
        console.log(`Start detection, bodypart: ${bpSelect.value}`);

        this.lastPosition = null; // TODO is this the right place for this variable?
        this.poseDetector.stopDetectionLoop();
        this.poseDetector.startDetectionLoop(bodyPart, (position) => {
            // console.log(position);
            if (this.lastPosition) {
                this.canvas.draw(this.lastPosition, position, 3, globals.selectedColor)
            }
            this.lastPosition = position;
        });
    }
}
