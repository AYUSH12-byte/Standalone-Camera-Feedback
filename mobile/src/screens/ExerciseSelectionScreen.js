import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APP_CONFIG } from "../config";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../styles/theme";

export default function ExerciseSelectionScreen({ onNavigate }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Exercise</Text>
        <Text style={styles.subtitle}>
          Select a movement to start camera pose tracking and real-time form coaching.
        </Text>
      </View>

      <View style={styles.exerciseList}>
        {APP_CONFIG.supportedExercises.map((exercise) => {
          const isSquat = exercise.id === "squat";

          return (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.card,
                isSquat && styles.cardActive,
                !exercise.isAvailable && styles.cardDisabled,
              ]}
              disabled={!exercise.isAvailable}
              onPress={() => {
                if (exercise.isAvailable) {
                  onNavigate("camera", { exercise: exercise.id });
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${exercise.color}25` },
                  ]}
                >
                  <Ionicons
                    name={exercise.icon || "fitness"}
                    size={24}
                    color={exercise.color}
                  />
                </View>

                {exercise.isAvailable ? (
                  <View style={styles.readyBadge}>
                    <View style={styles.readyDot} />
                    <Text style={styles.readyText}>READY</Text>
                  </View>
                ) : (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>COMING SOON</Text>
                  </View>
                )}
              </View>

              <Text style={styles.name}>{exercise.name}</Text>
              <Text style={styles.bodyPart}>{exercise.subtitle}</Text>
              <Text style={styles.description}>{exercise.description}</Text>

              <View style={styles.cardFooter}>
                {exercise.isAvailable ? (
                  <View style={styles.startRow}>
                    <Text style={styles.startActionText}>Launch Camera</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={COLORS.primary}
                    />
                  </View>
                ) : (
                  <Text style={styles.pendingActionText}>
                    Architecture ready in backend
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: SPACING.lg,
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
    marginTop: 4,
  },
  exerciseList: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardActive: {
    borderColor: COLORS.goodBorder,
  },
  cardDisabled: {
    opacity: 0.65,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.goodBg,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.goodBorder,
  },
  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.good,
    marginRight: 6,
  },
  readyText: {
    color: COLORS.good,
    fontSize: 10,
    fontWeight: "800",
  },
  soonBadge: {
    backgroundColor: COLORS.surface,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  soonText: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
  },
  name: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  bodyPart: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: SPACING.sm,
  },
  cardFooter: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  startRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  startActionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  pendingActionText: {
    color: COLORS.textSubtle,
    fontSize: 12,
    fontStyle: "italic",
  },
});
