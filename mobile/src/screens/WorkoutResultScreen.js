import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScoreBadge from "../components/ScoreBadge";
import StatCard from "../components/StatCard";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../styles/theme";

export default function WorkoutResultScreen({ routeParams, onNavigate }) {
  const result = routeParams?.result || {};
  const repEvaluations = Array.isArray(result.repEvaluations)
    ? result.repEvaluations
    : [];

  // Duration formatted (e.g. 01:32)
  const formatDuration = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  // Best & worst rep calculations
  let bestRep = null;
  let worstRep = null;

  if (repEvaluations.length > 0) {
    bestRep = [...repEvaluations].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    worstRep = [...repEvaluations].sort((a, b) => (a.score || 0) - (b.score || 0))[0];
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Trophy Hero */}
      <View style={styles.heroBox}>
        <View style={styles.trophyCircle}>
          <Ionicons name="trophy" size={32} color={COLORS.good} />
        </View>
        <Text style={styles.congratsTitle}>Workout Completed!</Text>
        <Text style={styles.exerciseSubtitle}>
          {result.exercise?.toUpperCase() || "SQUAT"} SESSION SUMMARY
        </Text>

        <View style={styles.scoreRow}>
          <ScoreBadge score={result.averageScore || 0} size="lg" />
        </View>
      </View>

      {/* Top Metrics Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Total Reps"
          value={result.reps ?? 0}
          unit="reps"
          icon="repeat"
          iconColor="#10B981"
        />
        <StatCard
          label="Duration"
          value={formatDuration(result.duration)}
          unit=""
          icon="time-outline"
          iconColor="#38BDF8"
        />
      </View>

      {/* Best vs Worst Rep Comparison */}
      {repEvaluations.length > 0 && (
        <View style={styles.comparisonRow}>
          <View style={styles.compareCard}>
            <View style={styles.compareHeader}>
              <Ionicons name="star" size={14} color={COLORS.good} />
              <Text style={styles.compareLabel}>BEST REP</Text>
            </View>
            <Text style={styles.compareVal}>#{bestRep?.repNumber || 1}</Text>
            <Text style={styles.compareScore}>{bestRep?.score ?? "—"} pts</Text>
            <Text style={styles.compareAngle}>
              Depth: {bestRep?.minKneeAngle ?? "—"}°
            </Text>
          </View>

          <View style={styles.compareCard}>
            <View style={styles.compareHeader}>
              <Ionicons name="alert-circle" size={14} color={COLORS.warning} />
              <Text style={styles.compareLabel}>WORST REP</Text>
            </View>
            <Text style={styles.compareVal}>#{worstRep?.repNumber || 1}</Text>
            <Text style={styles.compareScore}>{worstRep?.score ?? "—"} pts</Text>
            <Text style={styles.compareAngle}>
              Depth: {worstRep?.minKneeAngle ?? "—"}°
            </Text>
          </View>
        </View>
      )}

      {/* Main Coaching Feedback */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Key Coaching Feedback</Text>
        </View>

        {Array.isArray(result.feedback) && result.feedback.length > 0 ? (
          result.feedback.map((item, idx) => (
            <View key={`fb-${idx}`} style={styles.bulletRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyFeedbackText}>
            Great consistency! Keep practicing to build power and stamina.
          </Text>
        )}
      </View>

      {/* Issues Detected */}
      {Array.isArray(result.issues) && result.issues.length > 0 && (
        <View style={[styles.sectionCard, styles.issuesCard]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="warning-outline" size={18} color={COLORS.danger} />
            <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>
              Form Corrections Required
            </Text>
          </View>

          {result.issues.map((item, idx) => (
            <View key={`issue-${idx}`} style={styles.issueRow}>
              <Ionicons name="close-circle" size={16} color={COLORS.danger} />
              <Text style={styles.issueText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Per-Repetition Breakdown Table */}
      {repEvaluations.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="list-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Repetition Breakdown</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 0.8 }]}>REP</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>SCORE</Text>
            <Text style={[styles.th, { flex: 1 }]}>DEPTH</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>STATUS</Text>
          </View>

          {repEvaluations.map((rep, idx) => (
            <View key={`rep-row-${idx}`} style={styles.tableRow}>
              <Text style={[styles.tdRep, { flex: 0.8 }]}>#{rep.repNumber}</Text>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.tdScore}>{rep.score} pts</Text>
              </View>
              <Text style={[styles.tdAngle, { flex: 1 }]}>
                {rep.minKneeAngle ? `${rep.minKneeAngle}°` : "—"}
              </Text>
              <View style={{ flex: 1.5 }}>
                <ScoreBadge score={rep.score} size="sm" showLabel={false} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onNavigate("camera", { exercise: "squat" })}
          activeOpacity={0.85}
        >
          <Ionicons name="reload" size={18} color="#0A0E17" />
          <Text style={styles.primaryBtnText}>START ANOTHER SQUAT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => onNavigate("history")}
          activeOpacity={0.85}
        >
          <Ionicons name="time" size={18} color={COLORS.text} />
          <Text style={styles.secondaryBtnText}>View in Workout History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textBtn}
          onPress={() => onNavigate("home")}
        >
          <Text style={styles.textBtnText}>Return to Dashboard</Text>
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
  heroBox: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  trophyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.goodBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.goodBorder,
    marginBottom: SPACING.md,
  },
  congratsTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  exerciseSubtitle: {
    color: COLORS.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  scoreRow: {
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  comparisonRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  compareCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  compareLabel: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  compareVal: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  compareScore: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  compareAngle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  issuesCard: {
    borderColor: COLORS.dangerBorder,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: 10,
  },
  bulletText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  emptyFeedbackText: {
    color: COLORS.textSubtle,
    fontSize: 13,
    fontStyle: "italic",
  },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.xs,
  },
  issueText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: SPACING.xs,
  },
  th: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  tdRep: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  tdScore: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  tdAngle: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  actionButtons: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.glowGreen,
  },
  primaryBtnText: {
    color: "#0A0E17",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 8,
  },
  secondaryBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  textBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  textBtnText: {
    color: COLORS.textSubtle,
    fontSize: 13,
    fontWeight: "600",
  },
});
