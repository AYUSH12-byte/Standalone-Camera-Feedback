const express = require("express");

const {
  createFormFeedback,
  getFormFeedback,
  getFormFeedbackById,
} = require("../controllers/formFeedbackController");

const router = express.Router();

// Create form feedback
router.post("/", createFormFeedback);

// Get all form feedback
router.get("/", getFormFeedback);

// Get feedback by ID
router.get("/:id", getFormFeedbackById);

module.exports = router;
