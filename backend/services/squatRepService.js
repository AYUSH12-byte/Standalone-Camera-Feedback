const calculateAngle = (a, b, c) => {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180) / Math.PI);

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
};


const getAverageKneeAngle = (landmarks) => {
  if (
    !landmarks?.leftHip ||
    !landmarks?.rightHip ||
    !landmarks?.leftKnee ||
    !landmarks?.rightKnee ||
    !landmarks?.leftAnkle ||
    !landmarks?.rightAnkle
  ) {
    return null;
  }

  const leftAngle = calculateAngle(
    landmarks.leftHip,
    landmarks.leftKnee,
    landmarks.leftAnkle
  );

  const rightAngle = calculateAngle(
    landmarks.rightHip,
    landmarks.rightKnee,
    landmarks.rightAnkle
  );

  return Math.round(
    (leftAngle + rightAngle) / 2
  );
};


const getSquatPosition = (kneeAngle) => {
  if (kneeAngle === null) {
    return "unknown";
  }

  if (kneeAngle >= 160) {
    return "standing";
  }

  if (kneeAngle <= 100) {
    return "bottom";
  }

  return "middle";
};


const updateSquatState = ({
  kneeAngle,
  previousAngle,
  previousState = "standing",
  reps = 0,
}) => {
  if (kneeAngle === null) {
    return {
      state: previousState,
      reps,
      kneeAngle: null,
      position: "unknown",
    };
  }

  const position = getSquatPosition(
    kneeAngle
  );

  let state = previousState;
  let updatedReps = reps;

  /*
   * STANDING → DESCENDING
   */

  if (
    previousState === "standing" &&
    previousAngle !== null &&
    kneeAngle < previousAngle &&
    position !== "standing"
  ) {
    state = "descending";
  }

  /*
   * DESCENDING → BOTTOM
   */

  if (
    previousState === "descending" &&
    position === "bottom"
  ) {
    state = "bottom";
  }

  /*
   * BOTTOM → RISING
   */

  if (
    previousState === "bottom" &&
    previousAngle !== null &&
    kneeAngle > previousAngle
  ) {
    state = "rising";
  }

  /*
   * RISING → STANDING
   *
   * Rep completed.
   */

  if (
    previousState === "rising" &&
    position === "standing"
  ) {
    updatedReps += 1;
    state = "standing";
  }

  return {
    state,
    reps: updatedReps,
    kneeAngle: Math.round(kneeAngle),
    position,
  };
};


module.exports = {
  calculateAngle,
  getAverageKneeAngle,
  getSquatPosition,
  updateSquatState,
};