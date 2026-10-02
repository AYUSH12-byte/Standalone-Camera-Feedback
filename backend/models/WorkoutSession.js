const mongoose = require("mongoose");

const workoutSessionSchema = new mongoose.Schema(
  {
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

    reps: {
      type: Number,
      default: 0,
      min: 0,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    feedback: [
      {
        type: String,
        trim: true,
      },
    ],

    issues: [
      {
        type: String,
        trim: true,
      },
    ],

    minKneeAngle: {
      type: Number,
      default: null,
    },

    maxKneeAngle: {
      type: Number,
      default: null,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WorkoutSession = mongoose.model(
  "WorkoutSession",
  workoutSessionSchema
);

module.exports = WorkoutSession;