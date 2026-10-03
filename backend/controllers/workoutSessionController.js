const mongoose = require("mongoose");
const WorkoutSession = require("../models/WorkoutSession");

// Create workout session manually
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
      repEvaluations,
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
      repEvaluations: repEvaluations || [],
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

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid workout session data",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create workout session",
      error: error.message,
    });
  }
};

// Get all workout sessions (newest first)
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
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workout session ID",
      });
    }

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

// Get workout statistics
const getWorkoutStats = async (req, res) => {
  try {
    const sessions = await WorkoutSession.find().sort({
      createdAt: -1,
    });

    if (sessions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalWorkouts: 0,
          totalReps: 0,
          averageScore: 0,
          bestScore: 0,
          totalDuration: 0,
          averageRepsPerWorkout: 0,
          recentPerformance: [],
        },
      });
    }

    const totalWorkouts = sessions.length;

    const totalReps = sessions.reduce(
      (sum, session) => sum + (session.reps || 0),
      0,
    );

    const totalDuration = sessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0,
    );

    const scores = sessions
      .map((s) => s.averageScore)
      .filter((s) => s > 0);

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + s, 0) / scores.length,
          )
        : 0;

    const bestScore =
      scores.length > 0 ? Math.max(...scores) : 0;

    const averageRepsPerWorkout =
      totalWorkouts > 0
        ? Number((totalReps / totalWorkouts).toFixed(1))
        : 0;

    // Recent performance: last 10 workouts for chart data
    const recentPerformance = sessions.slice(0, 10).map((session) => ({
      id: session._id,
      exercise: session.exercise,
      score: session.averageScore,
      reps: session.reps,
      duration: session.duration,
      date: session.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalWorkouts,
        totalReps,
        averageScore,
        bestScore,
        totalDuration,
        averageRepsPerWorkout,
        recentPerformance,
      },
    });
  } catch (error) {
    console.error("Get workout stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch workout statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createWorkoutSession,
  getWorkoutSessions,
  getWorkoutSessionById,
  getWorkoutStats,
};
