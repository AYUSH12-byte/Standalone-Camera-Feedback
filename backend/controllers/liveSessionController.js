const WorkoutSession = require("../models/WorkoutSession");

const {
  createLiveSession,
  getLiveSession,
  processLiveFrame,
  removeLiveSession,
} = require("../services/liveSessionService");

// Start live workout
const startLiveSession = async (req, res) => {
  try {
    const { exercise = "squat" } = req.body;

    const allowedExercises = [
      "squat",
      "pushup",
      "plank",
      "lunge",
    ];

    if (
      !allowedExercises.includes(
        exercise.toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Unsupported exercise",
      });
    }

    const session = createLiveSession(
      exercise.toLowerCase()
    );

    res.status(201).json({
      success: true,
      message: "Live workout session started",
      data: session,
    });
  } catch (error) {
    console.error(
      "Start live session error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to start live session",
      error: error.message,
    });
  }
};

// Process camera frame
const trackLiveFrame = async (req, res) => {
  try {
    const {
      sessionId,
      landmarks,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    if (!landmarks) {
      return res.status(400).json({
        success: false,
        message: "Body landmarks are required",
      });
    }

    const session = getLiveSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Live session not found",
      });
    }

    if (session.exercise !== "squat") {
      return res.status(400).json({
        success: false,
        message:
          "Live tracking for this exercise is not implemented yet",
      });
    }

    const result = processLiveFrame(
      sessionId,
      landmarks
    );

    if (result?.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Track live frame error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to process camera frame",
      error: error.message,
    });
  }
};

// Get current live session
const getCurrentLiveSession = async (req, res) => {
  try {
    const session = getLiveSession(
      req.params.sessionId
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Live session not found",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error(
      "Get live session error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get live session",
      error: error.message,
    });
  }
};

// Finish live workout
const finishLiveSession = async (req, res) => {
  try {
    const {
      sessionId,
      duration = 0,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const session = getLiveSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Live session not found",
      });
    }

    // Calculate average score from live frame scores
    const scores = session.scores || [];

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (sum, score) => sum + score,
              0
            ) / scores.length
          )
        : 0;

    // Use feedback and issues collected during the session
    const feedback = session.feedback || [];
    const issues = session.issues || [];

    const completedAt = new Date();

    const workoutSession =
      await WorkoutSession.create({
        exercise: session.exercise,
        reps: session.reps,
        duration,
        averageScore,
        feedback,
        issues,
        minKneeAngle: session.minKneeAngle,
        maxKneeAngle: session.maxKneeAngle,
        startedAt: session.startedAt,
        completedAt,
      });

    // Remove live session after saving it
    removeLiveSession(sessionId);

    res.status(201).json({
      success: true,
      message:
        "Workout session completed successfully",
      data: workoutSession,
    });
  } catch (error) {
    console.error(
      "Finish live session error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to finish workout session",
      error: error.message,
    });
  }
};

module.exports = {
  startLiveSession,
  trackLiveFrame,
  getCurrentLiveSession,
  finishLiveSession,
};