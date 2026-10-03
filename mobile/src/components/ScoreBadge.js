import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../styles/theme";

export default function ScoreBadge({ score, size = "md", showLabel = true }) {
  const numericScore = typeof score === "number" ? Math.round(score) : 0;

  let color = COLORS.good;
  let bg = COLORS.goodBg;
  let borderColor = COLORS.goodBorder;
  let label = "Good Form";

  if (numericScore < 50) {
    color = COLORS.danger;
    bg = COLORS.dangerBg;
    borderColor = COLORS.dangerBorder;
    label = "Poor Form";
  } else if (numericScore < 70) {
    color = COLORS.warning;
    bg = COLORS.warningBg;
    borderColor = COLORS.warningBorder;
    label = "Needs Work";
  }

  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: borderColor,
          paddingVertical: isSmall ? 3 : isLarge ? 8 : 5,
          paddingHorizontal: isSmall ? 8 : isLarge ? 14 : 10,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.scoreText,
          {
            color: color,
            fontSize: isSmall ? 12 : isLarge ? 18 : 14,
            fontWeight: "700",
          },
        ]}
      >
        {numericScore}
      </Text>
      {showLabel && (
        <Text
          style={[
            styles.labelText,
            {
              color: color,
              fontSize: isSmall ? 10 : isLarge ? 13 : 11,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  scoreText: {
    fontVariant: ["tabular-nums"],
  },
  labelText: {
    marginLeft: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
