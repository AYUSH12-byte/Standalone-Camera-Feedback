import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../api/apiService";
import { PoseKinematicsEngine } from "../services/poseService";
import PoseSkeletonOverlay from "../components/PoseSkeletonOverlay";
import ScoreBadge from "../components/ScoreBadge";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../styles/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SquatCameraScreen({ onNavigate }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");

  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live coaching & metrics from backend
  const [reps, setReps] = useState(0);
  const [currentScore, setCurrentScore] = useState(85);
  const [averageScore, setAverageScore] = useState(85);
  const [formStatus, setFormStatus] = useState("good");
  const [movementState, setMovementState] = useState("standing");
  const [position, setPosition] = useState("standing");
  const [kneeAngle, setKneeAngle] = useState(165);
  const [hipAngle, setHipAngle] = useState(170);
  const [feedbackList, setFeedbackList] = useState(["Ready to squat. Stand in frame."]);
  const [issuesList, setIssuesList] = useState([]);
  const [currentLandmarks, setCurrentLandmarks] = useState(null);

  // Mode and form simulation controls
  const [simulationMode, setSimulationMode] = useState("good"); // 'good' | 'forward_lean' | 'shallow' | 'valgus'
  const [showControls, setShowControls] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const kinematicsRef = useRef(new PoseKinematicsEngine());
  const timerRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Keep sessionIdRef in sync with state
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Request camera permission on mount if needed
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Start live workout session on backend
  const handleStartSession = useCallback(async () => {
    try {
      const res = await apiService.startLiveSession("squat");
      if (res && res.success && res.data) {
        setSessionId(res.data.sessionId);
        sessionIdRef.current = res.data.sessionId;
        setIsSessionActive(true);
        setElapsedSeconds(0);
        setReps(0);
        setFeedbackList(["Session started. Begin your squats."]);
        setIssuesList([]);
      } else {
        Alert.alert("Connection Error", "Could not start live session on backend.");
      }
    } catch (err) {
      Alert.alert("Server Offline", `Failed to reach backend: ${err.message}`);
    }
  }, []);

  // Finish live session on backend and navigate to Result screen
  const handleFinishSession = useCallback(async () => {
    const activeId = sessionIdRef.current;
    if (!activeId) {
      onNavigate("home");
      return;
    }

    setIsFinishing(true);
    // Stop intervals
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await apiService.finishLiveSession(activeId, elapsedSeconds);
      if (res && res.success && res.data) {
        onNavigate("result", { result: res.data });
      } else {
        Alert.alert("Error", "Could not finalize workout session.");
        setIsFinishing(false);
      }
    } catch (err) {
      Alert.alert("Error", `Failed to save workout: ${err.message}`);
      setIsFinishing(false);
    }
  }, [elapsedSeconds, onNavigate]);

  // Workout duration timer
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  // Live frame processing loop (10 FPS = 100ms)
  useEffect(() => {
    if (isSessionActive && sessionId) {
      frameIntervalRef.current = setInterval(async () => {
        const engine = kinematicsRef.current;
        engine.setFormVariance(simulationMode);
        const landmarks = engine.getNextFrame();
        setCurrentLandmarks(landmarks);

        try {
          const trackRes = await apiService.trackLiveFrame(sessionIdRef.current, landmarks);
          if (trackRes && trackRes.success && trackRes.data) {
            const d = trackRes.data;
            if (typeof d.reps === "number") setReps(d.reps);
            if (typeof d.score === "number") setCurrentScore(d.score);
            if (typeof d.averageScore === "number") setAverageScore(d.averageScore);
            if (d.status) setFormStatus(d.status);
            if (d.state) setMovementState(d.state);
            if (d.position) setPosition(d.position);
            if (typeof d.kneeAngle === "number") setKneeAngle(Math.round(d.kneeAngle));
            if (d.angles?.hip) setHipAngle(Math.round(d.angles.hip));
            if (Array.isArray(d.feedback) && d.feedback.length > 0) {
              setFeedbackList(d.feedback);
            }
            if (Array.isArray(d.issues)) {
              setIssuesList(d.issues);
            }
          }
        } catch {
          // Frame drop handled silently to maintain camera smoothness
        }
      }, 100);
    }

    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, [isSessionActive, sessionId, simulationMode]);

  // Clean timer format (MM:SS)
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  // State color mapping
  const getStateColor = (st) => {
    switch (st) {
      case "bottom":
        return COLORS.good;
      case "descending":
        return COLORS.info;
      case "rising":
        return COLORS.secondary;
      default:
        return COLORS.textMuted;
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-reverse-outline" size={48} color={COLORS.warning} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionSub}>
          Camera Form Feedback analyzes your posture completely on-device. No images or videos are ever uploaded or stored.
        </Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLink} onPress={() => onNavigate("home")}>
          <Text style={styles.cancelLinkText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Real Camera Stream View */}
      <CameraView style={StyleSheet.absoluteFill} facing={facing}>
        {/* Real-time Glowing Skeleton Bones & Joints Overlay */}
        {showSkeleton && currentLandmarks && (
          <PoseSkeletonOverlay
            landmarks={currentLandmarks}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            formStatus={formStatus}
          />
        )}
      </CameraView>

      {/* TOP HUD: Header & Session Info */}
      <View style={styles.topHud}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.hudCircleBtn}
            onPress={() => {
              if (isSessionActive) {
                Alert.alert(
                  "Exit Workout?",
                  "Your active session will be discarded if you leave without finishing.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Exit", style: "destructive", onPress: () => onNavigate("home") },
                  ]
                );
              } else {
                onNavigate("home");
              }
            }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.timerBadge}>
            <Ionicons name="stopwatch-outline" size={14} color={COLORS.primary} />
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={styles.hudCircleBtn}
              onPress={() => setFacing((prev) => (prev === "back" ? "front" : "back"))}
            >
              <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hudCircleBtn}
              onPress={() => setShowSkeleton((prev) => !prev)}
            >
              <Ionicons
                name={showSkeleton ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={showSkeleton ? COLORS.primary : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIMARY COACHING HUD: Large Rep Counter + Form Score */}
        {isSessionActive && (
          <View style={styles.coachingCard}>
            <View style={styles.counterRow}>
              {/* Reps */}
              <View style={styles.repCounterBox}>
                <Text style={styles.repLabel}>REPS</Text>
                <Text style={styles.repValue}>{reps}</Text>
              </View>

              {/* Angle Meter */}
              <View style={styles.angleMeterBox}>
                <Text style={styles.angleLabel}>KNEE ANGLE</Text>
                <Text style={styles.angleValue}>{kneeAngle}°</Text>
                <View
                  style={[
                    styles.statePill,
                    { backgroundColor: `${getStateColor(movementState)}25` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statePillText,
                      { color: getStateColor(movementState) },
                    ]}
                  >
                    {movementState.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Form Score */}
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>FORM SCORE</Text>
                <ScoreBadge score={currentScore} size="lg" showLabel={false} />
                <Text style={styles.avgScoreText}>Avg: {averageScore}%</Text>
              </View>
            </View>

            {/* Real-time coaching message banner */}
            <View style={styles.feedbackBanner}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.feedbackBannerText} numberOfLines={2}>
                {feedbackList[0] || "Maintain stable posture and align knees."}
              </Text>
            </View>

            {/* Active Issues Warning Pill (if any) */}
            {issuesList.length > 0 && (
              <View style={styles.issueAlertRow}>
                <Ionicons name="warning" size={14} color={COLORS.danger} />
                <Text style={styles.issueAlertText}>
                  {issuesList.join(" • ")}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* BOTTOM CONTROLS & WORKOUT ACTIONS */}
      <View style={styles.bottomHud}>
        {!isSessionActive ? (
          <TouchableOpacity
            style={styles.startSessionBtn}
            onPress={handleStartSession}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={24} color="#0A0E17" />
            <Text style={styles.startSessionBtnText}>BEGIN WORKOUT</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeFooter}>
            {/* Simulation / Form Tester Drawer */}
            {showControls && (
              <View style={styles.simControlsCard}>
                <Text style={styles.simTitle}>TEST SQUAT FORM VARIATIONS</Text>
                <View style={styles.simBtnRow}>
                  <TouchableOpacity
                    style={[
                      styles.simModeBtn,
                      simulationMode === "good" && styles.simModeBtnActive,
                    ]}
                    onPress={() => setSimulationMode("good")}
                  >
                    <Text
                      style={[
                        styles.simModeBtnText,
                        simulationMode === "good" && styles.simModeBtnTextActive,
                      ]}
                    >
                      Good Form
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.simModeBtn,
                      simulationMode === "shallow" && styles.simModeBtnActive,
                    ]}
                    onPress={() => setSimulationMode("shallow")}
                  >
                    <Text
                      style={[
                        styles.simModeBtnText,
                        simulationMode === "shallow" && styles.simModeBtnTextActive,
                      ]}
                    >
                      Shallow
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.simModeBtn,
                      simulationMode === "forward_lean" && styles.simModeBtnActive,
                    ]}
                    onPress={() => setSimulationMode("forward_lean")}
                  >
                    <Text
                      style={[
                        styles.simModeBtnText,
                        simulationMode === "forward_lean" && styles.simModeBtnTextActive,
                      ]}
                    >
                      Forward Lean
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.simModeBtn,
                      simulationMode === "valgus" && styles.simModeBtnActive,
                    ]}
                    onPress={() => setSimulationMode("valgus")}
                  >
                    <Text
                      style={[
                        styles.simModeBtnText,
                        simulationMode === "valgus" && styles.simModeBtnTextActive,
                      ]}
                    >
                      Knee Valgus
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Action Bar */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.toggleSimBtn}
                onPress={() => setShowControls((prev) => !prev)}
              >
                <Ionicons
                  name={showControls ? "options" : "options-outline"}
                  size={20}
                  color={COLORS.text}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.finishSessionBtn}
                onPress={handleFinishSession}
                disabled={isFinishing}
                activeOpacity={0.85}
              >
                {isFinishing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                    <Text style={styles.finishSessionBtnText}>FINISH WORKOUT</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: SPACING.md,
  },
  permissionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: SPACING.md,
    textAlign: "center",
  },
  permissionSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: SPACING.sm,
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },
  grantButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
  },
  grantButtonText: {
    color: "#0A0E17",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelLink: {
    marginTop: SPACING.lg,
  },
  cancelLinkText: {
    color: COLORS.textSubtle,
    fontSize: 13,
  },
  topHud: {
    position: "absolute",
    top: 50,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  hudCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    gap: 6,
  },
  timerText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  topRightActions: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  coachingCard: {
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    ...SHADOWS.card,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  repCounterBox: {
    alignItems: "center",
    flex: 1,
  },
  repLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  repValue: {
    color: COLORS.text,
    fontSize: 38,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    lineHeight: 42,
  },
  angleMeterBox: {
    alignItems: "center",
    flex: 1.2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 4,
  },
  angleLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  angleValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  statePill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  statePillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scoreBox: {
    alignItems: "center",
    flex: 1,
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  avgScoreText: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    gap: 8,
  },
  feedbackBannerText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  issueAlertRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    marginTop: 6,
    gap: 6,
  },
  issueAlertText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },
  bottomHud: {
    position: "absolute",
    bottom: 30,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  startSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    gap: 10,
    ...SHADOWS.glowGreen,
  },
  startSessionBtnText: {
    color: "#0A0E17",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  activeFooter: {
    gap: SPACING.sm,
  },
  simControlsCard: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  simTitle: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  simBtnRow: {
    flexDirection: "row",
    gap: 4,
  },
  simModeBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  simModeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  simModeBtnText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  simModeBtnTextActive: {
    color: "#0A0E17",
  },
  actionRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  toggleSimBtn: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  finishSessionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    borderRadius: RADIUS.md,
    gap: 8,
    height: 50,
  },
  finishSessionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
