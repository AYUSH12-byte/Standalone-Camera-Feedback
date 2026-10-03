const mongoose = require("mongoose");
const FormFeedback = require("../models/FormFeedback");
const { analyzeForm } = require("../services/formAnalysisService");

const {
  getAverageKneeAngle,
  updateSquatState,
} = require("../services/squatRepService");

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
// Track live squat movement
const trackSquat = async (req, res) => {
  try {
    const {
      landmarks,
      previousAngle,
      previousState = "standing",
      reps = 0,
    } = req.body;

    if (!landmarks) {
      return res.status(400).json({
        success: false,
        message: "Body landmarks are required",
      });
    }

    const kneeAngle =
      getAverageKneeAngle(landmarks);

    if (kneeAngle === null) {
      return res.status(400).json({
        success: false,
        message:
          "Required knee landmarks are missing",
      });
    }

    const result = updateSquatState({
      kneeAngle,
      previousAngle:
        previousAngle === null ||
        previousAngle === undefined
          ? null
          : Number(previousAngle),
      previousState,
      reps: Number(reps),
    });

    res.status(200).json({
      success: true,
      data: {
        exercise: "squat",
        kneeAngle: result.kneeAngle,
        position: result.position,
        state: result.state,
        reps: result.reps,
        repCompleted:
          result.reps > Number(reps),
      },
    });
  } catch (error) {
    console.error(
      "Track squat error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to track squat",
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
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form feedback ID",
      });
    }

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
    trackSquat,
  getFormFeedback,
  getFormFeedbackById,
};
