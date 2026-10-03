import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../api/apiService";
import ScoreBadge from "../components/ScoreBadge";
import WorkoutDetailModal from "./WorkoutDetailModal";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../styles/theme";

export default function WorkoutHistoryScreen({ routeParams, onNavigate }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getWorkoutSessions();
      if (res && res.success && Array.isArray(res.data)) {
        setSessions(res.data);

        // Auto-open selectedId if passed from navigation
        if (routeParams?.selectedId) {
          const matched = res.data.find(
            (s) => (s._id || s.id) === routeParams.selectedId
          );
          if (matched) {
            setSelectedSession(matched);
            setModalVisible(true);
          }
        }
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }, [routeParams?.selectedId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const formatDuration = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins}m ${rem}s`;
  };

  const renderSessionCard = ({ item }) => {
    const dateStr = new Date(
      item.completedAt || item.startedAt || Date.now()
    ).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedSession(item);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.exerciseName}>
              {item.exercise?.toUpperCase() || "SQUAT"}
            </Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <ScoreBadge score={item.averageScore} size="md" />
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>REPS</Text>
            <Text style={styles.metricVal}>{item.reps || 0}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>TIME</Text>
            <Text style={styles.metricVal}>{formatDuration(item.duration)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>MIN DEPTH</Text>
            <Text style={styles.metricVal}>
              {item.minKneeAngle ? `${item.minKneeAngle}°` : "—"}
            </Text>
          </View>
        </View>

        {Array.isArray(item.feedback) && item.feedback[0] && (
          <View style={styles.previewFeedback}>
            <Ionicons name="chatbubble-outline" size={13} color={COLORS.primary} />
            <Text style={styles.feedbackText} numberOfLines={1}>
              {item.feedback[0]}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout History</Text>
        <Text style={styles.subtitle}>
          {sessions.length} recorded session{sessions.length === 1 ? "" : "s"}
        </Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item, index) => item._id || item.id || `session-${index}`}
        renderItem={renderSessionCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchSessions}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={48} color={COLORS.textSubtle} />
              <Text style={styles.emptyTitle}>No Recorded Workouts</Text>
              <Text style={styles.emptySub}>
                Your completed squats will show up here along with scores and rep evaluations.
              </Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => onNavigate("camera", { exercise: "squat" })}
              >
                <Text style={styles.startBtnText}>Start First Workout</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        visible={modalVisible}
        session={selectedSession}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  dateText: {
    color: COLORS.textSubtle,
    fontSize: 11,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  metricCol: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
  },
  metricVal: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: "80%",
    backgroundColor: COLORS.divider,
    alignSelf: "center",
  },
  previewFeedback: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: 6,
  },
  feedbackText: {
    color: COLORS.textMuted,
    fontSize: 12,
    flex: 1,
  },
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: SPACING.md,
  },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
  },
  startBtnText: {
    color: "#0A0E17",
    fontSize: 14,
    fontWeight: "700",
  },
});
