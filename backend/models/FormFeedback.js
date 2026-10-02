const mongoose = require("mongoose");

const formFeedbackSchema = new mongoose.Schema(
  {
    exercise: {
      type: String,
      required: true,
      enum: ["squat", "pushup", "plank", "lunge"],
      lowercase: true,
      trim: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
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

    angles: {
      knee: {
        type: Number,
        default: null,
      },

      hip: {
        type: Number,
        default: null,
      },

      back: {
        type: Number,
        default: null,
      },

      elbow: {
        type: Number,
        default: null,
      },

      shoulder: {
        type: Number,
        default: null,
      },
    },

    landmarks: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const FormFeedback = mongoose.model(
  "FormFeedback",
  formFeedbackSchema
);

module.exports = FormFeedback;