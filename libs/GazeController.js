import { Clock, Vector3, Matrix4 } from "./three/three.module.js";
import { RingProgressMesh } from './RingProgressMesh.js';

class GazeController {
    static Modes = { HIDDEN: 1, GAZING: 2, MOVE: 3 };

    constructor(scene, camera) {
        if (!scene) {
            throw new Error('GazeController requires a THREE.Scene instance passed to the constructor');
        }
        if (!camera || !(camera instanceof THREE.Camera)) {
            throw new Error('GazeController requires a valid THREE.Camera instance passed to the constructor');
        }

        this.clock = new Clock();
        this.ring = new RingProgressMesh(0.2);
        this.ring.visible = false;
        this.direction = new Vector3();
        this.mat4 = new Matrix4();
        this.camera = camera;
        this.mode = GazeController.Modes.HIDDEN;
        this.confirmationThreshold = 1.5; // Example threshold for confirming action after gazing

        // Position the ring in front of the camera
        this.ring.position.set(0, 0, -1);
        this.ring.lookAt(this.camera.position);
        camera.add(this.ring);
    }

    set mode(value) {
        this.modeTime = this.clock.getElapsedTime();
        this.mat4.identity().extractRotation(this.camera.matrixWorld);
        this.direction.set(0, 0, -1).applyMatrix4(this.mat4);
        this._mode = value;

        // Dispatch event when mode changes
        const event = new CustomEvent('modeChange', { detail: { mode: this._mode } });
        window.dispatchEvent(event);
    }

    get mode() {
        return this._mode;
    }

    update() {
        const elapsedTime = this.clock.getElapsedTime() - this.modeTime;
        this.mat4.identity().extractRotation(this.camera.matrixWorld);
        const currentDirection = this.direction.set(0, 0, -1).applyMatrix4(this.mat4);
        const theta = this.vec3.angleTo(currentDirection);

        switch (this._mode) {
            case GazeController.Modes.HIDDEN:
                if (elapsedTime > this.confirmationThreshold) {
                    this.mode = GazeController.Modes.GAZING;
                    this.ring.visible = true;
                } else if (theta > 0.2) {
                    this.mode = GazeController.Modes.HIDDEN;
                    this.ring.visible = false;
                }
                break;
            case GazeController.Modes.GAZING:
                if (elapsedTime > this.confirmationThreshold) {
                    this.mode = GazeController.Modes.MOVE;
                    this.ring.visible = false;
                    this.confirmAction(); // Example function to confirm action after gazing
                } else if (theta > 0.2) {
                    this.mode = GazeController.Modes.HIDDEN;
                    this.ring.visible = false;
                } else {
                    this.ring.progress = elapsedTime / this.confirmationThreshold;
                }
                break;
            case GazeController.Modes.MOVE:
                if (theta > 0.2) {
                    this.mode = GazeController.Modes.HIDDEN;
                    this.ring.visible = false;
                }
                break;
        }
    }

    confirmAction() {
        // Example function to handle confirmed action after gazing
        console.log('Action confirmed!');
    }
}

export { GazeController };
