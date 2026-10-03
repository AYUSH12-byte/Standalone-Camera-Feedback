import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { COLORS } from "../styles/theme";

// Bones connects pairs of landmark keys
const BONE_CONNECTIONS = [
  // Shoulders & Torso
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],

  // Arms
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],

  // Legs (critical for Squat)
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
];

export default function PoseSkeletonOverlay({
  landmarks,
  width,
  height,
  formStatus = "good",
}) {
  if (!landmarks || !width || !height) {
    return null;
  }

  // Choose glowing bone color based on current form quality
  let boneColor = COLORS.good;
  if (formStatus === "poor") {
    boneColor = COLORS.danger;
  } else if (formStatus === "needs_improvement") {
    boneColor = COLORS.warning;
  }

  const getCoordinates = (landmarkKey) => {
    const pt = landmarks[landmarkKey];
    if (!pt || typeof pt.x !== "number" || typeof pt.y !== "number") {
      return null;
    }
    // Visibility threshold
    if (typeof pt.visibility === "number" && pt.visibility < 0.4) {
      return null;
    }

    return {
      x: pt.x * width,
      y: pt.y * height,
    };
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {/* Draw Bones */}
        {BONE_CONNECTIONS.map(([startKey, endKey], index) => {
          const start = getCoordinates(startKey);
          const end = getCoordinates(endKey);

          if (!start || !end) return null;

          // Emphasize knee & hip bones
          const isLeg = startKey.includes("Knee") || endKey.includes("Knee");

          return (
            <Line
              key={`bone-${index}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={boneColor}
              strokeWidth={isLeg ? 5 : 3.5}
              strokeLinecap="round"
              strokeOpacity={0.9}
            />
          );
        })}

        {/* Draw Joint Keypoints */}
        {Object.entries(landmarks).map(([key, point]) => {
          const coords = getCoordinates(key);
          if (!coords) return null;

          const isKneeOrHip = key.includes("Knee") || key.includes("Hip");

          return (
            <React.Fragment key={`joint-grp-${key}`}>
              {/* Outer halo */}
              <Circle
                cx={coords.x}
                cy={coords.y}
                r={isKneeOrHip ? 8 : 6}
                fill={COLORS.skeletonJoint}
                fillOpacity={0.4}
              />
              {/* Inner core */}
              <Circle
                cx={coords.x}
                cy={coords.y}
                r={isKneeOrHip ? 5 : 3.5}
                fill="#FFFFFF"
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
