const calculateAngle = (pointA, pointB, pointC) => {
  if (!pointA || !pointB || !pointC) {
    return null;
  }

  const radians =
    Math.atan2(
      pointC.y - pointB.y,
      pointC.x - pointB.x
    ) -
    Math.atan2(
      pointA.y - pointB.y,
      pointA.x - pointB.x
    );

  let angle = Math.abs((radians * 180) / Math.PI);

  if (angle > 180) {
    angle = 360 - angle;
  }

  return Math.round(angle);
};

// Calculate average of available values
const calculateAverage = (values) => {
  const validValues = values.filter(
    (value) => value !== null && value !== undefined
  );

  if (validValues.length === 0) {
    return null;
  }

  return Math.round(
    validValues.reduce(
      (sum, value) => sum + value,
      0
    ) / validValues.length
  );
};

// Calculate squat joint angles
const calculateSquatAngles = (landmarks) => {
  const leftKnee = calculateAngle(
    landmarks.leftHip,
    landmarks.leftKnee,
    landmarks.leftAnkle
  );

  const rightKnee = calculateAngle(
    landmarks.rightHip,
    landmarks.rightKnee,
    landmarks.rightAnkle
  );

  const leftHip = calculateAngle(
    landmarks.leftShoulder,
    landmarks.leftHip,
    landmarks.leftKnee
  );

  const rightHip = calculateAngle(
    landmarks.rightShoulder,
    landmarks.rightHip,
    landmarks.rightKnee
  );

  const leftBack = calculateAngle(
    landmarks.leftShoulder,
    landmarks.leftHip,
    landmarks.leftKnee
  );

  const rightBack = calculateAngle(
    landmarks.rightShoulder,
    landmarks.rightHip,
    landmarks.rightKnee
  );

  return {
    knee: calculateAverage([
      leftKnee,
      rightKnee,
    ]),

    hip: calculateAverage([
      leftHip,
      rightHip,
    ]),

    back: calculateAverage([
      leftBack,
      rightBack,
    ]),
  };
};

// Check squat depth
const checkSquatDepth = (kneeAngle) => {
  if (kneeAngle === null) {
    return {
      score: 0,
      feedback: [],
      issues: [],
    };
  }

  if (kneeAngle <= 100) {
    return {
      score: 0,
      feedback: ["Good squat depth."],
      issues: [],
    };
  }

  if (kneeAngle <= 120) {
    return {
      score: -10,
      feedback: [
        "Try to squat a little deeper."
      ],
      issues: [
        "Insufficient squat depth"
      ],
    };
  }

  return {
    score: -20,
    feedback: [
      "Squat deeper by bending your knees more."
    ],
    issues: [
      "Very shallow squat"
    ],
  };
};

// Check knee alignment
const checkKneeAlignment = (landmarks) => {
  if (
    !landmarks.leftHip ||
    !landmarks.rightHip ||
    !landmarks.leftKnee ||
    !landmarks.rightKnee ||
    !landmarks.leftAnkle ||
    !landmarks.rightAnkle
  ) {
    return {
      score: 0,
      feedback: [],
      issues: [],
    };
  }

  const leftHipToKnee =
    Math.abs(
      landmarks.leftHip.x -
        landmarks.leftKnee.x
    );

  const rightHipToKnee =
    Math.abs(
      landmarks.rightHip.x -
        landmarks.rightKnee.x
    );

  const leftKneeToAnkle =
    Math.abs(
      landmarks.leftKnee.x -
        landmarks.leftAnkle.x
    );

  const rightKneeToAnkle =
    Math.abs(
      landmarks.rightKnee.x -
        landmarks.rightAnkle.x
    );

  const leftDeviation =
    leftHipToKnee +
    leftKneeToAnkle;

  const rightDeviation =
    rightHipToKnee +
    rightKneeToAnkle;

  const averageDeviation =
    (leftDeviation + rightDeviation) / 2;

  /*
   * This is an approximate 2D camera-based
   * knee alignment check.
   */
  if (averageDeviation < 0.18) {
    return {
      score: 0,
      feedback: [
        "Good knee alignment."
      ],
      issues: [],
    };
  }

  if (averageDeviation < 0.30) {
    return {
      score: -5,
      feedback: [
        "Keep your knees aligned with your feet."
      ],
      issues: [
        "Knee alignment needs improvement"
      ],
    };
  }

  return {
    score: -10,
    feedback: [
      "Your knees may be moving inward. Keep them aligned with your feet."
    ],
    issues: [
      "Possible knee valgus"
    ],
  };
};

// Check forward lean
const checkForwardLean = (landmarks) => {
  if (
    !landmarks.leftShoulder ||
    !landmarks.rightShoulder ||
    !landmarks.leftHip ||
    !landmarks.rightHip
  ) {
    return {
      score: 0,
      feedback: [],
      issues: [],
    };
  }

  const shoulderX =
    (
      landmarks.leftShoulder.x +
      landmarks.rightShoulder.x
    ) / 2;

  const hipX =
    (
      landmarks.leftHip.x +
      landmarks.rightHip.x
    ) / 2;

  const horizontalDifference =
    Math.abs(
      shoulderX - hipX
    );

  /*
   * Approximate forward lean from
   * horizontal shoulder/hip displacement.
   */
  if (horizontalDifference < 0.08) {
    return {
      score: 0,
      feedback: [
        "Good upper-body position."
      ],
      issues: [],
    };
  }

  if (horizontalDifference < 0.15) {
    return {
      score: -5,
      feedback: [
        "Try to keep your upper body more controlled."
      ],
      issues: [
        "Slight forward lean"
      ],
    };
  }

  return {
    score: -15,
    feedback: [
      "Keep your chest more upright during the squat."
    ],
    issues: [
      "Excessive forward lean"
    ],
  };
};

// Analyze squat form
const analyzeSquat = (landmarks) => {
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

  const missingLandmarks =
    requiredLandmarks.filter(
      (landmark) =>
        !landmarks[landmark]
    );

  const angles =
    calculateSquatAngles(
      landmarks
    );

  if (missingLandmarks.length > 0) {
    return {
      score: 0,
      feedback: [
        "Body landmarks are incomplete.",
        "Make sure your full body is visible in the camera.",
      ],
      issues: [
        "Missing body landmarks"
      ],
      angles,
      status: "insufficient_data",
    };
  }

  let score = 100;

  const feedback = [];
  const issues = [];

  // 1. Squat depth
  const depthResult =
    checkSquatDepth(
      angles.knee
    );

  score += depthResult.score;
  feedback.push(
    ...depthResult.feedback
  );
  issues.push(
    ...depthResult.issues
  );

  // 2. Knee alignment
  const kneeResult =
    checkKneeAlignment(
      landmarks
    );

  score += kneeResult.score;
  feedback.push(
    ...kneeResult.feedback
  );
  issues.push(
    ...kneeResult.issues
  );

  // 3. Forward lean
  const leanResult =
    checkForwardLean(
      landmarks
    );

  score += leanResult.score;
  feedback.push(
    ...leanResult.feedback
  );
  issues.push(
    ...leanResult.issues
  );

  // 4. Hip position
  if (angles.hip !== null) {
    if (
      angles.hip >= 55 &&
      angles.hip <= 100
    ) {
      feedback.push(
        "Good hip movement."
      );
    } else if (
      angles.hip < 55
    ) {
      score -= 5;

      feedback.push(
        "Avoid folding too much at the hips."
      );

      issues.push(
        "Excessive hip flexion"
      );
    }
  }

  // Keep score between 0 and 100
  score = Math.max(
    0,
    Math.min(100, score)
  );

  let status = "good";

  if (score < 70) {
    status = "needs_improvement";
  }

  if (score < 50) {
    status = "poor";
  }

  return {
    score,
    feedback: [
      ...new Set(feedback),
    ],
    issues: [
      ...new Set(issues),
    ],
    angles,
    status,
  };
};

// Main form analysis function
const analyzeForm = (
  exercise,
  landmarks
) => {
  if (
    !landmarks ||
    typeof landmarks !== "object"
  ) {
    return {
      score: 0,
      feedback: [
        "Body landmarks are required."
      ],
      issues: [
        "Missing landmarks"
      ],
      angles: {},
      status: "insufficient_data",
    };
  }

  switch (
    exercise.toLowerCase()
  ) {
    case "squat":
      return analyzeSquat(
        landmarks
      );

    default:
      return {
        score: 0,
        feedback: [
          `Form analysis for ${exercise} is not implemented yet.`,
        ],
        issues: [
          "Unsupported exercise"
        ],
        angles: {},
        status: "unsupported",
      };
  }
};

module.exports = {
  calculateAngle,
  calculateSquatAngles,
  checkSquatDepth,
  checkKneeAlignment,
  checkForwardLean,
  analyzeSquat,
  analyzeForm,
};