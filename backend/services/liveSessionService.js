const crypto = require("crypto");

const { getAverageKneeAngle, updateSquatState } = require("./squatRepService");

const { analyzeForm } = require("./formAnalysisService");

const { smoothLandmarks } = require("./landmarkSmoothingService");

const { createRepEvaluation } = require("./repEvaluationService");

// Temporary in-memory live sessions
const activeSessions = new Map();

// Create a new live session
const createLiveSession = (exercise) => {
  const sessionId = crypto.randomUUID();

  const session = {
    sessionId,

    exercise,

    reps: 0,

    // Store recent landmark frames
    // for smoothing camera noise
    landmarkHistory: [],

    // Current squat movement state
    state: "standing",

    // Previous knee angle
    previousAngle: null,

    // Overall workout knee angle range
    minKneeAngle: null,
    maxKneeAngle: null,

    // Overall form score aggregation
    totalScore: 0,
    scoreCount: 0,

    // Unique workout feedback
    feedback: [],

    // Unique workout issues
    issues: [],

    // Current repetition data
    currentRepScores: [],
    currentRepFeedback: [],
    currentRepIssues: [],

    currentRepMinKneeAngle: null,

    currentRepMaxKneeAngle: null,

    // Completed repetition evaluations
    repEvaluations: [],

    startedAt: new Date(),

    lastUpdatedAt: new Date(),
  };

  activeSessions.set(sessionId, session);

  return session;
};

// Get live session
const getLiveSession = (sessionId) => {
  return activeSessions.get(sessionId);
};

// Process one live camera frame
const processLiveFrame = (sessionId, landmarks) => {
  const session = activeSessions.get(sessionId);

  // Session does not exist
  if (!session) {
    return null;
  }

  // 1. Smooth landmark coordinates
  const smoothingResult = smoothLandmarks(
    session.landmarkHistory,
    landmarks,
    5,
  );

  const smoothedLandmarks = smoothingResult.landmarks;

  // Update landmark history
  session.landmarkHistory = smoothingResult.history;

  // 2. Calculate average knee angle
  const kneeAngle = getAverageKneeAngle(smoothedLandmarks);

  if (kneeAngle === null) {
    return {
      sessionId,

      exercise: session.exercise,

      reps: session.reps,

      state: session.state,

      error: "Required knee landmarks are missing",
    };
  }

  // 3. Store previous rep count
  const previousReps = session.reps;

  // 4. Detect squat movement
  const repResult = updateSquatState({
    kneeAngle,

    previousAngle: session.previousAngle,

    previousState: session.state,

    reps: session.reps,
  });

  // 5. Analyze exercise form
  const formAnalysis = analyzeForm(session.exercise, smoothedLandmarks);

  // 6. Update session movement state
  session.reps = repResult.reps;

  session.state = repResult.state;

  session.previousAngle = kneeAngle;

  // 7. Track overall workout knee angle range
  if (session.minKneeAngle === null || kneeAngle < session.minKneeAngle) {
    session.minKneeAngle = kneeAngle;
  }

  if (session.maxKneeAngle === null || kneeAngle > session.maxKneeAngle) {
    session.maxKneeAngle = kneeAngle;
  }

  // 8. Update overall workout score
  session.totalScore += formAnalysis.score;

  session.scoreCount += 1;

  // 9. Store overall workout feedback
  formAnalysis.feedback.forEach((message) => {
    if (!session.feedback.includes(message)) {
      session.feedback.push(message);
    }
  });

  // 10. Store overall workout issues
  formAnalysis.issues.forEach((issue) => {
    if (!session.issues.includes(issue)) {
      session.issues.push(issue);
    }
  });

  // 11. Collect current repetition data.
  // Form data is collected once the user starts moving down
  // and continues through bottom and rising phases.
  // Standing frames before the first squat are excluded.
  const isActiveRepPhase =
    session.state === "descending" ||
    session.state === "bottom" ||
    session.state === "rising";

  if (isActiveRepPhase && !repResult.repCompleted) {
    session.currentRepScores.push(formAnalysis.score);

    formAnalysis.feedback.forEach((message) => {
      if (!session.currentRepFeedback.includes(message)) {
        session.currentRepFeedback.push(message);
      }
    });

    formAnalysis.issues.forEach((issue) => {
      if (!session.currentRepIssues.includes(issue)) {
        session.currentRepIssues.push(issue);
      }
    });

    // Track current repetition knee angle range
    if (
      session.currentRepMinKneeAngle === null ||
      kneeAngle < session.currentRepMinKneeAngle
    ) {
      session.currentRepMinKneeAngle = kneeAngle;
    }

    if (
      session.currentRepMaxKneeAngle === null ||
      kneeAngle > session.currentRepMaxKneeAngle
    ) {
      session.currentRepMaxKneeAngle = kneeAngle;
    }
  }

  // 12. Handle completed repetition
  if (repResult.repCompleted) {
    // Make sure the final frame is included
    session.currentRepScores.push(formAnalysis.score);

    formAnalysis.feedback.forEach((message) => {
      if (!session.currentRepFeedback.includes(message)) {
        session.currentRepFeedback.push(message);
      }
    });

    formAnalysis.issues.forEach((issue) => {
      if (!session.currentRepIssues.includes(issue)) {
        session.currentRepIssues.push(issue);
      }
    });

    // Update final repetition angle range
    if (
      session.currentRepMinKneeAngle === null ||
      kneeAngle < session.currentRepMinKneeAngle
    ) {
      session.currentRepMinKneeAngle = kneeAngle;
    }

    if (
      session.currentRepMaxKneeAngle === null ||
      kneeAngle > session.currentRepMaxKneeAngle
    ) {
      session.currentRepMaxKneeAngle = kneeAngle;
    }

    // Create repetition evaluation
    const repEvaluation = createRepEvaluation({
      repNumber: repResult.reps,

      scores: session.currentRepScores,

      feedback: session.currentRepFeedback,

      issues: session.currentRepIssues,

      minKneeAngle: session.currentRepMinKneeAngle,

      maxKneeAngle: session.currentRepMaxKneeAngle,
    });

    // Store completed repetition
    session.repEvaluations.push(repEvaluation);

    // Reset current repetition data
    session.currentRepScores = [];

    session.currentRepFeedback = [];

    session.currentRepIssues = [];

    session.currentRepMinKneeAngle = null;

    session.currentRepMaxKneeAngle = null;
  }

  // 13. Update activity time
  session.lastUpdatedAt = new Date();

  // 14. Save updated session
  activeSessions.set(sessionId, session);

  // 15. Calculate overall average score
  const averageScore =
    session.scoreCount > 0
      ? Math.round(session.totalScore / session.scoreCount)
      : 0;

  // 16. Return live tracking result
  return {
    sessionId,

    exercise: session.exercise,

    kneeAngle,

    position: repResult.position,

    state: repResult.state,

    reps: repResult.reps,

    repCompleted: repResult.repCompleted,

    score: formAnalysis.score,

    averageScore,

    feedback: formAnalysis.feedback,

    issues: formAnalysis.issues,

    angles: formAnalysis.angles,

    status: formAnalysis.status,

    minKneeAngle: session.minKneeAngle,

    maxKneeAngle: session.maxKneeAngle,

    repEvaluations: session.repEvaluations,
  };
};

// Remove live session
const removeLiveSession = (sessionId) => {
  activeSessions.delete(sessionId);
};

// Export functions
module.exports = {
  createLiveSession,
  getLiveSession,
  processLiveFrame,
  removeLiveSession,
};
