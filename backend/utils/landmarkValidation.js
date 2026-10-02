const DEFAULT_VISIBILITY_THRESHOLD = 0.5;

// Check whether coordinate is valid
const isValidCoordinate = (
  value
) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
};

// Check individual landmark
const isValidLandmark = (
  landmark,
  visibilityThreshold =
    DEFAULT_VISIBILITY_THRESHOLD
) => {
  if (!landmark) {
    return false;
  }

  // x and y must exist
  if (
    !isValidCoordinate(
      landmark.x
    ) ||
    !isValidCoordinate(
      landmark.y
    )
  ) {
    return false;
  }

  /*
   * Some pose detection systems may
   * not provide visibility.
   *
   * If visibility is missing,
   * coordinates are still considered valid.
   */
  if (
    landmark.visibility !==
      undefined &&
    landmark.visibility !== null
  ) {
    return (
      typeof landmark.visibility ===
        "number" &&
      landmark.visibility >=
        visibilityThreshold
    );
  }

  return true;
};

// Validate multiple landmarks
const validateLandmarks = (
  landmarks,
  requiredLandmarks,
  visibilityThreshold =
    DEFAULT_VISIBILITY_THRESHOLD
) => {
  const missing = [];
  const lowConfidence = [];

  requiredLandmarks.forEach(
    (landmarkName) => {
      const landmark =
        landmarks?.[
          landmarkName
        ];

      // Landmark doesn't exist
      if (!landmark) {
        missing.push(
          landmarkName
        );

        return;
      }

      // Invalid coordinates
      if (
        !isValidCoordinate(
          landmark.x
        ) ||
        !isValidCoordinate(
          landmark.y
        )
      ) {
        missing.push(
          landmarkName
        );

        return;
      }

      // Landmark exists but visibility is low
      if (
        landmark.visibility !==
          undefined &&
        landmark.visibility !==
          null &&
        landmark.visibility <
          visibilityThreshold
      ) {
        lowConfidence.push(
          landmarkName
        );
      }
    }
  );

  return {
    valid:
      missing.length === 0 &&
      lowConfidence.length === 0,

    missing,

    lowConfidence,
  };
};

module.exports = {
  DEFAULT_VISIBILITY_THRESHOLD,
  isValidCoordinate,
  isValidLandmark,
  validateLandmarks,
};