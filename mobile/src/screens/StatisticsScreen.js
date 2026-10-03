import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../api/apiService";
import PerformanceChart from "../components/PerformanceChart";
import StatCard from "../components/StatCard";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../styles/theme";

export default function StatisticsScreen() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, sessionsRes] = await Promise.allSettled([
        apiService.getWorkoutStats(),
        apiService.getWorkoutSessions(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }
      if (sessionsRes.status === "fulfilled" && sessionsRes.value?.success) {
        setSessions(sessionsRes.value.data || []);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatTotalTime = (seconds = 0) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m ${seconds % 60}s`;
  };

  const getFormRating = (avgScore = 0) => {
    if (avgScore >= 85) return { label: "Elite Posture", color: COLORS.good };
    if (avgScore >= 70) return { label: "Solid Form", color: COLORS.good };
    if (avgScore >= 50) return { label: "Progressing", color: COLORS.warning };
    return { label: "Needs Coaching", color: COLORS.danger };
  };

  const rating = getFormRating(stats?.averageScore || 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={fetchStats}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Performance Analytics</Text>
        <Text style={styles.subtitle}>
          Aggregated biomechanical statistics across all squat workouts.
        </Text>
      </View>

      {/* Hero Form Rating Pill */}
      <View style={styles.ratingHero}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingTitle}>FORM CONSISTENCY</Text>
          <Text style={[styles.ratingLabel, { color: rating.color }]}>
            {rating.label}
          </Text>
          <Text style={styles.ratingSub}>
            Based on {stats?.totalWorkouts || sessions.length || 0} completed session{stats?.totalWorkouts === 1 ? "" : "s"}
          </Text>
        </View>

        <View style={styles.ratingScoreCircle}>
          <Text style={styles.ratingScoreVal}>{stats?.averageScore ?? 0}</Text>
          <Text style={styles.ratingScoreUnit}>/100</Text>
        </View>
      </View>

      {/* Performance Bar Chart */}
      <View style={styles.sectionHeader}>
        <Ionicons name="bar-chart-outline" size={16} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Recent Score Progression</Text>
      </View>

      <PerformanceChart sessions={sessions} />

      {/* Aggregate Statistics 2x2 Grid */}
      <View style={styles.sectionHeader}>
        <Ionicons name="stats-chart-outline" size={16} color={COLORS.secondary} />
        <Text style={styles.sectionTitle}>Total Lifetime Volume</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Workouts"
          value={stats?.totalWorkouts ?? sessions.length}
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
          label="Best Score"
          value={stats?.bestScore ? `${stats.bestScore}%` : "—"}
          icon="trophy-outline"
          iconColor="#EC4899"
        />
        <StatCard
          label="Total Training Time"
          value={formatTotalTime(stats?.totalDuration || 0)}
          icon="time-outline"
          iconColor="#F59E0B"
        />
      </View>

      <View style={[styles.statsGrid, { marginTop: SPACING.sm }]}>
        <StatCard
          label="Avg Reps / Session"
          value={stats?.averageRepsPerWorkout ?? 0}
          icon="speedometer-outline"
          iconColor="#A855F7"
        />
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
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  ratingHero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  ratingLeft: {
    flex: 1,
  },
  ratingTitle: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  ratingLabel: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  ratingSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  ratingScoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ratingScoreVal: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  ratingScoreUnit: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
});
