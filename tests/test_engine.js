const assert = require("assert");
const path = require("path");
const fs = require("fs");

function loadWithoutDom() {
  globalThis.CC_DATA = require("../js/data.js");
  return require("../js/engine.js");
}

function run(name, fn) {
  try {
    fn();
    console.log("ok  " + name);
  } catch (err) {
    console.error("fail  " + name);
    console.error(err);
    process.exitCode = 1;
  }
}

const E = loadWithoutDom();

run("todayKey is stable ISO date", () => {
  assert.strictEqual(E.todayKey(new Date("2026-08-22T15:04:00")), "2026-08-22");
});

run("meal slots match the journey map", () => {
  assert.strictEqual(E.mealSlotForHour(8), "breakfast");
  assert.strictEqual(E.mealSlotForHour(12), "lunch");
  assert.strictEqual(E.mealSlotForHour(19), "dinner");
  assert.strictEqual(E.mealSlotForHour(23), "snack");
});

run("John's desk-job profile gets a deficit target", () => {
  const t = E.estimateTargets({
    age: 34,
    sex: "male",
    weight: 190,
    weightUnit: "lb",
    height: 70,
    heightUnit: "in",
    activity: "sedentary",
    goal: "lose"
  });
  assert.ok(t.calories >= 1600 && t.calories <= 2400, t.calories);
  assert.ok(t.calories < t.tdee);
  assert.ok(t.protein >= 100);
});

run("larger plates increase calories", () => {
  const shares = { brown: 0.4, green: 0.25, white: 0.1, red: 0, yellow: 0, orange: 0, dark: 0 };
  const small = E.analyzeMeal({ shares, plateId: "7", hour: 19 });
  const large = E.analyzeMeal({ shares, plateId: "13", hour: 19 });
  assert.ok(large.totals.kcal > small.totals.kcal);
  assert.ok(small.items.length >= 1);
  assert.ok(small.confidence >= 0.55 && small.confidence <= 0.93);
});

run("equipment search finds aliases", () => {
  const hits = E.findEquipment("lat machine");
  assert.ok(hits.some((e) => e.id === "lat-pulldown"));
});

run("routine generator stays in the time budget", () => {
  const r = E.generateRoutine({ goal: "confidence", minutes: 30, setting: "gym", experience: "beginner" });
  assert.ok(r.blocks.length >= 3);
  assert.ok(r.totals.minutes >= 20 && r.totals.minutes <= 45);
  assert.ok(r.blocks.every((b) => b.kcal > 0));
});

run("streak counts consecutive days ending today", () => {
  const days = ["2026-08-20", "2026-08-21", "2026-08-22"];
  assert.strictEqual(E.streakFromDays(days, "2026-08-22"), 3);
  assert.strictEqual(E.streakFromDays(["2026-08-20"], "2026-08-22"), 0);
});

run("badges unlock from real actions", () => {
  const badges = E.earnedBadges({
    meals: [{ at: "2026-08-22T12:00:00", kcal: 400 }],
    workouts: [{ at: "2026-08-22T18:00:00", kcal: 200 }],
    tutorials: ["treadmill"],
    waterBest: 8,
    targets: { water: 8 },
    completedRoutine: true,
    joinedChallenges: ["log-7"]
  });
  const ids = badges.map((b) => b.id);
  assert.ok(ids.includes("first-meal"));
  assert.ok(ids.includes("first-gym"));
  assert.ok(ids.includes("balanced"));
  assert.ok(ids.includes("hydrate"));
  assert.ok(ids.includes("routine"));
  assert.ok(ids.includes("social"));
});

run("persona follows motive and experience", () => {
  assert.strictEqual(E.pickPersona({ motive: "competition", experience: "advanced", goal: "lose" }), "challenger");
  assert.strictEqual(E.pickPersona({ motive: "progress", experience: "beginner", goal: "healthy" }), "beginner");
  assert.strictEqual(E.pickPersona({ motive: "progress", experience: "intermediate", goal: "muscle" }), "builder");
});

run("XP table and gram scaling stay consistent", () => {
  assert.strictEqual(E.xpFor("set"), 20);
  assert.strictEqual(E.xpFor("meal"), 25);
  const food = globalThis.CC_DATA.FOODS.find((f) => f.id === "grilled-chicken");
  const half = E.scaleByGrams(food, food.grams / 2);
  assert.ok(half.kcal < food.kcal);
});

run("insights speak in remaining calories", () => {
  const info = E.insightCopy({
    targets: { calories: 1850, protein: 90 },
    meals: [{ at: new Date().toISOString(), kcal: 1420, protein: 62 }],
    session: { exercises: [{ sets: [{ done: true }, { done: false }] }] },
    profile: { persona: "beginner" }
  });
  assert.ok(info.remain === 430);
  assert.ok(info.lines[0].includes("430"));
});

run("reminders match clock time", () => {
  const due = E.reminderDue(
    [{ id: "lunch", label: "Log lunch", time: "13:00", enabled: true }],
    new Date("2026-08-22T13:00:00")
  );
  assert.strictEqual(due.length, 1);
});

run("static app is a phone-installable PWA", () => {
  const dir = path.join(__dirname, "..");
  const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
  assert.ok(html.includes("viewport-fit=cover"));
  assert.ok(html.includes("apple-mobile-web-app-capable"));
  assert.ok(html.includes("manifest.json"));
  assert.strictEqual(manifest.display, "standalone");
  assert.ok(fs.existsSync(path.join(dir, "assets/icon-192.png")));
  assert.ok(fs.existsSync(path.join(dir, "sw.js")));
});

if (process.exitCode) {
  process.exit(1);
} else {
  console.log("all engine tests passed");
}
