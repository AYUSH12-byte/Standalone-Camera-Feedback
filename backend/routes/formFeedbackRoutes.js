const express = require("express");

const {
  analyzeAndSaveForm,
  getFormFeedback,
  getFormFeedbackById,
  trackSquat,
} = require("../controllers/formFeedbackController");

const router = express.Router();

// Analyze and save exercise form
router.post("/analyze", analyzeAndSaveForm);

// Track squat movement
router.post("/track", trackSquat);

// Get all form feedback
router.get("/", getFormFeedback);

// Get feedback by ID
router.get("/:id", getFormFeedbackById);

module.exports = router;
