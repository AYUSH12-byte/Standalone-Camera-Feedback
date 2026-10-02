const calculateAngle = (pointA, pointB, pointC) => {
  if (!pointA || !pointB || !pointC) {
    return null;
  }

  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);

  let angle = Math.abs((radians * 180) / Math.PI);

  if (angle > 180) {
    angle = 360 - angle;
  }

  return Math.round(angle);
};

const calculateSquatAngles = (landmarks) => {
  const leftKnee = calculateAngle(
    landmarks.leftHip,
    landmarks.leftKnee,
    landmarks.leftAnkle,
  );

  const rightKnee = calculateAngle(
    landmarks.rightHip,
    landmarks.rightKnee,
    landmarks.rightAnkle,
  );

  const leftHip = calculateAngle(
    landmarks.leftShoulder,
    landmarks.leftHip,
    landmarks.leftKnee,
  );

  const rightHip = calculateAngle(
    landmarks.rightShoulder,
    landmarks.rightHip,
    landmarks.rightKnee,
  );

  const leftBack = calculateAngle(
    landmarks.leftShoulder,
    landmarks.leftHip,
    landmarks.leftKnee,
  );

  const rightBack = calculateAngle(
    landmarks.rightShoulder,
    landmarks.rightHip,
    landmarks.rightKnee,
  );

  const kneeAngles = [leftKnee, rightKnee].filter((angle) => angle !== null);

  const hipAngles = [leftHip, rightHip].filter((angle) => angle !== null);

  const backAngles = [leftBack, rightBack].filter((angle) => angle !== null);

  return {
    knee:
      kneeAngles.length > 0
        ? Math.round(
            kneeAngles.reduce((sum, angle) => sum + angle, 0) /
              kneeAngles.length,
          )
        : null,

    hip:
      hipAngles.length > 0
        ? Math.round(
            hipAngles.reduce((sum, angle) => sum + angle, 0) / hipAngles.length,
          )
        : null,

    back:
      backAngles.length > 0
        ? Math.round(
            backAngles.reduce((sum, angle) => sum + angle, 0) /
              backAngles.length,
          )
        : null,
  };
};

const analyzeSquat = (landmarks) => {
  const angles = calculateSquatAngles(landmarks);

  let score = 100;

  const feedback = [];
  const issues = [];

  // -----------------------------
  // Check required landmarks
  // -----------------------------

  const requiredLandmarks = [
    "leftShoulder",
    "rightShoulder",
    "leftHip",
    "rightHip",
    "leftKnee",
    "rightKnee",
    "leftAnkle",
    "rightAnkle",
  ];

  const missingLandmarks = requiredLandmarks.filter(
    (landmark) => !landmarks[landmark],
  );

  if (missingLandmarks.length > 0) {
    return {
      score: 0,
      feedback: [
        "Body landmarks are incomplete.",
        "Make sure your full body is visible in the camera.",
      ],
      issues: ["Missing body landmarks"],
      angles,
      status: "insufficient_data",
    };
  }

  // Squat depth

  if (angles.knee !== null) {
    if (angles.knee <= 100) {
      feedback.push("Good squat depth.");
    } else if (angles.knee <= 120) {
      score -= 10;
      feedback.push("Try to squat a little deeper.");
      issues.push("Insufficient squat depth");
    } else {
      score -= 20;
      feedback.push("Squat deeper by bending your knees more.");
      issues.push("Very shallow squat");
    }
  }


  // Hip position

  if (angles.hip !== null) {
    if (angles.hip >= 55 && angles.hip <= 100) {
      feedback.push("Good hip movement.");
    } else if (angles.hip < 55) {
      score -= 10;
      feedback.push("Avoid folding too much at the hips.");
      issues.push("Excessive hip flexion");
    }
  }

  // Back posture

  if (angles.back !== null) {
    if (angles.back >= 55) {
      feedback.push("Keep your back controlled.");
    } else {
      score -= 15;
      feedback.push("Keep your back more upright.");
      issues.push("Poor back posture");
    }
  }

  // Knee alignment

  const leftKneeX = landmarks.leftKnee.x;
  const rightKneeX = landmarks.rightKnee.x;

  const leftAnkleX = landmarks.leftAnkle.x;
  const rightAnkleX = landmarks.rightAnkle.x;

  const leftDifference = Math.abs(leftKneeX - leftAnkleX);
  const rightDifference = Math.abs(rightKneeX - rightAnkleX);

  if (leftDifference < 0.08 && rightDifference < 0.08) {
    feedback.push("Good knee alignment.");
  } else {
    score -= 10;
    feedback.push("Keep your knees aligned with your feet.");
    issues.push("Knee alignment needs improvement");
  }


  // Final score

  score = Math.max(0, Math.min(100, score));

  let status = "good";

  if (score < 70) {
    status = "needs_improvement";
  }

  if (score < 50) {
    status = "poor";
  }

  return {
    score,
    feedback,
    issues,
    angles,
    status,
  };
};

const analyzeForm = (exercise, landmarks) => {
  if (!landmarks || typeof landmarks !== "object") {
    return {
      score: 0,
      feedback: ["Body landmarks are required."],
      issues: ["Missing landmarks"],
      angles: {},
      status: "insufficient_data",
    };
  }

  switch (exercise.toLowerCase()) {
    case "squat":
      return analyzeSquat(landmarks);

    default:
      return {
        score: 0,
        feedback: [`Form analysis for ${exercise} is not implemented yet.`],
        issues: ["Unsupported exercise"],
        angles: {},
        status: "unsupported",
      };
  }
};

module.exports = {
  calculateAngle,
  calculateSquatAngles,
  analyzeSquat,
  analyzeForm,
};
