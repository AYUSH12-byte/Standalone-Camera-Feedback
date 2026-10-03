import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScoreBadge from "../components/ScoreBadge";
import StatCard from "../components/StatCard";
import { COLORS, RADIUS, SPACING } from "../styles/theme";

export default function WorkoutDetailModal({ visible, session, onClose }) {
  if (!session) return null;

  const repEvaluations = Array.isArray(session.repEvaluations)
    ? session.repEvaluations
    : [];

  const formatDuration = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  const formattedDate = new Date(
    session.completedAt || session.startedAt || Date.now()
  ).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Modal Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.modalTitle}>Workout Breakdown</Text>
            <Text style={styles.modalDate}>{formattedDate}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Summary Row */}
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View>
                <Text style={styles.exerciseName}>
                  {session.exercise?.toUpperCase() || "SQUAT"}
                </Text>
                <Text style={styles.sessionStatus}>Completed Session</Text>
              </View>
              <ScoreBadge score={session.averageScore} size="lg" />
            </View>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <StatCard
              label="Total Reps"
              value={session.reps || 0}
              icon="repeat"
              iconColor="#10B981"
            />
            <StatCard
              label="Duration"
              value={formatDuration(session.duration)}
              icon="time"
              iconColor="#38BDF8"
            />
          </View>

          <View style={[styles.metricsGrid, { marginTop: SPACING.sm }]}>
            <StatCard
              label="Peak Depth"
              value={session.minKneeAngle ? `${session.minKneeAngle}°` : "—"}
              icon="swap-vertical"
              iconColor="#F59E0B"
            />
            <StatCard
              label="Top Extension"
              value={session.maxKneeAngle ? `${session.maxKneeAngle}°` : "—"}
              icon="arrow-up"
              iconColor="#6366F1"
            />
          </View>

          {/* Feedback & Corrections */}
          {Array.isArray(session.feedback) && session.feedback.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Coaching Insights</Text>
              {session.feedback.map((item, idx) => (
                <View key={`fb-${idx}`} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Issues */}
          {Array.isArray(session.issues) && session.issues.length > 0 && (
            <View style={[styles.card, styles.issuesCard]}>
              <Text style={[styles.cardTitle, { color: COLORS.danger }]}>
                Issues Detected
              </Text>
              {session.issues.map((item, idx) => (
                <View key={`iss-${idx}`} style={styles.issueRow}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.issueText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Individual Reps */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Repetition Analysis ({repEvaluations.length})
            </Text>

            {repEvaluations.length > 0 ? (
              repEvaluations.map((rep, idx) => (
                <View key={`rep-${idx}`} style={styles.repItem}>
                  <View style={styles.repLeft}>
                    <Text style={styles.repNumberText}>Rep #{rep.repNumber}</Text>
                    <Text style={styles.repAngleText}>
                      Min angle: {rep.minKneeAngle ? `${rep.minKneeAngle}°` : "—"}
                    </Text>
                    {Array.isArray(rep.feedback) && rep.feedback[0] ? (
                      <Text style={styles.repFeedbackText}>
                        "{rep.feedback[0]}"
                      </Text>
                    ) : null}
                  </View>
                  <ScoreBadge score={rep.score} size="sm" showLabel={false} />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No single rep breakdowns saved.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  modalDate: {
    color: COLORS.textSubtle,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  sessionStatus: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
  },
  issuesCard: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderColor: COLORS.dangerBorder,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    color: COLORS.textMuted,
    fontSize: 13,
    flex: 1,
  },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  issueText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  repItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  repLeft: {
    flex: 1,
  },
  repNumberText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  repAngleText: {
    color: COLORS.textSubtle,
    fontSize: 11,
    marginTop: 2,
  },
  repFeedbackText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.textSubtle,
    fontSize: 13,
  },
});
