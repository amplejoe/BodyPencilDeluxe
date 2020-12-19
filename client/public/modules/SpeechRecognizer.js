import {globals} from "./globals.js";

export class SpeechRecognizer {

    static colors = ["black", "red", "blue", "green", "yellow", "orange", "brown"];
    static commands = ["stop", "go", "small", "medium", "large"]; // plus", "minus"];

    // TODO extend with further common misunderstandings
    static toleranceMap = {
        "brad": "red",
        "brett": "red",
        "rat": "red",
        "rad": "red",
        "bread": "red",
        "rate": "red",
        "rhett": "red",
        "queen": "green",
        "cream": "green",
        "continue": "go",
        "midi": "medium",
        "media": "medium",
        "notch": "large",
        "latch": "large",
        "trump": "yellow",
        // "mine": "minus",
        // "mine is": "minus",
        // "minor": "minus"
    }

    constructor(poseDetector) {
        this.poseDetector = poseDetector; // we need the poseDetector to call the pause() function

        let SpeechRecognition_ = window.SpeechRecognition || webkitSpeechRecognition;
        let SpeechGrammarList_ = window.SpeechGrammarList || webkitSpeechGrammarList;

        // TODO how exactly does this work?
        // TODO consider the non-color commands in the grammar?
        let grammar = '#JSGF V1.0; grammar colors; public <color> = ' + SpeechRecognizer.colors.join(' | ') + ' ;'

        let speechRecognitionList = new SpeechGrammarList_();
        speechRecognitionList.addFromString(grammar, 1);

        this.recognition = new SpeechRecognition_();
        this.recognition.grammars = speechRecognitionList;
        this.recognition.continuous = true;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;

        // remember the highest index of the results array that has already been identified as valid command
        this.latestValidResultIdx = -1;

        this.initHandlers();
    }

    initHandlers() {
        this.recognition.onresult = (event) => {
            // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
            // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
            // It has a getter so it can be accessed like an array
            // The first [0] returns the SpeechRecognitionResult at the last position.
            // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
            // These also have getters so they can be accessed like arrays.
            // The second [0] returns the SpeechRecognitionAlternative at position 0.
            // We then return the transcript property of the SpeechRecognitionAlternative object

            // consider every result (also non-final results) -> faster reaction (otherwise noticeable delay)
            // consider the 3 most probable alternatives
            // consider list of frequent misunderstandings (tolerance list)
            // if something is recognized -> remember this array position and don't consider again (e.g., if a final result arrives later)

            let latestResultIdx = event.results.length - 1;
            if (latestResultIdx > this.latestValidResultIdx) {  // ignore further versions of the same result if it has already been identified as valid
                let latestResult = event.results[latestResultIdx];
                for (let alternative of latestResult) {
                    if (this.commandDetected(alternative.transcript)) {
                        this.latestValidResultIdx = latestResultIdx;
                        console.log("latest valid result: " + latestResultIdx);
                        break;
                    }
                }
            }
        }

        // only means that for some time, no speech has been detected
        this.recognition.onspeechend = () => {
            // console.log("speech ended");
        }

        this.recognition.onnomatch = (event) => {
            console.log("I didn't recognise that command");
        }

        this.recognition.onerror = (event) => {
            // no-speech is not really an error, it just means that for some time, nothing was received
            // but we still need to continue listening
            if (event.error != "no-speech") {
                console.log('Error occurred in recognition: ' + event.error);
            }
        }

        this.recognition.onend = () => {
            // restart... (this happens when the "no-speech" error is thrown)
            this.recognition.start();
        }
    }

    commandDetected(recognizedPhrase) {
        let command = recognizedPhrase.trim().toLowerCase();

        // account for common mistakes (e.g., Bratt instead of red...)
        if (SpeechRecognizer.toleranceMap[command]) {
            console.log("understood " + command + " -> " + SpeechRecognizer.toleranceMap[command]);
            command = SpeechRecognizer.toleranceMap[command];
        }

        console.log("command: " + command);

        if (command === "stop") {
            this.poseDetector.pauseDetectionLoop();
            document.getElementById("draw-status").style.backgroundColor = "gray";
        } else if (command === "go") {
            this.poseDetector.resumeDetectionLoop();
            document.getElementById("draw-status").style.backgroundColor = "red";
            if (controller.activeScreen.canvas) {
              controller.activeScreen.canvas.drawBegin();
            }
        } else if (command === "small") {
            globals.selectedLineWidth = 2;
            document.getElementById("line-status").innerHTML = "small";
        } else if (command === "medium") {
            globals.selectedLineWidth = 5;
            document.getElementById("line-status").innerHTML = "medium";
        } else if (command === "large") {
            globals.selectedLineWidth = 10;
            document.getElementById("line-status").innerHTML = "large";
        } else if (SpeechRecognizer.colors.includes(command)) {
            globals.selectedColor = command;
            document.getElementById("color-status").style.backgroundColor = command;
            this.poseDetector.resumeDetectionLoop();
            document.getElementById("draw-status").style.backgroundColor = "red";
        } else {
            return false;
        }

        return true;
    }

    startRecognition() {
        this.recognition.start();
        console.log('speech recognition started');
    }

    stopRecognition() {
        this.recognition.stop();
        console.log("speech recognition stopped");
    }
}
