// Design tokens for Camera Form Feedback
// Modern dark fitness aesthetic with high-contrast coaching indicators

export const COLORS = {
  // Backgrounds
  background: "#0A0E17",
  card: "#121A2A",
  cardSecondary: "#1A253A",
  surface: "#1E293B",
  surfaceHover: "#283548",

  // Brand / Accents
  primary: "#10B981", // Emerald Green for peak performance
  primaryDark: "#059669",
  primaryLight: "rgba(16, 185, 129, 0.15)",
  secondary: "#6366F1", // Indigo accent

  // Form Performance Tiers
  good: "#10B981",      // Score 70-100
  goodBg: "rgba(16, 185, 129, 0.18)",
  goodBorder: "rgba(16, 185, 129, 0.4)",

  warning: "#F59E0B",   // Score 50-69 (Needs Improvement)
  warningBg: "rgba(245, 158, 11, 0.18)",
  warningBorder: "rgba(245, 158, 11, 0.4)",

  danger: "#EF4444",    // Score 0-49 (Poor)
  dangerBg: "rgba(239, 68, 68, 0.18)",
  dangerBorder: "rgba(239, 68, 68, 0.4)",

  info: "#38BDF8",
  infoBg: "rgba(56, 189, 248, 0.18)",

  // Neutrals & Text
  text: "#F8FAFC",
  textMuted: "#94A3B8",
  textSubtle: "#64748B",
  border: "#24324D",
  borderLight: "#334155",
  divider: "rgba(255, 255, 255, 0.08)",

  // Overlays
  overlayDark: "rgba(10, 14, 23, 0.75)",
  overlayBlur: "rgba(15, 23, 42, 0.85)",
  skeletonJoint: "#00F0FF",
  skeletonBone: "#10B981",
};

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  glowGreen: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
};
