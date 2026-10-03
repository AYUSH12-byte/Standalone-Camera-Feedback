import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "./src/components/Header";
import HomeScreen from "./src/screens/HomeScreen";
import ExerciseSelectionScreen from "./src/screens/ExerciseSelectionScreen";
import SquatCameraScreen from "./src/screens/SquatCameraScreen";
import WorkoutResultScreen from "./src/screens/WorkoutResultScreen";
import WorkoutHistoryScreen from "./src/screens/WorkoutHistoryScreen";
import StatisticsScreen from "./src/screens/StatisticsScreen";
import { COLORS, RADIUS, SPACING } from "./src/styles/theme";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [routeParams, setRouteParams] = useState({});

  const navigate = (screenName, params = {}) => {
    setRouteParams(params);
    setCurrentScreen(screenName);
  };

  // Full-screen experiences (Camera & Result modal)
  if (currentScreen === "camera") {
    return (
      <View style={styles.fullScreenWrapper}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SquatCameraScreen onNavigate={navigate} routeParams={routeParams} />
      </View>
    );
  }

  if (currentScreen === "result") {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <WorkoutResultScreen onNavigate={navigate} routeParams={routeParams} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Top Header with Active Server Status */}
      <Header />

      {/* Main Screen Content */}
      <View style={styles.contentContainer}>
        {currentScreen === "home" && <HomeScreen onNavigate={navigate} />}
        {currentScreen === "exercises" && (
          <ExerciseSelectionScreen onNavigate={navigate} />
        )}
        {currentScreen === "history" && (
          <WorkoutHistoryScreen
            routeParams={routeParams}
            onNavigate={navigate}
          />
        )}
        {currentScreen === "stats" && <StatisticsScreen onNavigate={navigate} />}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate("home")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentScreen === "home" ? "home" : "home-outline"}
            size={22}
            color={currentScreen === "home" ? COLORS.primary : COLORS.textSubtle}
          />
          <Text
            style={[
              styles.navLabel,
              currentScreen === "home" && styles.navLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate("exercises")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentScreen === "exercises" ? "grid" : "grid-outline"}
            size={22}
            color={
              currentScreen === "exercises" ? COLORS.primary : COLORS.textSubtle
            }
          />
          <Text
            style={[
              styles.navLabel,
              currentScreen === "exercises" && styles.navLabelActive,
            ]}
          >
            Exercises
          </Text>
        </TouchableOpacity>

        {/* Center Floating Camera Action */}
        <TouchableOpacity
          style={styles.centerFab}
          onPress={() => navigate("camera", { exercise: "squat" })}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={26} color="#0A0E17" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate("history")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentScreen === "history" ? "time" : "time-outline"}
            size={22}
            color={
              currentScreen === "history" ? COLORS.primary : COLORS.textSubtle
            }
          />
          <Text
            style={[
              styles.navLabel,
              currentScreen === "history" && styles.navLabelActive,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate("stats")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentScreen === "stats" ? "stats-chart" : "stats-chart-outline"}
            size={22}
            color={
              currentScreen === "stats" ? COLORS.primary : COLORS.textSubtle
            }
          />
          <Text
            style={[
              styles.navLabel,
              currentScreen === "stats" && styles.navLabelActive,
            ]}
          >
            Analytics
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullScreenWrapper: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    flex: 1,
  },
  navLabel: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});
