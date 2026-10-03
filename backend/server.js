const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const formFeedbackRoutes = require("./routes/formFeedbackRoutes");
const workoutSessionRoutes = require("./routes/workoutSessionRoutes");
const liveSessionRoutes = require("./routes/liveSessionRoutes");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Camera Form Feedback API is running",
  });
});

// API routes
app.use("/api/form-feedback", formFeedbackRoutes);
app.use("/api/workout-sessions", workoutSessionRoutes);
app.use("/api/live-sessions", liveSessionRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
