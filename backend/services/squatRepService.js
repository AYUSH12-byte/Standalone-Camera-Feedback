const STANDING_ANGLE = 160;

const DESCENDING_ANGLE = 140;

const BOTTOM_ANGLE = 105;

const RISING_ANGLE = 130;

// Get average knee angle
const getAverageKneeAngle = (
  landmarks
) => {
  if (!landmarks) {
    return null;
  }

  const leftKnee =
    landmarks.leftKnee;

  const rightKnee =
    landmarks.rightKnee;

  if (!leftKnee || !rightKnee) {
    return null;
  }

  const calculateAngle = (
    pointA,
    pointB,
    pointC
  ) => {
    if (
      !pointA ||
      !pointB ||
      !pointC
    ) {
      return null;
    }

    const vectorBA = {
      x:
        pointA.x -
        pointB.x,

      y:
        pointA.y -
        pointB.y,
    };

    const vectorBC = {
      x:
        pointC.x -
        pointB.x,

      y:
        pointC.y -
        pointB.y,
    };

    const dotProduct =
      vectorBA.x *
        vectorBC.x +
      vectorBA.y *
        vectorBC.y;

    const magnitudeBA =
      Math.sqrt(
        vectorBA.x ** 2 +
          vectorBA.y ** 2
      );

    const magnitudeBC =
      Math.sqrt(
        vectorBC.x ** 2 +
          vectorBC.y ** 2
      );

    if (
      magnitudeBA === 0 ||
      magnitudeBC === 0
    ) {
      return null;
    }

    const cosine =
      dotProduct /
      (magnitudeBA *
        magnitudeBC);

    const safeCosine =
      Math.max(
        -1,
        Math.min(
          1,
          cosine
        )
      );

    const angle =
      Math.acos(
        safeCosine
      ) *
      (180 / Math.PI);

    return angle;
  };

  const leftAngle =
    calculateAngle(
      landmarks.leftHip,
      landmarks.leftKnee,
      landmarks.leftAnkle
    );

  const rightAngle =
    calculateAngle(
      landmarks.rightHip,
      landmarks.rightKnee,
      landmarks.rightAnkle
    );

  if (
    leftAngle === null &&
    rightAngle === null
  ) {
    return null;
  }

  if (leftAngle === null) {
    return Math.round(
      rightAngle
    );
  }

  if (rightAngle === null) {
    return Math.round(
      leftAngle
    );
  }

  return Math.round(
    (leftAngle + rightAngle) /
      2
  );
};

// Update squat state
const updateSquatState = ({
  kneeAngle,
  previousAngle,
  previousState,
  reps,
}) => {
  if (kneeAngle === null) {
    return {
      reps,

      state:
        previousState ||
        "standing",

      position: "unknown",

      repCompleted: false,
    };
  }

  let state =
    previousState ||
    "standing";

  let updatedReps = reps;

  let repCompleted = false;

  // Standing
  if (
    state === "standing"
  ) {
    if (
      kneeAngle <
      DESCENDING_ANGLE
    ) {
      state = "descending";
    }
  }

  // Descending
  else if (
    state === "descending"
  ) {
    if (
      kneeAngle <=
      BOTTOM_ANGLE
    ) {
      state = "bottom";
    } else if (
      kneeAngle >=
      STANDING_ANGLE
    ) {
      state = "standing";
    }
  }

  // Bottom
  else if (
    state === "bottom"
  ) {
    if (
      kneeAngle >
      RISING_ANGLE
    ) {
      state = "rising";
    }
  }

  // Rising
  else if (
    state === "rising"
  ) {
    if (
      kneeAngle >=
      STANDING_ANGLE
    ) {
      updatedReps += 1;

      repCompleted = true;

      state = "standing";
    } else if (
      kneeAngle <=
      BOTTOM_ANGLE
    ) {
      state = "bottom";
    }
  }

  // Determine user position
  let position = "standing";

  if (
    kneeAngle <=
    BOTTOM_ANGLE
  ) {
    position = "bottom";
  } else if (
    kneeAngle <
    STANDING_ANGLE
  ) {
    position = "squatting";
  }

  return {
    reps: updatedReps,

    state,

    position,

    repCompleted,
  };
};

module.exports = {
  getAverageKneeAngle,
  updateSquatState,

  STANDING_ANGLE,
  DESCENDING_ANGLE,
  BOTTOM_ANGLE,
  RISING_ANGLE,
};