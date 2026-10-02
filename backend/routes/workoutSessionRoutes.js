const express = require("express");

const {
  createWorkoutSession,
  getWorkoutSessions,
  getWorkoutSessionById,
} = require("../controllers/workoutSessionController");

const router = express.Router();

// Create workout session
router.post("/", createWorkoutSession);

// Get all workout sessions
router.get("/", getWorkoutSessions);

// Get session by ID
router.get("/:id", getWorkoutSessionById);

module.exports = router;
