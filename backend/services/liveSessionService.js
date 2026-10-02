const crypto = require("crypto");

const {
  getAverageKneeAngle,
  updateSquatState,
} = require("./squatRepService");

const {
  analyzeForm,
} = require("./formAnalysisService");

const {
  smoothLandmarks,
} = require("./landmarkSmoothingService");

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

    state: "standing",

    previousAngle: null,

    minKneeAngle: null,

    maxKneeAngle: null,

    // Store total of all form scores
    // instead of storing every score
    totalScore: 0,

    // Number of form scores
    // used to calculate average
    scoreCount: 0,

    // Store unique feedback messages
    feedback: [],

    // Store unique issues
    issues: [],

    startedAt: new Date(),

    lastUpdatedAt: new Date(),
  };

  activeSessions.set(
    sessionId,
    session
  );

  return session;
};

// Get live session
const getLiveSession = (sessionId) => {
  return activeSessions.get(
    sessionId
  );
};

// Process one live camera frame
const processLiveFrame = (
  sessionId,
  landmarks
) => {
  const session =
    activeSessions.get(
      sessionId
    );

  // Session does not exist
  if (!session) {
    return null;
  }

  // Smooth landmark coordinates
  const smoothingResult =
    smoothLandmarks(
      session.landmarkHistory,
      landmarks,
      5
    );

  const smoothedLandmarks =
    smoothingResult.landmarks;

  // Update landmark history
  session.landmarkHistory =
    smoothingResult.history;

  // Calculate average knee angle
  const kneeAngle =
    getAverageKneeAngle(
      smoothedLandmarks
    );

  if (kneeAngle === null) {
    return {
      sessionId,

      exercise:
        session.exercise,

      reps:
        session.reps,

      state:
        session.state,

      error:
        "Required knee landmarks are missing",
    };
  }

  // Store previous number of reps
  // so we can detect a newly completed rep
  const previousReps =
    session.reps;

  // Detect squat movement
  const repResult =
    updateSquatState({
      kneeAngle,

      previousAngle:
        session.previousAngle,

      previousState:
        session.state,

      reps:
        session.reps,
    });

  // Analyze exercise form
  // using smoothed landmarks
  const formAnalysis =
    analyzeForm(
      session.exercise,
      smoothedLandmarks
    );

  // Update session state
  session.reps =
    repResult.reps;

  session.state =
    repResult.state;

  session.previousAngle =
    kneeAngle;

  // Store minimum knee angle
  if (
    session.minKneeAngle === null ||
    kneeAngle <
      session.minKneeAngle
  ) {
    session.minKneeAngle =
      kneeAngle;
  }

  // Store maximum knee angle
  if (
    session.maxKneeAngle === null ||
    kneeAngle >
      session.maxKneeAngle
  ) {
    session.maxKneeAngle =
      kneeAngle;
  }

  // Add current form score
  // to the running total
  session.totalScore +=
    formAnalysis.score;

  // Increase number of analyzed frames
  session.scoreCount += 1;

  // Store unique feedback messages
  formAnalysis.feedback.forEach(
    (message) => {
      if (
        !session.feedback.includes(
          message
        )
      ) {
        session.feedback.push(
          message
        );
      }
    }
  );

  // Store unique issues
  formAnalysis.issues.forEach(
    (issue) => {
      if (
        !session.issues.includes(
          issue
        )
      ) {
        session.issues.push(
          issue
        );
      }
    }
  );

  // Update last activity time
  session.lastUpdatedAt =
    new Date();

  // Save updated session
  activeSessions.set(
    sessionId,
    session
  );

  // Calculate average score
  const averageScore =
    session.scoreCount > 0
      ? Math.round(
          session.totalScore /
            session.scoreCount
        )
      : 0;

  // Return live tracking result
  return {
    sessionId,

    exercise:
      session.exercise,

    kneeAngle,

    position:
      repResult.position,

    state:
      repResult.state,

    reps:
      repResult.reps,

    repCompleted:
      repResult.reps >
      previousReps,

    score:
      formAnalysis.score,

    averageScore,

    feedback:
      formAnalysis.feedback,

    issues:
      formAnalysis.issues,

    angles:
      formAnalysis.angles,

    status:
      formAnalysis.status,

    minKneeAngle:
      session.minKneeAngle,

    maxKneeAngle:
      session.maxKneeAngle,
  };
};

// Remove live session
const removeLiveSession = (
  sessionId
) => {
  activeSessions.delete(
    sessionId
  );
};

// Export functions
module.exports = {
  createLiveSession,
  getLiveSession,
  processLiveFrame,
  removeLiveSession,
};