const { validateLandmarks } = require("../utils/landmarkValidation");

// Calculate angle between 3 body landmarks using vectors and dot product.
// B is the joint (vertex of the angle).
const calculateAngle = (pointA, pointB, pointC) => {
  if (!pointA || !pointB || !pointC) {
    return null;
  }

  // Vectors from joint B to points A and C
  const vectorBA = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
  };

  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
  };

  const dotProduct =
    vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;

  const magnitudeBA = Math.sqrt(
    vectorBA.x ** 2 + vectorBA.y ** 2,
  );

  const magnitudeBC = Math.sqrt(
    vectorBC.x ** 2 + vectorBC.y ** 2,
  );

  if (magnitudeBA === 0 || magnitudeBC === 0) {
    return null;
  }

  const cosine = dotProduct / (magnitudeBA * magnitudeBC);

  // Clamp cosine between -1 and 1 to prevent floating point errors
  const safeCosine = Math.max(-1, Math.min(1, cosine));

  const angle = Math.acos(safeCosine) * (180 / Math.PI);

  return Math.round(angle);
};

// Calculate average of available values
const calculateAverage = (values) => {
  const validValues = values.filter(
    (value) => value !== null && value !== undefined,
  );

  if (validValues.length === 0) {
    return null;
  }

  return Math.round(
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length,
  );
};

// Calculate squat joint angles
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

  /*
   * Current back calculation uses the
   * shoulder -> hip -> knee angle.
   *
   * This is kept for compatibility with
   * the existing API response.
   *
   * A more advanced torso-angle calculation
   * can be added later.
   */
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

  return {
    knee: calculateAverage([leftKnee, rightKnee]),

    hip: calculateAverage([leftHip, rightHip]),

    back: calculateAverage([leftBack, rightBack]),
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

  // Good squat depth
  if (kneeAngle <= 100) {
    return {
      score: 0,
      feedback: ["Good squat depth."],
      issues: [],
    };
  }

  // Slightly shallow
  if (kneeAngle <= 120) {
    return {
      score: -10,
      feedback: ["Try to squat a little deeper."],
      issues: ["Insufficient squat depth"],
    };
  }

  // Very shallow
  return {
    score: -20,
    feedback: ["Squat deeper by bending your knees more."],
    issues: ["Very shallow squat"],
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

  const leftHipToKnee = Math.abs(landmarks.leftHip.x - landmarks.leftKnee.x);

  const rightHipToKnee = Math.abs(landmarks.rightHip.x - landmarks.rightKnee.x);

  const leftKneeToAnkle = Math.abs(
    landmarks.leftKnee.x - landmarks.leftAnkle.x,
  );

  const rightKneeToAnkle = Math.abs(
    landmarks.rightKnee.x - landmarks.rightAnkle.x,
  );

  const leftDeviation = leftHipToKnee + leftKneeToAnkle;

  const rightDeviation = rightHipToKnee + rightKneeToAnkle;

  const averageDeviation = (leftDeviation + rightDeviation) / 2;

  /*
   * This is an approximate 2D
   * camera-based knee alignment check.
   *
   * It is not a medical diagnosis and
   * should be treated as an approximate
   * visual feedback mechanism.
   */

  // Good alignment
  if (averageDeviation < 0.18) {
    return {
      score: 0,
      feedback: ["Good knee alignment."],
      issues: [],
    };
  }

  // Slight alignment issue
  if (averageDeviation < 0.3) {
    return {
      score: -5,
      feedback: ["Keep your knees aligned with your feet."],
      issues: ["Knee alignment needs improvement"],
    };
  }

  // Possible knee valgus
  return {
    score: -10,
    feedback: [
      "Your knees may be moving inward. Keep them aligned with your feet.",
    ],
    issues: ["Possible knee valgus"],
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

  const shoulderX = (landmarks.leftShoulder.x + landmarks.rightShoulder.x) / 2;

  const hipX = (landmarks.leftHip.x + landmarks.rightHip.x) / 2;

  const horizontalDifference = Math.abs(shoulderX - hipX);

  /*
   * Approximate forward lean using
   * horizontal shoulder/hip displacement.
   *
   * This works as a basic 2D camera
   * feedback mechanism.
   */

  // Good upper-body position
  if (horizontalDifference < 0.08) {
    return {
      score: 0,
      feedback: ["Good upper-body position."],
      issues: [],
    };
  }

  // Slight forward lean
  if (horizontalDifference < 0.15) {
    return {
      score: -5,
      feedback: ["Try to keep your upper body more controlled."],
      issues: ["Slight forward lean"],
    };
  }

  // Excessive forward lean
  return {
    score: -15,
    feedback: ["Keep your chest more upright during the squat."],
    issues: ["Excessive forward lean"],
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

  // Validate landmarks
  const validation = validateLandmarks(landmarks, requiredLandmarks);

  // Calculate angles
  const angles = calculateSquatAngles(landmarks);

  // Stop analysis if landmarks are unreliable
  if (!validation.valid) {
    const feedback = [];
    const issues = [];

    if (validation.missing.length > 0) {
      feedback.push("Some body landmarks are missing.");

      issues.push(`Missing landmarks: ${validation.missing.join(", ")}`);
    }

    if (validation.lowConfidence.length > 0) {
      feedback.push("Some body parts are not clearly visible.");

      issues.push(
        `Low-confidence landmarks: ${validation.lowConfidence.join(", ")}`,
      );
    }

    feedback.push(
      "Move into a position where your full body is clearly visible.",
    );

    return {
      score: 0,
      feedback,
      issues,
      angles,
      status: "insufficient_data",
      landmarkValidation: {
        valid: validation.valid,
        missing: validation.missing,
        lowConfidence: validation.lowConfidence,
      },
    };
  }

  // Starting score
  let score = 100;
  const feedback = [];
  const issues = [];

  // Squat depth
  const depthResult = checkSquatDepth(angles.knee);

  score += depthResult.score;

  feedback.push(...depthResult.feedback);

  issues.push(...depthResult.issues);

  // Knee alignment
  const kneeResult = checkKneeAlignment(landmarks);

  score += kneeResult.score;

  feedback.push(...kneeResult.feedback);

  issues.push(...kneeResult.issues);

  // Forward lean
  const leanResult = checkForwardLean(landmarks);

  score += leanResult.score;

  feedback.push(...leanResult.feedback);

  issues.push(...leanResult.issues);

  // Hip position
  if (angles.hip !== null) {
    // Good hip movement
    if (angles.hip >= 55 && angles.hip <= 100) {
      feedback.push("Good hip movement.");
    }

    // Excessive hip flexion
    else if (angles.hip < 55) {
      score -= 5;

      feedback.push("Avoid folding too much at the hips.");

      issues.push("Excessive hip flexion");
    }
  }

  // Keep score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine status
  let status = "good";

  if (score < 70) {
    status = "needs_improvement";
  }

  if (score < 50) {
    status = "poor";
  }

  // Return final analysis
  return {
    score,
    feedback: [...new Set(feedback)],
    issues: [...new Set(issues)],
    angles,
    status,
    landmarkValidation: {
      valid: validation.valid,
      missing: validation.missing,
      lowConfidence: validation.lowConfidence,
    },
  };
};

// Main form analysis function
const analyzeForm = (exercise, landmarks) => {
  // Validate landmarks object
  if (!landmarks || typeof landmarks !== "object") {
    return {
      score: 0,
      feedback: ["Body landmarks are required."],
      issues: ["Missing landmarks"],
      angles: {},
      status: "insufficient_data",
      landmarkValidation: {
        valid: false,
        missing: [],
        lowConfidence: [],
      },
    };
  }

  // Validate exercise
  if (!exercise || typeof exercise !== "string") {
    return {
      score: 0,
      feedback: ["Exercise is required."],
      issues: ["Missing exercise"],
      angles: {},
      status: "invalid_exercise",
    };
  }

  // Normalize exercise name
  const normalizedExercise = exercise.trim().toLowerCase();

  // Select exercise analyzer
  switch (normalizedExercise) {
    case "squat":
      return analyzeSquat(landmarks);

    case "pushup":
      return {
        score: 0,
        feedback: ["Push-up analysis is not implemented yet."],
        issues: ["Unsupported exercise analysis"],
        angles: {},
        status: "unsupported",
      };

    case "plank":
      return {
        score: 0,
        feedback: ["Plank analysis is not implemented yet."],
        issues: ["Unsupported exercise analysis"],
        angles: {},
        status: "unsupported",
      };

    case "lunge":
      return {
        score: 0,
        feedback: ["Lunge analysis is not implemented yet."],
        issues: ["Unsupported exercise analysis"],
        angles: {},
        status: "unsupported",
      };

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

// Exports
module.exports = {
  calculateAngle,
  calculateAverage,
  calculateSquatAngles,
  checkSquatDepth,
  checkKneeAlignment,
  checkForwardLean,
  analyzeSquat,
  analyzeForm,
};
