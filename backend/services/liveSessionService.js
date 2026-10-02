const crypto = require("crypto");

const {
  getAverageKneeAngle,
  updateSquatState,
} = require("./squatRepService");

const {
  analyzeForm,
} = require("./formAnalysisService");


// Temporary in-memory live sessions
const activeSessions = new Map();


// Create a new live session
const createLiveSession = (exercise) => {
  const sessionId = crypto.randomUUID();

  const session = {
    sessionId,
    exercise,

    reps: 0,

    state: "standing",

    previousAngle: null,

    minKneeAngle: null,

    maxKneeAngle: null,

    scores: [],

    feedback: [],

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

  if (!session) {
    return null;
  }


  /*
   * Calculate knee angle
   */

  const kneeAngle =
    getAverageKneeAngle(
      landmarks
    );


  if (kneeAngle === null) {
    return {
      ...session,

      error:
        "Required knee landmarks are missing",
    };
  }


  /*
   * Detect squat movement
   */

  const previousReps =
    session.reps;

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


  /*
   * Analyze form
   */

  const formAnalysis =
    analyzeForm(
      session.exercise,
      landmarks
    );


  /*
   * Update session state
   */

  session.reps =
    repResult.reps;

  session.state =
    repResult.state;

  session.previousAngle =
    kneeAngle;


  /*
   * Store minimum knee angle
   */

  if (
    session.minKneeAngle === null ||
    kneeAngle <
      session.minKneeAngle
  ) {
    session.minKneeAngle =
      kneeAngle;
  }


  /*
   * Store maximum knee angle
   */

  if (
    session.maxKneeAngle === null ||
    kneeAngle >
      session.maxKneeAngle
  ) {
    session.maxKneeAngle =
      kneeAngle;
  }


  /*
   * Store scores
   */

  session.scores.push(
    formAnalysis.score
  );


  /*
   * Store feedback
   */

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


  /*
   * Store issues
   */

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


  session.lastUpdatedAt =
    new Date();


  activeSessions.set(
    sessionId,
    session
  );


  /*
   * Calculate average score
   */

  const averageScore =
    session.scores.length > 0
      ? Math.round(
          session.scores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) /
            session.scores.length
        )
      : 0;


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


module.exports = {
  createLiveSession,
  getLiveSession,
  processLiveFrame,
  removeLiveSession,
};