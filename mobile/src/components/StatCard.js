import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../styles/theme";

export default function StatCard({
  label,
  value,
  unit = "",
  icon,
  iconColor = COLORS.primary,
  subtext,
  flex = 1,
}) {
  return (
    <View style={[styles.card, { flex }]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {icon && (
          <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={icon} size={16} color={iconColor} />
          </View>
        )}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  unit: {
    color: COLORS.textSubtle,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  subtext: {
    color: COLORS.textSubtle,
    fontSize: 11,
    marginTop: 4,
  },
});
