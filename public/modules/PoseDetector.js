export const BodyParts = {
    nose: 0,
    leftEye: 1,
    rightEye: 2,
    leftEar: 3,
    rightEar: 4,
    leftShoulder: 5,
    rightShoulder: 6,
    leftElbow: 7,
    rightElbow: 8,
    leftWrist: 9,
    rightWrist: 10,
    leftHip: 11,
    rightHip: 12,
    leftKnee: 13,
    rightKnee: 14,
    leftAnkle: 15,
    rightAnkle: 16
}

export class PoseDetector {
    constructor(videoElement, minScore = 0.3, windowSize = 11) {
        this.videoElement = videoElement;
        this.minScore = minScore;
        this.windowSize = windowSize;
        this.ringBuffer = [];   // TODO import ring buffer and perform smoothing and filtering

        this.poseNet = null;
        this.running = false;
        // this.paused = false;
        this.videoWidth = this.videoElement.width;  // needed for
        this.videoHeight = this.videoElement.height;
    }

    // https://github.com/tensorflow/tfjs-models/tree/master/posenet
    async init(useResNet = false) {
        console.log("loading posenet...");
        if (await this.connectWebcam()) {

            let posenetConfig;
            if (useResNet) {
                posenetConfig = {
                    architecture: 'ResNet50',
                    outputStride: 32,
                    inputResolution: {width: 257, height: 200},
                    quantBytes: 2
                };
            } else {
                posenetConfig = {
                    architecture: 'MobileNetV1',
                    outputStride: 16,
                    inputResolution: {width: 640, height: 480},
                    multiplier: 0.75
                };
            }
            this.poseNet = await posenet.load(posenetConfig);

            // the first pose estimation call takes significantly longer than subsequent ones,
            // so do it once before the actual game starts
            await this.poseNet.estimateSinglePose(this.videoElement);

            console.log("posenet ready!");
        }
    }

    async connectWebcam() {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            alert("getUserMedia() is not supported by your browser");
            return false;
        } else {
            const constraints = {
                video: true,
                audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = stream;

            $("#player video")[0].srcObject = stream;

            return true;
        }
    }

    async startDetectionLoop(game, bodyPart, callback) {
        this.game = game;
        if (!this.running) {
            this.running = true;
            while (this.running) {
                const ts = new Date();
                this.estimationInProgress = true;
                const pose = await this.poseNet.estimateSinglePose(this.videoElement, {
                    flipHorizontal: true
                });
                this.estimationInProgress = false;
                if (this.stopCallback) {
                    this.stopCallback();
                    this.stopCallback = null;
                }
                const ts2 = new Date();
                const duration = ts2 - ts;
                const fps = Math.round(1000 / duration);
                $("#fps").html(`FPS: ${fps}`);

                if (pose && pose.keypoints && pose.keypoints[bodyPart]) {
                    const position = pose.keypoints[bodyPart].position;
                    // normalize
                    position.x = position.x / this.videoWidth;
                    position.y = position.y / this.videoHeight;
                    // "return" via callback (but only if within the screen and with a minimum confidence score)
                    // TODO perform a better filtering and smoothing (using a window)
                    if (pose.score > this.minScore
                        && position.x >= 0 && position.x <= 1
                        && position.y >= 0 && position.y <= 1) {
                        callback(position);
                    }
                }
            }
        }
    }

    async stopDetectionLoop() {
        return new Promise((resolve, reject) => {
            this.running = false;
            if (this.estimationInProgress) {
                this.stopCallback = resolve;
            } else {
                resolve();
            }
        });
    }

}
