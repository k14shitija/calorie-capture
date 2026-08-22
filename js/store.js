(function (root) {
  const KEY = "calorie-capture-v1";

  function blank() {
    return {
      profile: null,
      targets: null,
      meals: [],
      workouts: [],
      tutorials: [],
      water: {},
      reminders: [
        { id: "breakfast", label: "Log breakfast", time: "09:00", enabled: true },
        { id: "lunch", label: "Log lunch", time: "13:00", enabled: true },
        { id: "walk", label: "Move for 10 minutes", time: "18:30", enabled: true },
        { id: "water", label: "Drink water", time: "16:00", enabled: true }
      ],
      joinedChallenges: [],
      completedRoutine: false,
      routines: [],
      theme: "dark",
      csat: [],
      seenWelcome: false,
      lastNotify: {}
    };
  }

  function load() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) return blank();
      return Object.assign(blank(), JSON.parse(raw));
    } catch (err) {
      return blank();
    }
  }

  function save(state) {
    try {
      if (root.localStorage) root.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      /* quota */
    }
    return state;
  }

  function reset() {
    const next = blank();
    save(next);
    return next;
  }

  function addMeal(state, meal) {
    state.meals.unshift(meal);
    return save(state);
  }

  function addWorkout(state, workout) {
    state.workouts.unshift(workout);
    return save(state);
  }

  function waterFor(state, day) {
    return state.water[day] || 0;
  }

  function setWater(state, day, n) {
    state.water[day] = Math.max(0, n);
    const best = Math.max(state.waterBest || 0, state.water[day]);
    state.waterBest = best;
    return save(state);
  }

  const STORE = { KEY, blank, load, save, reset, addMeal, addWorkout, waterFor, setWater };
  root.CC_STORE = STORE;
  if (typeof module !== "undefined" && module.exports) module.exports = STORE;
})(typeof globalThis !== "undefined" ? globalThis : this);
