// Pose estimation service for Camera Form Feedback
// Formats landmarks and provides kinematic tracking models for on-device analysis.

// Landmark dictionary key mapping following standard MediaPipe / BlazePose coordinates
export const POSE_LANDMARKS = [
  "nose",
  "leftEye",
  "rightEye",
  "leftShoulder",
  "rightShoulder",
  "leftElbow",
  "rightElbow",
  "leftWrist",
  "rightWrist",
  "leftHip",
  "rightHip",
  "leftKnee",
  "rightKnee",
  "leftAnkle",
  "rightAnkle",
];

// Reusable kinematics generator for real-time squat simulation & validation
export class PoseKinematicsEngine {
  constructor() {
    this.phase = 0; // 0 to 2*PI cycle
    this.speed = 0.08; // movement cadence
    this.formVariance = "good"; // 'good' | 'forward_lean' | 'shallow' | 'valgus'
    this.isActive = true;
  }

  setFormVariance(variance) {
    this.formVariance = variance;
  }

  setCadence(speed) {
    this.speed = speed;
  }

  // Generates next normalized frame of body landmarks based on real biomechanical trajectory
  getNextFrame() {
    this.phase = (this.phase + this.speed) % (Math.PI * 2);

    // Sine progression normalized from 0 (standing) to 1 (full bottom depth)
    // 0 = top of rep, 1 = bottom of rep
    let depthFactor = (1 - Math.cos(this.phase)) / 2;

    if (this.formVariance === "shallow") {
      depthFactor *= 0.55; // Does not reach below 120 deg
    }

    // Baseline standing coordinates (normalized 0-1)
    const baseHeadY = 0.18;
    const baseShoulderY = 0.28;
    const baseHipY = 0.52;
    const baseKneeY = 0.72;
    const baseAnkleY = 0.90;

    // Displacement as body lowers
    const drop = depthFactor * 0.18;
    const currentHipY = baseHipY + drop;
    const currentShoulderY = baseShoulderY + drop * 0.95;
    const currentHeadY = baseHeadY + drop * 0.95;

    // Torso lean factor (x offset for chest forward lean)
    let leanOffset = depthFactor * 0.04;
    if (this.formVariance === "forward_lean") {
      leanOffset += depthFactor * 0.12; // Exaggerate torso tilt forward
    }

    // Knee displacement
    const currentKneeY = baseKneeY + drop * 0.35;
    let leftKneeX = 0.44;
    let rightKneeX = 0.56;

    if (this.formVariance === "valgus") {
      // Knees collapse inward towards centerline
      leftKneeX += depthFactor * 0.05;
      rightKneeX -= depthFactor * 0.05;
    }

    return {
      leftShoulder: {
        x: Number((0.42 + leanOffset).toFixed(3)),
        y: Number(currentShoulderY.toFixed(3)),
        visibility: 0.98,
      },
      rightShoulder: {
        x: Number((0.58 + leanOffset).toFixed(3)),
        y: Number(currentShoulderY.toFixed(3)),
        visibility: 0.98,
      },
      leftElbow: {
        x: Number((0.38 + leanOffset).toFixed(3)),
        y: Number((currentShoulderY + 0.12).toFixed(3)),
        visibility: 0.95,
      },
      rightElbow: {
        x: Number((0.62 + leanOffset).toFixed(3)),
        y: Number((currentShoulderY + 0.12).toFixed(3)),
        visibility: 0.95,
      },
      leftWrist: {
        x: Number((0.44 + leanOffset).toFixed(3)),
        y: Number((currentShoulderY + 0.18).toFixed(3)),
        visibility: 0.92,
      },
      rightWrist: {
        x: Number((0.56 + leanOffset).toFixed(3)),
        y: Number((currentShoulderY + 0.18).toFixed(3)),
        visibility: 0.92,
      },
      leftHip: {
        x: 0.45,
        y: Number(currentHipY.toFixed(3)),
        visibility: 0.97,
      },
      rightHip: {
        x: 0.55,
        y: Number(currentHipY.toFixed(3)),
        visibility: 0.97,
      },
      leftKnee: {
        x: Number(leftKneeX.toFixed(3)),
        y: Number(currentKneeY.toFixed(3)),
        visibility: 0.96,
      },
      rightKnee: {
        x: Number(rightKneeX.toFixed(3)),
        y: Number(currentKneeY.toFixed(3)),
        visibility: 0.96,
      },
      leftAnkle: {
        x: 0.43,
        y: baseAnkleY,
        visibility: 0.94,
      },
      rightAnkle: {
        x: 0.57,
        y: baseAnkleY,
        visibility: 0.94,
      },
    };
  }

  // Preset poses for instant testing
  static getPresetPose(poseType) {
    switch (poseType) {
      case "standing":
        return {
          leftShoulder: { x: 0.45, y: 0.25, visibility: 0.98 },
          rightShoulder: { x: 0.55, y: 0.25, visibility: 0.98 },
          leftHip: { x: 0.46, y: 0.50, visibility: 0.97 },
          rightHip: { x: 0.54, y: 0.50, visibility: 0.97 },
          leftKnee: { x: 0.46, y: 0.72, visibility: 0.96 },
          rightKnee: { x: 0.54, y: 0.72, visibility: 0.96 },
          leftAnkle: { x: 0.46, y: 0.92, visibility: 0.95 },
          rightAnkle: { x: 0.54, y: 0.92, visibility: 0.95 },
        };
      case "bottom":
        return {
          leftShoulder: { x: 0.45, y: 0.45, visibility: 0.98 },
          rightShoulder: { x: 0.55, y: 0.45, visibility: 0.98 },
          leftHip: { x: 0.44, y: 0.68, visibility: 0.97 },
          rightHip: { x: 0.56, y: 0.68, visibility: 0.97 },
          leftKnee: { x: 0.41, y: 0.69, visibility: 0.96 },
          rightKnee: { x: 0.59, y: 0.69, visibility: 0.96 },
          leftAnkle: { x: 0.43, y: 0.92, visibility: 0.95 },
          rightAnkle: { x: 0.57, y: 0.92, visibility: 0.95 },
        };
      default:
        return this.getPresetPose("standing");
    }
  }
}
