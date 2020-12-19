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
        this.lastPosition = null; // TODO is this the right place for this variable?
        // TODO start the loop based on game logic (and start command)
        const bodyPart = BodyParts.nose; // TODO make selectable / randomly assigned
        this.startPoseDetection(bodyPart)

        console.log("Game initialized.");
    }

    startPoseDetection(bodyPart) {
        this.poseDetector.startDetectionLoop(bodyPart, (position) => {
            // console.log(position);
            if (this.lastPosition) {
                this.canvas.draw(this.lastPosition, position, 3, globals.selectedColor)
            }
            this.lastPosition = position;
        });
        // TODO remove!  (just for testing)
        setTimeout(() => {
            this.poseDetector.stopDetectionLoop();
            this.speechRecognizer.stopRecognition();
        }, 60000);
    }
}
