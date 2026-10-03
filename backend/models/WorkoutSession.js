const mongoose = require("mongoose");

// Individual repetition evaluation
const RepEvaluationSchema =
  new mongoose.Schema(
    {
      // Rep number
      repNumber: {
        type: Number,
        required: true,
        min: 1,
      },

      // Form score for this repetition
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      // Rep quality
      status: {
        type: String,
        enum: [
          "good",
          "needs_improvement",
          "poor",
        ],
        default:
          "needs_improvement",
      },

      // Positive feedback
      feedback: {
        type: [String],
        default: [],
      },

      // Problems detected during the rep
      issues: {
        type: [String],
        default: [],
      },

      // Lowest knee angle during the rep
      minKneeAngle: {
        type: Number,
        default: null,
      },

      // Highest knee angle during the rep
      maxKneeAngle: {
        type: Number,
        default: null,
      },
    },
    {
      // Rep number already identifies the evaluation,
      // so MongoDB does not need another _id.
      _id: false,
    }
  );

// Complete workout session schema
const workoutSessionSchema =
  new mongoose.Schema(
    {
      // Exercise performed
      exercise: {
        type: String,
        required: true,
        enum: [
          "squat",
          "pushup",
          "plank",
          "lunge",
        ],
        lowercase: true,
        trim: true,
      },

      // Total repetitions completed
      reps: {
        type: Number,
        default: 0,
        min: 0,
      },

      // Workout duration in seconds
      duration: {
        type: Number,
        default: 0,
        min: 0,
      },

      // Overall workout score
      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      // Overall feedback
      feedback: [
        {
          type: String,
          trim: true,
        },
      ],

      // Overall detected issues
      issues: [
        {
          type: String,
          trim: true,
        },
      ],

      // Overall minimum knee angle
      minKneeAngle: {
        type: Number,
        default: null,
      },

      // Overall maximum knee angle
      maxKneeAngle: {
        type: Number,
        default: null,
      },

      // Individual repetition evaluations
      repEvaluations: {
        type: [RepEvaluationSchema],
        default: [],
      },

      // Workout start time
      startedAt: {
        type: Date,
        default: Date.now,
      },

      // Workout completion time
      completedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const WorkoutSession =
  mongoose.model(
    "WorkoutSession",
    workoutSessionSchema
  );

module.exports = WorkoutSession;