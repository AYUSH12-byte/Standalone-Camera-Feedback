const getRepStatus = (score) => {
  if (score >= 85) {
    return "good";
  }

  if (score >= 70) {
    return "needs_improvement";
  }

  return "poor";
};

const createRepEvaluation = ({
  repNumber,
  scores = [],
  feedback = [],
  issues = [],
  minKneeAngle = null,
  maxKneeAngle = null,
}) => {
  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        )
      : 0;

  return {
    repNumber,

    score: averageScore,

    status: getRepStatus(averageScore),

    feedback: [...new Set(feedback)],

    issues: [...new Set(issues)],

    minKneeAngle,

    maxKneeAngle,
  };
};

module.exports = {
  getRepStatus,
  createRepEvaluation,
};
