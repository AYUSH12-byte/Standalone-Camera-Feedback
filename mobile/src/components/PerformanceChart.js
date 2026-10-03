import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../styles/theme";

export default function PerformanceChart({ sessions = [] }) {
  if (!sessions || sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No workout history yet. Complete a workout to see performance trends!</Text>
      </View>
    );
  }

  // Display the last up to 8 sessions (oldest to newest for progression)
  const chartData = [...sessions].slice(0, 8).reverse();

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {chartData.map((item, index) => {
          const score = typeof item.averageScore === "number" ? item.averageScore : (item.score || 0);
          const heightPercent = Math.max(12, Math.min(100, score));

          let barColor = COLORS.good;
          if (score < 50) barColor = COLORS.danger;
          else if (score < 70) barColor = COLORS.warning;

          const dateLabel = item.completedAt || item.startedAt
            ? new Date(item.completedAt || item.startedAt).toLocaleDateString(undefined, {
                weekday: "narrow",
              })
            : `#${index + 1}`;

          return (
            <View key={item._id || item.id || `bar-${index}`} style={styles.barCol}>
              <Text style={styles.scoreNumber}>{score}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fillBar,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.labelCol}>{dateLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 140,
    paddingTop: SPACING.sm,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  scoreNumber: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  track: {
    width: 22,
    height: 90,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fillBar: {
    width: "100%",
    borderRadius: 6,
  },
  labelCol: {
    color: COLORS.textSubtle,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
});
