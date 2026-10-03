// Default configuration for Camera Form Feedback
// Automatically connects to the local backend on port 7000.
// On physical devices via Expo Go, replace with your PC's LAN IP (e.g. 192.168.100.102).

export const DEFAULT_API_URL = "http://192.168.100.102:7000";

export const APP_CONFIG = {
  appName: "Camera Form Feedback",
  version: "1.0.0",
  targetFps: 10, // Landmark transmission rate (10 fps = 100ms interval)
  supportedExercises: [
    {
      id: "squat",
      name: "Squat",
      subtitle: "Full Body & Legs",
      description: "Real-time depth, knee alignment, and torso posture analysis.",
      isAvailable: true,
      icon: "fitness",
      color: "#10B981",
    },
    {
      id: "pushup",
      name: "Push-up",
      subtitle: "Chest & Arms",
      description: "Elbow flare, chest depth, and hip sagging detection.",
      isAvailable: false,
      badge: "Coming Soon",
      icon: "barbell",
      color: "#6366F1",
    },
    {
      id: "plank",
      name: "Plank",
      subtitle: "Core Stability",
      description: "Back alignment and hip elevation timer.",
      isAvailable: false,
      badge: "Coming Soon",
      icon: "timer",
      color: "#F59E0B",
    },
    {
      id: "lunge",
      name: "Lunge",
      subtitle: "Leg Balance",
      description: "Knee over toe and 90-degree angle tracker.",
      isAvailable: false,
      badge: "Coming Soon",
      icon: "walk",
      color: "#EC4899",
    },
  ],
};
