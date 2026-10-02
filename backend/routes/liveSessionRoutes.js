const express = require("express");

const {
  startLiveSession,
  trackLiveFrame,
  getCurrentLiveSession,
  finishLiveSession,
} = require("../controllers/liveSessionController");

const router = express.Router();

// Start session
router.post("/start", startLiveSession);

// Process camera frame
router.post("/track", trackLiveFrame);

// Get current session
router.get("/:sessionId", getCurrentLiveSession);

// Finish session
router.post("/finish", finishLiveSession);

module.exports = router;
