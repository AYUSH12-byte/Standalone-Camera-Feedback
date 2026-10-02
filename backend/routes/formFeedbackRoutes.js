const express = require("express");

const {
  analyzeAndSaveForm,
  getFormFeedback,
  getFormFeedbackById,
} = require("../controllers/formFeedbackController");

const router = express.Router();

// Analyze and save exercise form
router.post("/analyze", analyzeAndSaveForm);

// Get all form feedback
router.get("/", getFormFeedback);

// Get feedback by ID
router.get("/:id", getFormFeedbackById);

module.exports = router;
