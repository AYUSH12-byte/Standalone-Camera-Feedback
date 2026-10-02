const FormFeedback = require("../models/FormFeedback");
const { analyzeForm } = require("../services/formAnalysisService");

// Analyze and save form feedback
const analyzeAndSaveForm = async (req, res) => {
  try {
    const { exercise, reps, duration, landmarks } = req.body;

    if (!exercise) {
      return res.status(400).json({
        success: false,
        message: "Exercise is required",
      });
    }

    if (!landmarks) {
      return res.status(400).json({
        success: false,
        message: "Body landmarks are required",
      });
    }

    // Analyze exercise form
    const analysis = analyzeForm(exercise, landmarks);

    // Save analysis result
    const formFeedback = await FormFeedback.create({
      exercise,
      score: analysis.score,
      reps: reps || 0,
      duration: duration || 0,
      feedback: analysis.feedback,
      issues: analysis.issues,
      angles: analysis.angles,
      landmarks,
    });

    res.status(201).json({
      success: true,
      message: "Exercise form analyzed successfully",

      data: {
        id: formFeedback._id,
        exercise: formFeedback.exercise,
        score: analysis.score,
        reps: formFeedback.reps,
        duration: formFeedback.duration,
        feedback: analysis.feedback,
        issues: analysis.issues,
        angles: analysis.angles,
        status: analysis.status,
      },
    });
  } catch (error) {
    console.error("Analyze form error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to analyze exercise form",
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
  analyzeAndSaveForm,
  getFormFeedback,
  getFormFeedbackById,
};
