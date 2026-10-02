const DEFAULT_WINDOW_SIZE = 5;

const cloneLandmarks = (landmarks) => {
  return JSON.parse(JSON.stringify(landmarks));
};

const smoothLandmarks = (
  history,
  currentLandmarks,
  windowSize = DEFAULT_WINDOW_SIZE,
) => {
  if (!currentLandmarks || typeof currentLandmarks !== "object") {
    return currentLandmarks;
  }

  const updatedHistory = [...history, cloneLandmarks(currentLandmarks)].slice(
    -windowSize,
  );

  const smoothedLandmarks = {};

  const landmarkNames = new Set();

  updatedHistory.forEach((frame) => {
    Object.keys(frame).forEach((name) => {
      landmarkNames.add(name);
    });
  });

  landmarkNames.forEach((landmarkName) => {
    const points = updatedHistory
      .map((frame) => frame[landmarkName])
      .filter(
        (point) =>
          point && typeof point.x === "number" && typeof point.y === "number",
      );

    if (points.length === 0) {
      return;
    }

    const averageX =
      points.reduce((sum, point) => sum + point.x, 0) / points.length;

    const averageY =
      points.reduce((sum, point) => sum + point.y, 0) / points.length;

    const latestPoint = currentLandmarks[landmarkName];

    smoothedLandmarks[landmarkName] = {
      x: Number(averageX.toFixed(4)),
      y: Number(averageY.toFixed(4)),
    };

    if (latestPoint?.visibility !== undefined) {
      smoothedLandmarks[landmarkName].visibility = latestPoint.visibility;
    }

    if (latestPoint?.score !== undefined) {
      smoothedLandmarks[landmarkName].score = latestPoint.score;
    }
  });

  return {
    landmarks: smoothedLandmarks,
    history: updatedHistory,
  };
};

module.exports = {
  DEFAULT_WINDOW_SIZE,
  smoothLandmarks,
};
