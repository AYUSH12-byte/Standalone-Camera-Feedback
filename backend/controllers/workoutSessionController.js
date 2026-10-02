const WorkoutSession = require("../models/WorkoutSession");

// Create workout session
const createWorkoutSession = async (req, res) => {
  try {
    const {
      exercise,
      reps,
      duration,
      averageScore,
      feedback,
      issues,
      minKneeAngle,
      maxKneeAngle,
      startedAt,
      completedAt,
    } = req.body;

    if (!exercise) {
      return res.status(400).json({
        success: false,
        message: "Exercise is required",
      });
    }

    const session = await WorkoutSession.create({
      exercise,
      reps: reps || 0,
      duration: duration || 0,
      averageScore: averageScore || 0,
      feedback: feedback || [],
      issues: issues || [],
      minKneeAngle: minKneeAngle ?? null,
      maxKneeAngle: maxKneeAngle ?? null,
      startedAt: startedAt || new Date(),
      completedAt: completedAt || new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Workout session created successfully",
      data: session,
    });
  } catch (error) {
    console.error("Create workout session error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create workout session",
      error: error.message,
    });
  }
};

// Get all workout sessions
const getWorkoutSessions = async (req, res) => {
  try {
    const sessions = await WorkoutSession.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error("Get workout sessions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch workout sessions",
      error: error.message,
    });
  }
};

// Get workout session by ID
const getWorkoutSessionById = async (req, res) => {
  try {
    const session = await WorkoutSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Workout session not found",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Get workout session error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch workout session",
      error: error.message,
    });
  }
};

module.exports = {
  createWorkoutSession,
  getWorkoutSessions,
  getWorkoutSessionById,
};
