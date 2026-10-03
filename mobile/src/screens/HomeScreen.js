import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../api/apiService";
import ScoreBadge from "../components/ScoreBadge";
import StatCard from "../components/StatCard";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../styles/theme";

export default function HomeScreen({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const health = await apiService.checkHealth();
      setServerOnline(Boolean(health && health.success));

      const [statsRes, sessionsRes] = await Promise.allSettled([
        apiService.getWorkoutStats(),
        apiService.getWorkoutSessions(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }

      if (sessionsRes.status === "fulfilled" && sessionsRes.value?.success) {
        setRecentSessions(sessionsRes.value.data || []);
      }
    } catch {
      setServerOnline(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const latestSession = recentSessions[0] || null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Hero Workout CTA */}
      <View style={styles.heroCard}>
        <View style={styles.heroTag}>
          <Text style={styles.heroTagText}>ACTIVE EXERCISE</Text>
        </View>

        <Text style={styles.heroTitle}>Squat Form Analyzer</Text>
        <Text style={styles.heroSubtitle}>
          Real-time biomechanical joint angle analysis, rep detection, and AI form coaching.
        </Text>

        <View style={styles.heroFeaturesRow}>
          <View style={styles.featureItem}>
            <Ionicons name="scan-outline" size={14} color={COLORS.primary} />
            <Text style={styles.featureText}>Knee Depth</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="body-outline" size={14} color={COLORS.primary} />
            <Text style={styles.featureText}>Torso Lean</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics-outline" size={14} color={COLORS.primary} />
            <Text style={styles.featureText}>Knee Alignment</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startWorkoutButton}
          onPress={() => onNavigate("camera", { exercise: "squat" })}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={20} color="#0A0E17" />
          <Text style={styles.startWorkoutButtonText}>START SQUAT WORKOUT</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Guarantee Pill */}
      <View style={styles.privacyCard}>
        <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
        <View style={styles.privacyContent}>
          <Text style={styles.privacyTitle}>100% Privacy Protected</Text>
          <Text style={styles.privacyDesc}>
            On-device pose landmark detection only. No video or raw frames are ever sent or saved.
          </Text>
        </View>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <TouchableOpacity onPress={() => onNavigate("stats")}>
          <Text style={styles.sectionLink}>View Charts</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Workouts"
          value={stats?.totalWorkouts ?? (recentSessions.length || 0)}
          icon="barbell-outline"
          iconColor="#38BDF8"
        />
        <StatCard
          label="Total Reps"
          value={stats?.totalReps ?? 0}
          icon="repeat-outline"
          iconColor="#10B981"
        />
      </View>

      <View style={[styles.statsGrid, { marginTop: SPACING.sm }]}>
        <StatCard
          label="Average Score"
          value={stats?.averageScore ? `${stats.averageScore}%` : "—"}
          icon="star-outline"
          iconColor="#F59E0B"
        />
        <StatCard
          label="Best Score"
          value={stats?.bestScore ? `${stats.bestScore}%` : "—"}
          icon="trophy-outline"
          iconColor="#EC4899"
        />
      </View>

      {/* Recent Session Spotlight */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Session</Text>
        <TouchableOpacity onPress={() => onNavigate("history")}>
          <Text style={styles.sectionLink}>See All</Text>
        </TouchableOpacity>
      </View>

      {latestSession ? (
        <TouchableOpacity
          style={styles.recentSessionCard}
          onPress={() => onNavigate("history", { selectedId: latestSession._id || latestSession.id })}
          activeOpacity={0.8}
        >
          <View style={styles.recentSessionTop}>
            <View>
              <Text style={styles.recentExerciseName}>
                {latestSession.exercise?.toUpperCase() || "SQUAT"}
              </Text>
              <Text style={styles.recentDate}>
                {new Date(latestSession.completedAt || latestSession.startedAt).toLocaleString(
                  undefined,
                  { dateStyle: "medium", timeStyle: "short" }
                )}
              </Text>
            </View>
            <ScoreBadge score={latestSession.averageScore} size="md" />
          </View>

          <View style={styles.recentMetricsRow}>
            <View style={styles.recentMetric}>
              <Text style={styles.recentMetricLabel}>Reps</Text>
              <Text style={styles.recentMetricVal}>{latestSession.reps || 0}</Text>
            </View>
            <View style={styles.recentMetricDivider} />
            <View style={styles.recentMetric}>
              <Text style={styles.recentMetricLabel}>Duration</Text>
              <Text style={styles.recentMetricVal}>
                {latestSession.duration ? `${latestSession.duration}s` : "—"}
              </Text>
            </View>
            <View style={styles.recentMetricDivider} />
            <View style={styles.recentMetric}>
              <Text style={styles.recentMetricLabel}>Min Knee Angle</Text>
              <Text style={styles.recentMetricVal}>
                {latestSession.minKneeAngle ? `${latestSession.minKneeAngle}°` : "—"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptySessionCard}>
          <Ionicons name="fitness-outline" size={32} color={COLORS.textSubtle} />
          <Text style={styles.emptySessionTitle}>No Workouts Recorded Yet</Text>
          <Text style={styles.emptySessionSub}>
            Start your first squat workout above to track reps and get live form coaching.
          </Text>
        </View>
      )}

      {/* Navigation Quick Actions */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigate("exercises")}
        >
          <Ionicons name="grid-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionCardTitle}>All Exercises</Text>
          <Text style={styles.actionCardSub}>4 Exercises</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigate("history")}
        >
          <Ionicons name="time-outline" size={22} color={COLORS.secondary} />
          <Text style={styles.actionCardTitle}>Workout Log</Text>
          <Text style={styles.actionCardSub}>Full History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.goodBorder,
    ...SHADOWS.card,
    marginBottom: SPACING.md,
  },
  heroTag: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.goodBg,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.goodBorder,
    marginBottom: SPACING.sm,
  },
  heroTagText: {
    color: COLORS.good,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  heroFeaturesRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: RADIUS.sm,
    gap: 5,
  },
  featureText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  startWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.glowGreen,
  },
  startWorkoutButtonText: {
    color: "#0A0E17",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  privacyDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  recentSessionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    marginBottom: SPACING.lg,
  },
  recentSessionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  recentExerciseName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  recentDate: {
    color: COLORS.textSubtle,
    fontSize: 11,
    marginTop: 2,
  },
  recentMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  recentMetric: {
    alignItems: "center",
    flex: 1,
  },
  recentMetricLabel: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  recentMetricVal: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  recentMetricDivider: {
    width: 1,
    height: "80%",
    backgroundColor: COLORS.divider,
    alignSelf: "center",
  },
  emptySessionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  emptySessionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: SPACING.sm,
  },
  emptySessionSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionCardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: SPACING.sm,
  },
  actionCardSub: {
    color: COLORS.textSubtle,
    fontSize: 11,
    marginTop: 2,
  },
});
