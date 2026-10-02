const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const formFeedbackRoutes = require("./routes/formFeedbackRoutes");
const workoutSessionRoutes = require("./routes/workoutSessionRoutes");
const liveSessionRoutes = require("./routes/liveSessionRoutes");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Camera Form Feedback API is running",
  });
});

// Form feedback routes
app.use("/api/form-feedback", formFeedbackRoutes);
app.use("/api/workout-sessions", workoutSessionRoutes);
app.use("/api/live-sessions", liveSessionRoutes);


const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
