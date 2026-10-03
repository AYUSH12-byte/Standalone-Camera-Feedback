const express = require("express");

const {
  createWorkoutSession,
  getWorkoutSessions,
  getWorkoutSessionById,
  getWorkoutStats,
} = require("../controllers/workoutSessionController");

const router = express.Router();

// Get workout statistics (must be before /:id)
router.get("/stats", getWorkoutStats);

// Create workout session
router.post("/", createWorkoutSession);

// Get all workout sessions
router.get("/", getWorkoutSessions);

// Get session by ID
router.get("/:id", getWorkoutSessionById);

module.exports = router;
