(function (root) {
  const DATA = root.CC_DATA;

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function todayKey(date) {
    const d = date ? new Date(date) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function mealSlotForHour(hour) {
    if (hour >= 5 && hour <= 10) return "breakfast";
    if (hour >= 11 && hour <= 15) return "lunch";
    if (hour >= 16 && hour <= 21) return "dinner";
    return "snack";
  }

  function activityFactor(level) {
    return { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }[level] || 1.2;
  }

  function toKg(weight, unit) {
    const w = Number(weight);
    if (!w) return 0;
    return unit === "lb" ? w * 0.453592 : w;
  }

  function toCm(height, unit) {
    const h = Number(height);
    if (!h) return 0;
    return unit === "in" ? h * 2.54 : h;
  }

  function estimateTargets(profile) {
    const kg = toKg(profile.weight, profile.weightUnit || "lb");
    const cm = toCm(profile.height, profile.heightUnit || "in");
    const age = Number(profile.age) || 34;
    const sex = profile.sex === "female" ? "female" : "male";
    let bmr = 10 * kg + 6.25 * cm - 5 * age + (sex === "female" ? -161 : 5);
    if (!kg || !cm) bmr = 1700;
    const tdee = Math.round(bmr * activityFactor(profile.activity));
    const goal = profile.goal || "lose";
    const delta = goal === "lose" ? -400 : goal === "gain" ? 300 : 0;
    const calories = clamp(Math.round(tdee + delta), 1200, 4000);
    return {
      bmr: Math.round(bmr),
      tdee,
      calories,
      protein: Math.round((kg || 75) * (goal === "lose" ? 1.8 : 1.6)),
      carbs: Math.round((calories * 0.4) / 4),
      fat: Math.round((calories * 0.25) / 9),
      water: 8
    };
  }

  function plateScale(plateId) {
    const found = DATA.PLATE_SIZES.find((p) => p.id === plateId);
    return found ? found.scale : 1;
  }

  function findFoods(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return DATA.FOODS.slice(0, 12);
    return DATA.FOODS.filter((f) => {
      if (f.name.toLowerCase().includes(q)) return true;
      return (f.aliases || []).some((a) => a.toLowerCase().includes(q));
    });
  }

  function findEquipment(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return DATA.EQUIPMENT.slice();
    return DATA.EQUIPMENT.filter((e) => {
      if (e.name.toLowerCase().includes(q)) return true;
      if ((e.muscles || []).some((m) => m.toLowerCase().includes(q))) return true;
      return (e.aliases || []).some((a) => a.toLowerCase().includes(q));
    });
  }

  function classifyPixels(pixels) {
    const counts = { green: 0, brown: 0, white: 0, red: 0, yellow: 0, orange: 0, dark: 0 };
    let n = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      if (a < 40) continue;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = (r + g + b) / 3;
      n += 1;
      if (lum < 35) counts.dark += 1;
      else if (lum > 210 && sat < 0.18) counts.white += 1;
      else if (g > r + 12 && g > b + 8) counts.green += 1;
      else if (r > 140 && g < 90 && b < 90) counts.red += 1;
      else if (r > 170 && g > 130 && b < 90 && r >= g) counts.yellow += 1;
      else if (r > 150 && g > 70 && g < 150 && b < 80) counts.orange += 1;
      else if (r > 70 && g > 40 && b < 70 && lum < 160) counts.brown += 1;
      else if (lum > 160) counts.white += 1;
      else counts.brown += 1;
    }
    if (!n) return { shares: counts, n: 0 };
    const shares = {};
    Object.keys(counts).forEach((k) => {
      shares[k] = counts[k] / n;
    });
    return { shares, n };
  }

  function foodsForShares(shares, hour) {
    const slot = mealSlotForHour(hour);
    const ranked = DATA.FOODS.map((food) => {
      let score = 0;
      (food.tags || []).forEach((tag) => {
        score += shares[tag] || 0;
      });
      if (slot === "breakfast" && ["oatmeal", "eggs", "yogurt", "banana", "bagel", "pancake", "cereal", "latte"].includes(food.id)) {
        score += 0.18;
      }
      if (slot === "lunch" && ["salad", "wrap", "burrito", "sushi", "rice", "grilled-chicken"].includes(food.id)) {
        score += 0.1;
      }
      if (slot === "dinner" && ["broccoli-chicken", "salmon-bowl", "pasta", "curry", "steak"].includes(food.id)) {
        score += 0.1;
      }
      return { food, score };
    }).sort((a, b) => b.score - a.score);
    const picked = [];
    const used = new Set();
    ranked.forEach((row) => {
      if (picked.length >= 3) return;
      if (row.score < 0.12 && picked.length) return;
      if (used.has(row.food.id)) return;
      picked.push(row);
      used.add(row.food.id);
    });
    if (!picked.length) {
      const fallback = slot === "breakfast" ? "oatmeal" : slot === "lunch" ? "grilled-chicken" : "broccoli-chicken";
      picked.push({ food: DATA.FOODS.find((f) => f.id === fallback), score: 0.35 });
    }
    return picked;
  }

  function scaleItem(food, scale, portion) {
    const factor = scale * (Number(portion) || 1);
    return {
      id: food.id,
      name: food.name,
      serving: food.serving,
      portion: Number(portion) || 1,
      kcal: Math.round(food.kcal * factor),
      protein: Math.round(food.protein * factor),
      carbs: Math.round(food.carbs * factor),
      fat: Math.round(food.fat * factor)
    };
  }

  function sumMacros(items) {
    return items.reduce(
      (acc, item) => {
        acc.kcal += item.kcal || 0;
        acc.protein += item.protein || 0;
        acc.carbs += item.carbs || 0;
        acc.fat += item.fat || 0;
        return acc;
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }

  function analyzeMeal({ shares, plateId, hour, historyNames }) {
    const scale = plateScale(plateId);
    const picks = foodsForShares(shares || {}, hour == null ? new Date().getHours() : hour);
    const items = picks.map((row, i) => scaleItem(row.food, scale, i === 0 ? 1 : 0.7));
    const totals = sumMacros(items);
    const topShare = Math.max(0, ...Object.values(shares || {}));
    let confidence = 0.62 + topShare * 0.28 + (picks[0] && picks[0].score > 0.4 ? 0.06 : 0);
    if (historyNames && historyNames.length) {
      const hit = items.some((item) => historyNames.includes(item.name));
      if (hit) confidence += 0.04;
    }
    confidence = clamp(Number(confidence.toFixed(2)), 0.55, 0.93);
    return {
      items,
      totals,
      confidence,
      plateId: plateId || "9",
      scale,
      shares: shares || {},
      note: confidence >= 0.8 ? "High-confidence on-device estimate. Adjust items if a food was missed." : "On-device estimate from plate colors and size. Confirm or edit before saving."
    };
  }

  function workoutKcal(equipment, minutes, effort) {
    const min = Number(minutes) || equipment.minutes || 10;
    const mult = effort === "hard" ? 1.25 : effort === "easy" ? 0.75 : 1;
    return Math.round((equipment.kcalPerMin || 4) * min * mult);
  }

  function generateRoutine({ goal, minutes, setting, experience }) {
    const time = Number(minutes) || 30;
    const gym = setting !== "home";
    const beginner = experience !== "intermediate";
    let ids;
    if (goal === "cardio") {
      ids = gym ? ["treadmill", "bike", "rower", "plank"] : ["treadmill", "plank", "goblet-squat"];
    } else if (goal === "strength") {
      ids = gym
        ? ["leg-press", "chest-press", "lat-pulldown", "seated-row", "plank"]
        : ["goblet-squat", "dumbbell-bench", "plank"];
    } else if (goal === "confidence") {
      ids = gym
        ? ["bike", "leg-press", "chest-press", "lat-pulldown", "hip-abductor"]
        : ["goblet-squat", "plank"];
    } else {
      ids = gym
        ? ["treadmill", "leg-press", "chest-press", "seated-row", "plank"]
        : ["goblet-squat", "dumbbell-bench", "plank"];
    }
    if (beginner && ids.includes("cable-crossover")) {
      ids = ids.filter((id) => id !== "cable-crossover");
    }
    const budget = Math.max(18, time);
    const each = Math.max(5, Math.round((budget - 4) / ids.length));
    const blocks = ids
      .map((id) => DATA.EQUIPMENT.find((e) => e.id === id))
      .filter(Boolean)
      .map((eq) => ({
        equipmentId: eq.id,
        name: eq.name,
        minutes: each,
        kcal: workoutKcal(eq, each, "steady"),
        done: false
      }));
    const totals = {
      minutes: blocks.reduce((s, b) => s + b.minutes, 0),
      kcal: blocks.reduce((s, b) => s + b.kcal, 0)
    };
    return {
      id: `routine-${todayKey()}`,
      goal: goal || "balanced",
      setting: gym ? "gym" : "home",
      date: todayKey(),
      blocks,
      totals
    };
  }

  function uniqueDays(isoList) {
    return Array.from(new Set((isoList || []).map((iso) => todayKey(iso)))).sort();
  }

  function streakFromDays(days, today) {
    const set = new Set(days);
    let cursor = today || todayKey();
    let streak = 0;
    const d = new Date(`${cursor}T12:00:00`);
    while (set.has(todayKey(d))) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function earnedBadges(state) {
    const meals = state.meals || [];
    const workouts = state.workouts || [];
    const tutorials = state.tutorials || [];
    const days = uniqueDays(meals.map((m) => m.at).concat(workouts.map((w) => w.at)));
    const streak = streakFromDays(days);
    const today = todayKey();
    const mealToday = meals.some((m) => todayKey(m.at) === today);
    const workoutToday = workouts.some((w) => todayKey(w.at) === today);
    const have = new Set();
    if (meals.length) have.add("first-meal");
    if (tutorials.length) have.add("first-gym");
    if (streak >= 3) have.add("streak-3");
    if (streak >= 7) have.add("streak-7");
    if ((state.waterBest || 0) >= (state.targets && state.targets.water ? state.targets.water : 8)) have.add("hydrate");
    if (mealToday && workoutToday) have.add("balanced");
    if (state.completedRoutine) have.add("routine");
    if ((state.joinedChallenges || []).length) have.add("social");
    return DATA.BADGES.filter((b) => have.has(b.id));
  }

  function weekSeries(entries, today) {
    const end = today ? new Date(`${today}T12:00:00`) : new Date();
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const key = todayKey(d);
      const dayEntries = (entries || []).filter((e) => todayKey(e.at) === key);
      const kcal = dayEntries.reduce((s, e) => s + (e.kcal || 0), 0);
      days.push({ date: key, label: d.toLocaleDateString(undefined, { weekday: "narrow" }), kcal, count: dayEntries.length });
    }
    return days;
  }

  function reminderDue(reminders, now) {
    const t = now || new Date();
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    const stamp = `${hh}:${mm}`;
    return (reminders || []).filter((r) => r.enabled && r.time === stamp);
  }

  const ENGINE = {
    todayKey,
    mealSlotForHour,
    estimateTargets,
    plateScale,
    findFoods,
    findEquipment,
    classifyPixels,
    foodsForShares,
    scaleItem,
    sumMacros,
    analyzeMeal,
    workoutKcal,
    generateRoutine,
    uniqueDays,
    streakFromDays,
    earnedBadges,
    weekSeries,
    reminderDue,
    clamp
  };

  root.CC_ENGINE = ENGINE;
  if (typeof module !== "undefined" && module.exports) module.exports = ENGINE;
})(typeof globalThis !== "undefined" ? globalThis : this);
