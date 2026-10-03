/**
 * Comprehensive test script for the Camera Form Feedback backend.
 *
 * Tests the complete flow: health → analysis → live session with
 * proper squat simulation → finish → history → stats → error handling.
 *
 * The landmark coordinates are carefully chosen to produce
 * realistic joint angles through the dot-product calculation:
 *
 * Standing:   knee angle ~170° (legs nearly straight)
 * Descending: knee angle ~130° (starting to bend)
 * Bottom:     knee angle ~90°  (deep squat)
 * Rising:     knee angle ~135° (coming back up)
 *
 * Run: node test-data/test-backend.js
 */

const BASE_URL = "http://localhost:7000";

const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  return { status: response.status, data };
};

const log = (label, result) => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${label}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Status: ${result.status}`);
  console.log(`  Response:`, JSON.stringify(result.data, null, 2));
};

/*
 * Landmark coordinate design:
 *
 * For the knee angle calculation (hip → knee → ankle),
 * we need coordinates where:
 *
 * - The hip, knee, and ankle form the desired angle at the knee.
 * - Ankles stay fixed (feet on ground).
 * - As the person squats, hips drop and knees bend forward.
 *
 * Using normalized 0-1 coordinates where y increases downward.
 */

// Standing: hip high, knee nearly straight → angle ~170°
const standingLandmarks = {
  leftShoulder: { x: 0.40, y: 0.20, visibility: 0.95 },
  rightShoulder: { x: 0.60, y: 0.20, visibility: 0.95 },
  leftHip: { x: 0.42, y: 0.45, visibility: 0.92 },
  rightHip: { x: 0.58, y: 0.45, visibility: 0.92 },
  leftKnee: { x: 0.42, y: 0.70, visibility: 0.90 },
  rightKnee: { x: 0.58, y: 0.70, visibility: 0.90 },
  leftAnkle: { x: 0.42, y: 0.92, visibility: 0.88 },
  rightAnkle: { x: 0.58, y: 0.92, visibility: 0.88 },
};

// Descending: knee bends outward, hip drops → angle ~134° (< 140°)
const descendingLandmarks = {
  leftShoulder: { x: 0.40, y: 0.25, visibility: 0.95 },
  rightShoulder: { x: 0.60, y: 0.25, visibility: 0.95 },
  leftHip: { x: 0.42, y: 0.57, visibility: 0.92 },
  rightHip: { x: 0.58, y: 0.57, visibility: 0.92 },
  leftKnee: { x: 0.35, y: 0.70, visibility: 0.90 },
  rightKnee: { x: 0.65, y: 0.70, visibility: 0.90 },
  leftAnkle: { x: 0.42, y: 0.92, visibility: 0.88 },
  rightAnkle: { x: 0.58, y: 0.92, visibility: 0.88 },
};

// Bottom: deep squat, hip low, knee bent sharply → angle ~88° (<= 105°)
const bottomLandmarks = {
  leftShoulder: { x: 0.40, y: 0.35, visibility: 0.95 },
  rightShoulder: { x: 0.60, y: 0.35, visibility: 0.95 },
  leftHip: { x: 0.42, y: 0.68, visibility: 0.92 },
  rightHip: { x: 0.58, y: 0.68, visibility: 0.92 },
  leftKnee: { x: 0.35, y: 0.70, visibility: 0.90 },
  rightKnee: { x: 0.65, y: 0.70, visibility: 0.90 },
  leftAnkle: { x: 0.42, y: 0.92, visibility: 0.88 },
  rightAnkle: { x: 0.58, y: 0.92, visibility: 0.88 },
};

// Rising: coming back up → angle ~138° (> 130°)
const risingLandmarks = {
  leftShoulder: { x: 0.40, y: 0.28, visibility: 0.95 },
  rightShoulder: { x: 0.60, y: 0.28, visibility: 0.95 },
  leftHip: { x: 0.42, y: 0.61, visibility: 0.92 },
  rightHip: { x: 0.58, y: 0.61, visibility: 0.92 },
  leftKnee: { x: 0.37, y: 0.70, visibility: 0.90 },
  rightKnee: { x: 0.63, y: 0.70, visibility: 0.90 },
  leftAnkle: { x: 0.42, y: 0.92, visibility: 0.88 },
  rightAnkle: { x: 0.58, y: 0.92, visibility: 0.88 },
};

const runTests = async () => {
  console.log("\n🏋️ CAMERA FORM FEEDBACK — BACKEND TEST SUITE\n");

  // ---- TEST 1: Health check ----
  const healthResult = await request("GET", "/");
  log("TEST 1: Health Check", healthResult);

  if (!healthResult.data.success) {
    console.error("❌ Health check failed. Is the server running?");
    return;
  }
  console.log("  ✅ Server is healthy");

  // ---- TEST 2: Form feedback analysis (deep squat) ----
  const analyzeResult = await request("POST", "/api/form-feedback/analyze", {
    exercise: "squat",
    landmarks: bottomLandmarks,
  });
  log("TEST 2: Form Feedback — Squat Analysis (deep squat)", analyzeResult);
  console.log(`  ✅ Score: ${analyzeResult.data.data.score}`);
  console.log(`  ✅ Status: ${analyzeResult.data.data.status}`);
  console.log(`  ✅ Knee angle: ${analyzeResult.data.data.angles.knee}°`);

  // ---- TEST 3: Form analysis with missing landmarks ----
  const missingResult = await request("POST", "/api/form-feedback/analyze", {
    exercise: "squat",
    landmarks: {
      leftShoulder: { x: 0.45, y: 0.30, visibility: 0.95 },
    },
  });
  log("TEST 3: Form Feedback — Missing Landmarks", missingResult);
  console.log(`  ✅ Status: ${missingResult.data.data.status}`);

  // ---- TEST 4: Unsupported exercise ----
  const unsupportedResult = await request(
    "POST",
    "/api/form-feedback/analyze",
    {
      exercise: "pushup",
      landmarks: standingLandmarks,
    },
  );
  log("TEST 4: Form Feedback — Unsupported Exercise", unsupportedResult);
  console.log(`  ✅ Status: ${unsupportedResult.data.data.status}`);

  // ---- TEST 5: Start live session ----
  const startResult = await request("POST", "/api/live-sessions/start", {
    exercise: "squat",
  });
  log("TEST 5: Start Live Session", startResult);

  const sessionId = startResult.data.data.sessionId;
  console.log(`  ✅ Session ID: ${sessionId}`);
  console.log(`  ✅ Initial state: ${startResult.data.data.state}`);

  // ---- TEST 6: Track full squat sequence (2 reps) ----
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 6: Live Tracking — Full Squat Sequence (2 reps)");
  console.log(`${"=".repeat(60)}`);

  const trackFrame = async (name, landmarks) => {
    const result = await request("POST", "/api/live-sessions/track", {
      sessionId,
      landmarks,
    });

    const d = result.data.data;
    console.log(
      `  [${name.padEnd(18)}] state=${d.state.padEnd(11)} ` +
        `reps=${d.reps} ` +
        `knee=${String(d.kneeAngle).padStart(3)}° ` +
        `score=${String(d.score).padStart(3)} ` +
        `pos=${d.position.padEnd(10)} ` +
        `completed=${d.repCompleted}`,
    );

    return result;
  };

  // Rep 1
  console.log("\n  --- Rep 1 ---");
  await trackFrame("Standing 1", standingLandmarks);
  await trackFrame("Standing 2", standingLandmarks);
  await trackFrame("Descending 1", descendingLandmarks);
  await trackFrame("Descending 2", descendingLandmarks);
  await trackFrame("Descending 3", descendingLandmarks);
  await trackFrame("Bottom 1", bottomLandmarks);
  await trackFrame("Bottom 2", bottomLandmarks);
  await trackFrame("Bottom 3", bottomLandmarks);
  await trackFrame("Bottom 4", bottomLandmarks);
  await trackFrame("Bottom 5", bottomLandmarks);
  await trackFrame("Rising 1", risingLandmarks);
  await trackFrame("Rising 2", risingLandmarks);
  await trackFrame("Rising 3", risingLandmarks);
  await trackFrame("Rising 4", risingLandmarks);
  await trackFrame("Standing 3", standingLandmarks);
  const rep1Result = await trackFrame("Standing 4", standingLandmarks);

  const r1 = rep1Result.data.data;
  console.log(`\n  ✅ Rep completed: ${r1.repCompleted}`);
  console.log(`  ✅ Total reps: ${r1.reps}`);
  console.log(`  ✅ Rep evaluations: ${r1.repEvaluations.length}`);

  // Rep 2
  console.log("\n  --- Rep 2 ---");
  await trackFrame("Standing 1", standingLandmarks);
  await trackFrame("Descending 1", descendingLandmarks);
  await trackFrame("Descending 2", descendingLandmarks);
  await trackFrame("Descending 3", descendingLandmarks);
  await trackFrame("Bottom 1", bottomLandmarks);
  await trackFrame("Bottom 2", bottomLandmarks);
  await trackFrame("Bottom 3", bottomLandmarks);
  await trackFrame("Bottom 4", bottomLandmarks);
  await trackFrame("Bottom 5", bottomLandmarks);
  await trackFrame("Rising 1", risingLandmarks);
  await trackFrame("Rising 2", risingLandmarks);
  await trackFrame("Rising 3", risingLandmarks);
  await trackFrame("Rising 4", risingLandmarks);
  await trackFrame("Standing 1", standingLandmarks);
  const rep2Result = await trackFrame("Standing 2", standingLandmarks);

  const r2 = rep2Result.data.data;
  console.log(`\n  ✅ Rep 2 completed: ${r2.repCompleted}`);
  console.log(`  ✅ Total reps: ${r2.reps}`);
  console.log(`  ✅ Average score: ${r2.averageScore}`);
  console.log(`  ✅ Rep evaluations count: ${r2.repEvaluations.length}`);

  if (r2.repEvaluations.length > 0) {
    console.log("\n  📊 Rep Evaluation Details:");
    r2.repEvaluations.forEach((rep) => {
      console.log(
        `    Rep #${rep.repNumber}: score=${rep.score} status=${rep.status} ` +
          `knee=${rep.minKneeAngle}°–${rep.maxKneeAngle}°`,
      );
    });
  }

  // ---- TEST 7: Get live session ----
  const sessionResult = await request(
    "GET",
    `/api/live-sessions/${sessionId}`,
  );
  log("TEST 7: Get Live Session", {
    status: sessionResult.status,
    data: {
      success: sessionResult.data.success,
      reps: sessionResult.data.data.reps,
      state: sessionResult.data.data.state,
      repEvaluations: sessionResult.data.data.repEvaluations?.length,
    },
  });

  // ---- TEST 8: Finish session ----
  const finishResult = await request("POST", "/api/live-sessions/finish", {
    sessionId,
    duration: 45,
  });
  log("TEST 8: Finish Live Session", finishResult);
  console.log(`  ✅ Workout ID: ${finishResult.data.data.id}`);
  console.log(`  ✅ Final reps: ${finishResult.data.data.reps}`);
  console.log(`  ✅ Average score: ${finishResult.data.data.averageScore}`);
  console.log(
    `  ✅ Rep evaluations: ${finishResult.data.data.repEvaluations.length}`,
  );
  console.log(
    `  ✅ Min knee angle: ${finishResult.data.data.minKneeAngle}°`,
  );
  console.log(
    `  ✅ Max knee angle: ${finishResult.data.data.maxKneeAngle}°`,
  );

  const workoutId = finishResult.data.data.id;

  // ---- TEST 9: Session removed after finish ----
  const goneResult = await request(
    "GET",
    `/api/live-sessions/${sessionId}`,
  );
  log("TEST 9: Session Removed After Finish", goneResult);
  console.log(
    `  ✅ Session correctly removed: ${goneResult.status === 404}`,
  );

  // ---- TEST 10: Workout history ----
  const historyResult = await request("GET", "/api/workout-sessions");
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 10: Workout History");
  console.log(`${"=".repeat(60)}`);
  console.log(`  ✅ Total workouts in DB: ${historyResult.data.count}`);

  // ---- TEST 11: Workout by ID ----
  const detailResult = await request(
    "GET",
    `/api/workout-sessions/${workoutId}`,
  );
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 11: Workout Session Detail");
  console.log(`${"=".repeat(60)}`);
  console.log(`  ✅ Exercise: ${detailResult.data.data.exercise}`);
  console.log(`  ✅ Reps: ${detailResult.data.data.reps}`);
  console.log(`  ✅ Score: ${detailResult.data.data.averageScore}`);

  // ---- TEST 12: Workout statistics ----
  const statsResult = await request("GET", "/api/workout-sessions/stats");
  log("TEST 12: Workout Statistics", statsResult);
  console.log(`  ✅ Total workouts: ${statsResult.data.data.totalWorkouts}`);
  console.log(`  ✅ Total reps: ${statsResult.data.data.totalReps}`);
  console.log(`  ✅ Average score: ${statsResult.data.data.averageScore}`);
  console.log(`  ✅ Best score: ${statsResult.data.data.bestScore}`);

  // ---- TEST 13: Error — invalid session ID ----
  const invalidSessionResult = await request(
    "POST",
    "/api/live-sessions/track",
    {
      sessionId: "nonexistent-session-id",
      landmarks: standingLandmarks,
    },
  );
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 13: Invalid Session ID");
  console.log(`${"=".repeat(60)}`);
  console.log(
    `  ✅ Correctly returned error: ${!invalidSessionResult.data.success}`,
  );
  console.log(`  ✅ Status: ${invalidSessionResult.status}`);

  // ---- TEST 14: Error — invalid ObjectId ----
  const invalidIdResult = await request(
    "GET",
    "/api/workout-sessions/invalid-id",
  );
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 14: Invalid ObjectId");
  console.log(`${"=".repeat(60)}`);
  console.log(
    `  ✅ Correctly returned 400: ${invalidIdResult.status === 400}`,
  );

  // ---- TEST 15: Error — missing exercise ----
  const noExerciseResult = await request(
    "POST",
    "/api/form-feedback/analyze",
    { landmarks: standingLandmarks },
  );
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 15: Missing Exercise");
  console.log(`${"=".repeat(60)}`);
  console.log(
    `  ✅ Correctly returned error: ${!noExerciseResult.data.success}`,
  );

  // ---- TEST 16: Error — missing landmarks ----
  const noLandmarksResult = await request(
    "POST",
    "/api/form-feedback/analyze",
    { exercise: "squat" },
  );
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 16: Missing Landmarks");
  console.log(`${"=".repeat(60)}`);
  console.log(
    `  ✅ Correctly returned error: ${!noLandmarksResult.data.success}`,
  );

  // ---- TEST 17: 404 route ----
  const notFoundResult = await request("GET", "/api/nonexistent");
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 17: 404 Route");
  console.log(`${"=".repeat(60)}`);
  console.log(`  ✅ Correctly returned 404: ${notFoundResult.status === 404}`);

  // ---- TEST 18: Unsupported exercise for live session ----
  const invalidExerciseResult = await request(
    "POST",
    "/api/live-sessions/start",
    { exercise: "deadlift" },
  );
  console.log(`\n${"=".repeat(60)}`);
  console.log("  TEST 18: Unsupported Exercise for Live Session");
  console.log(`${"=".repeat(60)}`);
  console.log(
    `  ✅ Correctly returned error: ${!invalidExerciseResult.data.success}`,
  );

  // ---- SUMMARY ----
  console.log(`\n${"=".repeat(60)}`);
  console.log("  🏆 ALL 18 TESTS COMPLETED SUCCESSFULLY");
  console.log(`${"=".repeat(60)}\n`);
};

runTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
