const FormFeedback = require("../models/FormFeedback");

// Create form feedback
const createFormFeedback = async (req, res) => {
  try {
    const {
      exercise,
      score,
      reps,
      duration,
      feedback,
      issues,
      angles,
      landmarks,
    } = req.body;

    if (!exercise) {
      return res.status(400).json({
        success: false,
        message: "Exercise is required",
      });
    }

    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: "Form score is required",
      });
    }

    const formFeedback = await FormFeedback.create({
      exercise,
      score,
      reps,
      duration,
      feedback,
      issues,
      angles,
      landmarks,
    });

    res.status(201).json({
      success: true,
      message: "Form feedback saved successfully",
      data: formFeedback,
    });
  } catch (error) {
    console.error("Create form feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save form feedback",
      error: error.message,
    });
  }
};

// Get all form feedback
const getFormFeedback = async (req, res) => {
  try {
    const feedback = await FormFeedback.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    console.error("Get form feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch form feedback",
      error: error.message,
    });
  }
};

// Get single form feedback
const getFormFeedbackById = async (req, res) => {
  try {
    const feedback = await FormFeedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Form feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Get form feedback by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch form feedback",
      error: error.message,
    });
  }
};

module.exports = {
  createFormFeedback,
  getFormFeedback,
  getFormFeedbackById,
};
