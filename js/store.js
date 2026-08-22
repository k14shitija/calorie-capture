(function (root) {
  const KEY = "calorie-capture-v3";
  const E = root.CC_ENGINE;
  const D = root.CC_DATA;

  function daysAgo(n, hour) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(hour || 12, 10, 0, 0);
    return d.toISOString();
  }

  function buildSession() {
    return {
      id: "upper-body",
      name: "Upper Body Strength",
      minutes: 45,
      started: false,
      done: false,
      exercises: D.EXERCISES.map((ex) => ({
        id: ex.id,
        name: ex.name,
        muscles: ex.muscles,
        equipmentId: ex.equipmentId,
        rest: ex.rest,
        unit: ex.unit || "reps",
        sets: Array.from({ length: ex.sets }, () => ({
          reps: ex.reps,
          weight: ex.weight,
          done: false
        }))
      }))
    };
  }

  function demo() {
    const today = E.todayKey();
    const meals = [
      {
        id: "m-b",
        at: daysAgo(0, 8),
        slot: "breakfast",
        title: "Eggs + toast",
        kcal: 420,
        protein: 24,
        carbs: 38,
        fat: 18,
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=640&q=60",
        items: [
          { id: "eggs", name: "Scrambled eggs", grams: 120, kcal: 180, protein: 13, carbs: 2, fat: 13 },
          { id: "bread", name: "Toast", grams: 60, kcal: 150, protein: 5, carbs: 28, fat: 2 },
          { id: "latte", name: "Cafe latte", grams: 240, kcal: 90, protein: 6, carbs: 8, fat: 3 }
        ]
      },
      {
        id: "m-l",
        at: daysAgo(0, 13),
        slot: "lunch",
        title: "Chicken salad",
        kcal: 520,
        protein: 42,
        carbs: 28,
        fat: 24,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=640&q=60",
        items: [
          { id: "grilled-chicken", name: "Grilled chicken", grams: 140, kcal: 231, protein: 43, carbs: 0, fat: 5 },
          { id: "salad", name: "Garden salad", grams: 180, kcal: 90, protein: 3, carbs: 12, fat: 4 },
          { id: "avocado", name: "Avocado", grams: 80, kcal: 128, protein: 2, carbs: 7, fat: 12 }
        ]
      },
      {
        id: "m-s",
        at: daysAgo(0, 16),
        slot: "snack",
        title: "Greek yogurt",
        kcal: 130,
        protein: 16,
        carbs: 8,
        fat: 4,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=640&q=60",
        items: [{ id: "yogurt", name: "Greek yogurt", grams: 170, kcal: 130, protein: 16, carbs: 8, fat: 4 }]
      }
    ];
    const history = [1, 2, 3, 4, 5].map((n) => ({
      id: `h-${n}`,
      at: daysAgo(n, 13),
      slot: "lunch",
      title: "Logged lunch",
      kcal: 480 + n * 10,
      protein: 30,
      carbs: 40,
      fat: 16,
      items: []
    }));
    return {
      profile: {
        name: "Kshitija",
        username: "kshitija",
        persona: "beginner",
        goal: "lose",
        experience: "beginner",
        frequency: "4-5",
        motive: "progress",
        age: 25,
        sex: "female",
        weight: 132,
        weightUnit: "lb",
        height: 64,
        heightUnit: "in",
        activity: "light",
        demo: true
      },
      targets: { calories: 1850, protein: 90, carbs: 185, fat: 51, water: 8, sleep: "7h 42m" },
      meals: meals.concat(history),
      points: 820,
      xpLog: [],
      streak: 6,
      activityDays: [0, 1, 2, 3, 4, 5].map((n) => E.todayKey(new Date(Date.now() - n * 86400000))),
      session: buildSession(),
      workouts: [{ id: "w1", at: daysAgo(1, 18), name: "Full body", kcal: 220 }],
      tutorials: ["lat-pulldown"],
      friends: ["sarah", "alex", "maya"],
      requests: [{ from: "leo", status: "in" }],
      outgoing: [],
      dashCards: ["goal", "score", "plan", "meals", "circle"],
      reminders: [
        { id: "breakfast", label: "Log breakfast", time: "09:00", enabled: true },
        { id: "lunch", label: "Log lunch", time: "13:00", enabled: true },
        { id: "move", label: "Start today's workout", time: "18:30", enabled: true }
      ],
      theme: "light",
      onboarded: true,
      lastNotify: {},
      water: {},
      waterBest: 6
    };
  }

  function blank() {
    return {
      profile: null,
      targets: { calories: 1850, protein: 90, carbs: 185, fat: 51, water: 8, sleep: "—" },
      meals: [],
      points: 0,
      xpLog: [],
      streak: 0,
      activityDays: [],
      session: buildSession(),
      workouts: [],
      tutorials: [],
      friends: [],
      requests: [],
      outgoing: [],
      dashCards: ["goal", "score", "plan", "meals", "circle"],
      reminders: [],
      theme: "light",
      onboarded: false,
      lastNotify: {},
      water: {},
      waterBest: 0
    };
  }

  function load() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) {
        const seeded = demo();
        save(seeded);
        return seeded;
      }
      return Object.assign(blank(), JSON.parse(raw));
    } catch (err) {
      return demo();
    }
  }

  function save(state) {
    try {
      if (root.localStorage) root.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) { /* quota */ }
    return state;
  }

  function reset() {
    const next = blank();
    save(next);
    return next;
  }

  function seedDemo() {
    const next = demo();
    save(next);
    return next;
  }

  const STORE = { KEY, blank, load, save, reset, seedDemo, demo, buildSession };
  root.CC_STORE = STORE;
  if (typeof module !== "undefined" && module.exports) module.exports = STORE;
})(typeof globalThis !== "undefined" ? globalThis : this);
