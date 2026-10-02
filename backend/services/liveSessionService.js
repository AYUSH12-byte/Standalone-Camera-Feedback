const crypto = require("crypto");

const { getAverageKneeAngle, updateSquatState } = require("./squatRepService");

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

// Track a new pose frame
const processLiveFrame = (sessionId, landmarks) => {
  const session = activeSessions.get(sessionId);

  if (!session) {
    return null;
  }

  const kneeAngle = getAverageKneeAngle(landmarks);

  if (kneeAngle === null) {
    return {
      ...session,
      error: "Required knee landmarks are missing",
    };
  }

  const previousReps = session.reps;

  const result = updateSquatState({
    kneeAngle,
    previousAngle: session.previousAngle,
    previousState: session.state,
    reps: session.reps,
  });

  session.reps = result.reps;
  session.state = result.state;
  session.previousAngle = kneeAngle;

  if (session.minKneeAngle === null || kneeAngle < session.minKneeAngle) {
    session.minKneeAngle = kneeAngle;
  }

  if (session.maxKneeAngle === null || kneeAngle > session.maxKneeAngle) {
    session.maxKneeAngle = kneeAngle;
  }

  session.lastUpdatedAt = new Date();

  activeSessions.set(sessionId, session);

  return {
    sessionId,
    exercise: session.exercise,
    kneeAngle,
    position: result.position,
    state: result.state,
    reps: result.reps,
    repCompleted: result.reps > previousReps,
    minKneeAngle: session.minKneeAngle,
    maxKneeAngle: session.maxKneeAngle,
  };
};

// Remove live session
const removeLiveSession = (sessionId) => {
  activeSessions.delete(sessionId);
};

module.exports = {
  createLiveSession,
  getLiveSession,
  processLiveFrame,
  removeLiveSession,
};
