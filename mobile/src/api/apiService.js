// Centralized REST API client for Camera Form Feedback backend
import { DEFAULT_API_URL } from "../config";

let currentBaseUrl = DEFAULT_API_URL;

export const getBaseUrl = () => currentBaseUrl;

export const setBaseUrl = (url) => {
  if (!url) return;
  // Strip trailing slashes
  currentBaseUrl = url.replace(/\/+$/, "");
};

// Helper for HTTP requests with timeout
const request = async (endpoint, options = {}) => {
  const url = `${currentBaseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Network timeout: Check if backend server is running and IP is reachable");
    }
    throw error;
  }
};

export const apiService = {
  // Check backend server root health
  async checkHealth() {
    return request("/");
  },

  // Start a new live workout session
  async startLiveSession(exercise = "squat") {
    return request("/api/live-sessions/start", {
      method: "POST",
      body: JSON.stringify({ exercise }),
    });
  },

  // Stream pose landmarks for live form analysis and rep counting
  async trackLiveFrame(sessionId, landmarks) {
    return request("/api/live-sessions/track", {
      method: "POST",
      body: JSON.stringify({ sessionId, landmarks }),
      timeoutMs: 4000,
    });
  },

  // Get active session status
  async getLiveSession(sessionId) {
    return request(`/api/live-sessions/${sessionId}`, {
      method: "GET",
    });
  },

  // Finish session, compute final scores, and persist to MongoDB
  async finishLiveSession(sessionId, duration = 0) {
    return request("/api/live-sessions/finish", {
      method: "POST",
      body: JSON.stringify({ sessionId, duration }),
    });
  },

  // Get history of all saved workouts
  async getWorkoutSessions() {
    return request("/api/workout-sessions", {
      method: "GET",
    });
  },

  // Get specific workout details with rep evaluations
  async getWorkoutSessionById(id) {
    return request(`/api/workout-sessions/${id}`, {
      method: "GET",
    });
  },

  // Get overall aggregate workout statistics
  async getWorkoutStats() {
    return request("/api/workout-sessions/stats", {
      method: "GET",
    });
  },

  // Single-frame form analysis (test / static)
  async analyzeForm(exercise, landmarks) {
    return request("/api/form-feedback/analyze", {
      method: "POST",
      body: JSON.stringify({ exercise, landmarks }),
    });
  },
};
