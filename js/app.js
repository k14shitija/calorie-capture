(function () {
  const E = window.CC_ENGINE;
  const D = window.CC_DATA;
  const S = window.CC_STORE;
  const root = document.getElementById("app");
  let state = S.load();
  let toastTimer = null;
  let draft = {
    plateId: "9",
    slot: E.mealSlotForHour(new Date().getHours()),
    preview: "",
    analysis: null,
    items: []
  };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function go(hash) {
    location.hash = hash;
  }

  function route() {
    const raw = (location.hash || "#/").replace(/^#/, "");
    const parts = raw.split("/").filter(Boolean);
    if (!parts.length) return { name: "home" };
    if (parts[0] === "gym" && parts[1]) return { name: "tutorial", id: parts[1] };
    return { name: parts[0], id: parts[1] };
  }

  function persist() {
    S.save(state);
  }

  function toast(message) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    document.body.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 3600);
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme || "dark";
  }

  function todayMeals() {
    const key = E.todayKey();
    return state.meals.filter((m) => E.todayKey(m.at) === key);
  }

  function todayWorkouts() {
    const key = E.todayKey();
    return state.workouts.filter((w) => E.todayKey(w.at) === key);
  }

  function todayTotals() {
    const inK = todayMeals().reduce((s, m) => s + (m.kcal || 0), 0);
    const outK = todayWorkouts().reduce((s, w) => s + (w.kcal || 0), 0);
    return { inK, outK, net: inK - outK };
  }

  function nav(active) {
    const items = [
      ["#/", "home", "⌂", "Home"],
      ["#/log", "log", "◎", "Capture"],
      ["#/gym", "gym", "🏋", "Gym"],
      ["#/plan", "plan", "🗒", "Plan"],
      ["#/you", "you", "●", "You"]
    ];
    return `<nav class="nav">${items.map(([href, id, icon, label]) => (
      `<a href="${href}" class="${id === active ? "active" : ""} ${id === "log" ? "capture" : ""}"><span>${icon}</span>${label}</a>`
    )).join("")}</nav>`;
  }

  function topbar(subtitle) {
    return `<div class="topbar">
      <div class="brand">
        <img src="assets/logo.svg" alt="" />
        <div>CalorieCapture<small>${esc(subtitle)}</small></div>
      </div>
      <button class="icon-btn" data-act="theme" aria-label="Toggle theme">${state.theme === "light" ? "☾" : "☼"}</button>
    </div>`;
  }

  function ringSvg(pct) {
    const p = E.clamp(pct, 0, 1);
    const r = 58;
    const c = 2 * Math.PI * r;
    const dash = (c * p).toFixed(1);
    return `<svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
      <circle cx="70" cy="70" r="${r}" fill="none" stroke="rgba(186,230,204,0.12)" stroke-width="12"/>
      <circle cx="70" cy="70" r="${r}" fill="none" stroke="#3ee08f" stroke-width="12" stroke-linecap="round" stroke-dasharray="${dash} ${c}"/>
    </svg>`;
  }

  function renderWelcome() {
    root.innerHTML = `<section class="hero">
      <div class="kicker">ISE 588 · Team Red MVP</div>
      <h1>Log a meal in one photo. Learn a machine in one minute.</h1>
      <p>CalorieCapture is built for busy beginners. Snap dinner, set the plate size, get an on-device calorie estimate, then walk into the gym with a short tutorial instead of guessing.</p>
      <div class="feature-grid two">
        <div class="feature"><div class="badge-dot">🍽️</div><div><b>Effortless meal logging</b><div class="muted">Photo + plate size. Edit if the estimate misses a side.</div></div></div>
        <div class="feature"><div class="badge-dot">🏋️</div><div><b>Gym confidence</b><div class="muted">Search or scan a machine. Get steps, mistakes, and calories out.</div></div></div>
        <div class="feature"><div class="badge-dot">🔥</div><div><b>Progress you can see</b><div class="muted">Calories in vs out, streaks, badges, and habit reminders.</div></div></div>
        <div class="feature"><div class="badge-dot">🗺️</div><div><b>A plan for today</b><div class="muted">Pick a goal and time. Get a beginner routine in one tap.</div></div></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" data-act="start">Create my plan</button>
        <button class="btn" data-act="demo">Try as John, the busy parent</button>
      </div>
      <p class="tiny">Works on your phone and desktop. Data stays in this browser. Add it to your home screen for the app feel.</p>
    </section>`;
  }

  function renderOnboarding() {
    const p = state.draftProfile || { name: "", age: 34, sex: "male", goal: "lose", activity: "sedentary", weight: 190, weightUnit: "lb", height: 70, heightUnit: "in" };
    root.innerHTML = `${topbar("60-second setup")}
      <div class="card">
        <h2>What should we call you?</h2>
        <label class="field"><span>Name</span><input id="ob-name" value="${esc(p.name)}" autocomplete="name" /></label>
        <div class="grid two">
          <label class="field"><span>Age</span><input id="ob-age" type="number" inputmode="numeric" value="${esc(p.age)}" /></label>
          <label class="field"><span>Sex used for calorie math</span>
            <select id="ob-sex"><option value="male" ${p.sex === "male" ? "selected" : ""}>Male</option><option value="female" ${p.sex === "female" ? "selected" : ""}>Female</option></select>
          </label>
        </div>
        <div class="grid two">
          <label class="field"><span>Weight</span><input id="ob-weight" type="number" inputmode="decimal" value="${esc(p.weight)}" /></label>
          <label class="field"><span>Unit</span><select id="ob-wu"><option value="lb" ${p.weightUnit === "lb" ? "selected" : ""}>lb</option><option value="kg" ${p.weightUnit === "kg" ? "selected" : ""}>kg</option></select></label>
        </div>
        <div class="grid two">
          <label class="field"><span>Height</span><input id="ob-height" type="number" inputmode="decimal" value="${esc(p.height)}" /></label>
          <label class="field"><span>Unit</span><select id="ob-hu"><option value="in" ${p.heightUnit === "in" ? "selected" : ""}>in</option><option value="cm" ${p.heightUnit === "cm" ? "selected" : ""}>cm</option></select></label>
        </div>
        <p class="tiny">Goal</p>
        <div class="chips" id="ob-goal">
          ${[["lose", "Lose fat"], ["maintain", "Stay steady"], ["gain", "Build"], ["confidence", "Gym confidence"]].map(([id, label]) =>
            `<button class="chip ${p.goal === id ? "active" : ""}" data-act="goal" data-id="${id}">${label}</button>`).join("")}
        </div>
        <p class="tiny" style="margin-top:12px">Typical week</p>
        <div class="chips">
          ${[["sedentary", "Desk-heavy"], ["light", "1–2 walks"], ["moderate", "3 gym days"], ["active", "Most days"]].map(([id, label]) =>
            `<button class="chip ${p.activity === id ? "active" : ""}" data-act="activity" data-id="${id}">${label}</button>`).join("")}
        </div>
        <div class="btn-row" style="margin-top:16px">
          <button class="btn btn-primary btn-wide" data-act="finish-onboard">Build my dashboard</button>
        </div>
      </div>`;
  }

  function collectOnboard() {
    return {
      name: document.getElementById("ob-name").value.trim() || "Friend",
      age: Number(document.getElementById("ob-age").value) || 34,
      sex: document.getElementById("ob-sex").value,
      weight: Number(document.getElementById("ob-weight").value) || 190,
      weightUnit: document.getElementById("ob-wu").value,
      height: Number(document.getElementById("ob-height").value) || 70,
      heightUnit: document.getElementById("ob-hu").value,
      goal: (state.draftProfile && state.draftProfile.goal) || "lose",
      activity: (state.draftProfile && state.draftProfile.activity) || "sedentary"
    };
  }

  function finishOnboard(profile) {
    state.profile = profile;
    state.targets = E.estimateTargets(profile);
    state.seenWelcome = true;
    persist();
    toast(`Daily target set to ${state.targets.calories} kcal. You can change this anytime.`);
    go("#/");
  }

  function startDemo() {
    finishOnboard({
      name: "John",
      age: 34,
      sex: "male",
      weight: 190,
      weightUnit: "lb",
      height: 70,
      heightUnit: "in",
      goal: "lose",
      activity: "sedentary",
      demo: true
    });
  }

  function renderHome() {
    const t = state.targets || E.estimateTargets(state.profile || {});
    const { inK, outK } = todayTotals();
    const remaining = t.calories - inK + outK;
    const pct = t.calories ? inK / t.calories : 0;
    const days = E.uniqueDays(state.meals.map((m) => m.at).concat(state.workouts.map((w) => w.at)));
    const streak = E.streakFromDays(days);
    const badges = E.earnedBadges(badgeState());
    const water = S.waterFor(state, E.todayKey());
    const week = E.weekSeries(state.meals);
    const quote = D.QUOTES[new Date().getDate() % D.QUOTES.length];
    const meals = todayMeals();
    root.innerHTML = `${topbar("Today")}
      ${nav("home")}
      <div class="main grid">
        <section class="card">
          <div class="row"><h2>Calories in vs out</h2><span class="chip">${esc(state.profile.name)} · ${streak} day streak</span></div>
          <div class="rings">
            <div class="ring-wrap">${ringSvg(pct)}<div class="ring-center"><strong>${remaining}</strong><div class="tiny">left</div></div></div>
            <div class="stat-col">
              <div><div class="stat"><span>Eaten</span><b>${inK}</b></div><div class="bar in"><span style="width:${E.clamp(inK / t.calories * 100, 0, 100)}%"></span></div></div>
              <div><div class="stat"><span>Burned</span><b>${outK}</b></div><div class="bar out"><span style="width:${E.clamp(outK / 600 * 100, 0, 100)}%"></span></div></div>
              <div><div class="stat"><span>Target</span><b>${t.calories}</b></div></div>
              <p class="tiny">${esc(quote)}</p>
            </div>
          </div>
        </section>
        <section class="card">
          <div class="row"><h2>This week</h2><a href="#/history">History</a></div>
          <div class="week">${week.map((d) => {
            const h = Math.max(6, Math.round((d.kcal / Math.max(1, t.calories)) * 72));
            return `<div class="col"><b style="height:${h}px"></b><span>${esc(d.label)}</span></div>`;
          }).join("")}</div>
        </section>
        <section class="card">
          <div class="row"><h2>Water</h2><span class="tiny">${water}/${t.water} glasses</span></div>
          <div class="water-row">${Array.from({ length: t.water }, (_, i) =>
            `<button class="drop ${i < water ? "on" : ""}" data-act="water" data-n="${i + 1}">💧</button>`).join("")}</div>
        </section>
        <section class="card">
          <div class="row"><h2>Today's plates</h2><a href="#/log">Add</a></div>
          ${meals.length ? `<div class="list">${meals.map((m) =>
            `<div class="list-item"><div>${m.thumb ? `<img src="${m.thumb}" alt="" style="width:44px;height:44px;border-radius:10px;object-fit:cover">` : "🍽️"}</div><div><b>${esc(m.slot)}</b><div class="tiny">${esc((m.items || []).map((i) => i.name).join(", "))}</div></div><b>${m.kcal}</b></div>`
          ).join("")}</div>` : `<p class="muted">No meals yet. Capture a plate — plate size makes the portion smarter.</p>`}
        </section>
        <section class="card">
          <div class="row"><h2>Badges</h2><span class="tiny">${badges.length}/${D.BADGES.length}</span></div>
          <div class="badges">${D.BADGES.map((b) => {
            const on = badges.some((x) => x.id === b.id);
            return `<div class="badge ${on ? "" : "off"}">${b.icon} <b>${esc(b.name)}</b><div class="tiny">${esc(b.detail)}</div></div>`;
          }).join("")}</div>
        </section>
      </div>`;
  }

  function badgeState() {
    return {
      meals: state.meals,
      workouts: state.workouts,
      tutorials: state.tutorials,
      waterBest: state.waterBest || 0,
      targets: state.targets,
      completedRoutine: state.completedRoutine,
      joinedChallenges: state.joinedChallenges
    };
  }

  function renderLog() {
    const items = draft.items;
    const totals = E.sumMacros(items);
    root.innerHTML = `${topbar("Capture a meal")}
      ${nav("log")}
      <div class="main grid">
        <section class="card">
          <h2>Photo + plate size</h2>
          <div class="photo-box">
            ${draft.preview ? `<img src="${draft.preview}" alt="Meal preview">` : `<div><div class="badge-dot" style="margin:0 auto 8px">📷</div><b>Tap to take or upload a photo</b><div class="tiny">On-device estimate. Nothing leaves this phone.</div></div>`}
            <input id="meal-photo" type="file" accept="image/*" capture="environment" />
          </div>
          <p class="tiny" style="margin:12px 0 8px">Plate size</p>
          <div class="chips">${D.PLATE_SIZES.map((p) =>
            `<button class="chip ${draft.plateId === p.id ? "active" : ""}" data-act="plate" data-id="${p.id}">${esc(p.label)}</button>`).join("")}</div>
          <p class="tiny" style="margin:12px 0 8px">Meal</p>
          <div class="chips">${D.MEAL_SLOTS.map((s) =>
            `<button class="chip ${draft.slot === s.id ? "active" : ""}" data-act="slot" data-id="${s.id}">${esc(s.label)}</button>`).join("")}</div>
        </section>
        <section class="card">
          <div class="row"><h2>Estimate</h2>${draft.analysis ? `<span class="conf">${Math.round(draft.analysis.confidence * 100)}% confidence</span>` : ""}</div>
          ${draft.analysis ? `<p class="tiny">${esc(draft.analysis.note)}</p>` : `<p class="muted">Add a photo to draft foods from color, time of day, and plate size. You can search and edit every item.</p>`}
          <div class="list" style="margin-top:10px">${items.map((item, idx) =>
            `<div class="list-item"><div>🥗</div><div><b>${esc(item.name)}</b><div class="tiny">${esc(item.serving)} · x${item.portion}</div></div><div><b>${item.kcal}</b><button class="mini" data-act="rm-item" data-i="${idx}">remove</button></div></div>`
          ).join("")}</div>
          <label class="field" style="margin-top:12px"><span>Add a food</span><input id="food-q" class="search" placeholder="chicken, rice, latte..." /></label>
          <div id="food-hits" class="chips"></div>
          <div class="row" style="margin-top:8px"><span>Total</span><b>${totals.kcal} kcal · P ${totals.protein} C ${totals.carbs} F ${totals.fat}</b></div>
          <button class="btn btn-primary btn-wide" data-act="save-meal" ${items.length ? "" : "disabled"} style="margin-top:12px">Save to today</button>
        </section>
      </div>`;
    const q = document.getElementById("food-q");
    if (q) q.addEventListener("input", onFoodQuery);
    const photo = document.getElementById("meal-photo");
    if (photo) photo.addEventListener("change", onPhoto);
  }

  function onFoodQuery(ev) {
    const hits = E.findFoods(ev.target.value).slice(0, 8);
    document.getElementById("food-hits").innerHTML = hits.map((f) =>
      `<button class="chip" data-act="add-food" data-id="${f.id}">${esc(f.name)} · ${f.kcal}</button>`
    ).join("");
  }

  function shrinkImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 420;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.62));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function sharesFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 80;
        canvas.height = 80;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 80, 80);
        const pixels = ctx.getImageData(0, 0, 80, 80).data;
        URL.revokeObjectURL(url);
        resolve(E.classifyPixels(pixels));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function onPhoto(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      draft.preview = await shrinkImage(file);
      const classified = await sharesFromFile(file);
      const historyNames = state.meals.slice(0, 12).flatMap((m) => (m.items || []).map((i) => i.name));
      draft.analysis = E.analyzeMeal({
        shares: classified.shares,
        plateId: draft.plateId,
        hour: new Date().getHours(),
        historyNames
      });
      draft.items = draft.analysis.items.map((item) => Object.assign({}, item));
      render();
      toast("Estimate ready. Check the foods, then save.");
    } catch (err) {
      toast("Could not read that photo. Try another image.");
    }
  }

  function saveMeal() {
    if (!draft.items.length) return;
    const totals = E.sumMacros(draft.items);
    const meal = {
      id: `meal-${Date.now()}`,
      at: new Date().toISOString(),
      slot: draft.slot,
      plateId: draft.plateId,
      items: draft.items,
      kcal: totals.kcal,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      thumb: draft.preview,
      confidence: draft.analysis ? draft.analysis.confidence : null
    };
    S.addMeal(state, meal);
    const first = state.meals.length === 1;
    draft = { plateId: "9", slot: E.mealSlotForHour(new Date().getHours()), preview: "", analysis: null, items: [] };
    toast("Meal saved. Nice — consistency beats perfect tracking.");
    go("#/");
    if (first) setTimeout(() => showSurvey("meal"), 700);
  }

  function showSurvey(screen) {
    if (state.csat.some((c) => c.screen === screen)) return;
    const el = document.createElement("div");
    el.className = "toast survey";
    el.innerHTML = `<b>How was this screen?</b><div class="tiny">One tap. We close the loop on feedback.</div>
      <div class="btn-row">${[1, 2, 3, 4, 5].map((n) => `<button class="chip" data-score="${n}">${n}</button>`).join("")}</div>`;
    document.body.appendChild(el);
    el.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-score]");
      if (!btn) return;
      state.csat.push({ screen, score: Number(btn.dataset.score), at: new Date().toISOString() });
      persist();
      el.remove();
      toast("Thanks — we logged it. Your notes shape the next pass.");
    });
  }

  function renderGym(query) {
    const list = E.findEquipment(query || "");
    root.innerHTML = `${topbar("Learn the machine")}
      ${nav("gym")}
      <div class="main">
        <input class="search" id="gym-q" placeholder="Treadmill, lat pulldown, beginner..." value="${esc(query || "")}" />
        <div class="list">${list.map((eq) =>
          `<a class="list-item" href="#/gym/${eq.id}"><div>🏋️</div><div><b>${esc(eq.name)}</b><div class="tiny">${esc(eq.muscles.join(" · "))} · ${esc(eq.difficulty)}</div></div><b>${eq.kcalPerMin}/min</b></a>`
        ).join("")}</div>
      </div>`;
    const input = document.getElementById("gym-q");
    if (input) input.addEventListener("input", (ev) => renderGym(ev.target.value));
  }

  function renderTutorial(id) {
    const eq = D.EQUIPMENT.find((e) => e.id === id);
    if (!eq) return renderGym();
    root.innerHTML = `${topbar(eq.name)}
      ${nav("gym")}
      <div class="main grid">
        <section class="card">
          <div class="row"><h2>${esc(eq.name)}</h2><span class="chip">${esc(eq.difficulty)}</span></div>
          <p class="muted">${esc(eq.summary)}</p>
          <p class="tiny" style="margin-top:8px">${esc(eq.muscles.join(" · "))} · about ${eq.kcalPerMin} kcal / min</p>
        </section>
        <section class="card">
          <h2>Do this</h2>
          <div class="steps">${eq.steps.map((s) => `<div class="step"><div>${esc(s)}</div></div>`).join("")}</div>
        </section>
        <section class="card">
          <h2>Common mistakes</h2>
          <ul>${eq.mistakes.map((m) => `<li class="muted">${esc(m)}</li>`).join("")}</ul>
          <div class="grid two" style="margin-top:12px">
            <label class="field"><span>Minutes</span><input id="wo-min" type="number" value="${eq.minutes}" /></label>
            <label class="field"><span>Effort</span>
              <select id="wo-effort"><option value="easy">Easy</option><option value="steady" selected>Steady</option><option value="hard">Hard</option></select>
            </label>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" data-act="log-eq" data-id="${eq.id}">I finished this</button>
            <button class="btn" data-act="mark-tutorial" data-id="${eq.id}">Mark tutorial watched</button>
          </div>
        </section>
      </div>`;
  }

  function logEquipment(id) {
    const eq = D.EQUIPMENT.find((e) => e.id === id);
    if (!eq) return;
    const minutes = Number((document.getElementById("wo-min") || {}).value) || eq.minutes;
    const effort = (document.getElementById("wo-effort") || {}).value || "steady";
    const kcal = E.workoutKcal(eq, minutes, effort);
    S.addWorkout(state, {
      id: `wo-${Date.now()}`,
      at: new Date().toISOString(),
      equipmentId: eq.id,
      name: eq.name,
      minutes,
      effort,
      kcal
    });
    if (!state.tutorials.includes(eq.id)) state.tutorials.push(eq.id);
    persist();
    toast(`Logged ${eq.name} · ${kcal} kcal out.`);
    go("#/");
  }

  function renderPlan() {
    const current = (state.routines || [])[0];
    root.innerHTML = `${topbar("Today's plan")}
      ${nav("plan")}
      <div class="main grid">
        <section class="card">
          <h2>Smart routine generator</h2>
          <p class="muted">Tell us the goal and the time you actually have. We keep it beginner-simple.</p>
          <p class="tiny" style="margin-top:10px">Goal</p>
          <div class="chips">
            ${[["balanced", "Balanced"], ["strength", "Strength"], ["cardio", "Cardio"], ["confidence", "Gym confidence"]].map(([id, label]) =>
              `<button class="chip ${(state.planGoal || "balanced") === id ? "active" : ""}" data-act="plan-goal" data-id="${id}">${label}</button>`).join("")}
          </div>
          <p class="tiny" style="margin-top:10px">Minutes</p>
          <div class="chips">
            ${[20, 30, 45, 60].map((n) =>
              `<button class="chip ${(state.planMin || 30) === n ? "active" : ""}" data-act="plan-min" data-n="${n}">${n}</button>`).join("")}
          </div>
          <p class="tiny" style="margin-top:10px">Where</p>
          <div class="chips">
            <button class="chip ${(state.planSetting || "gym") === "gym" ? "active" : ""}" data-act="plan-set" data-id="gym">Full gym</button>
            <button class="chip ${state.planSetting === "home" ? "active" : ""}" data-act="plan-set" data-id="home">Home / dumbbells</button>
          </div>
          <button class="btn btn-primary btn-wide" data-act="make-plan" style="margin-top:14px">Generate today's routine</button>
        </section>
        ${current ? `<section class="card">
          <div class="row"><h2>Your session</h2><span class="tiny">${current.totals.minutes} min · ${current.totals.kcal} kcal</span></div>
          <div class="list">${current.blocks.map((b, i) =>
            `<div class="list-item"><div>${b.done ? "✅" : "▫️"}</div><div><b>${esc(b.name)}</b><div class="tiny">${b.minutes} min · ${b.kcal} kcal</div></div><div class="btn-row"><a class="chip" href="#/gym/${b.equipmentId}">Guide</a><button class="chip" data-act="toggle-block" data-i="${i}">${b.done ? "Undo" : "Done"}</button></div></div>`
          ).join("")}</div>
          <button class="btn btn-wide" data-act="finish-routine" style="margin-top:12px">Save completed session</button>
        </section>` : ""}
      </div>`;
  }

  function renderYou() {
    const t = state.targets || {};
    const days = E.uniqueDays(state.meals.map((m) => m.at).concat(state.workouts.map((w) => w.at)));
    root.innerHTML = `${topbar("You")}
      ${nav("you")}
      <div class="main grid">
        <section class="card">
          <h2>${esc(state.profile.name)}</h2>
          <p class="muted">${esc(state.profile.goal)} · ${t.calories} kcal target · ${days.length} active days</p>
          <div class="btn-row" style="margin-top:10px">
            <button class="btn" data-act="notify">Enable reminders</button>
            <a class="btn" href="#/challenges">Challenges</a>
            <a class="btn" href="#/history">History</a>
          </div>
        </section>
        <section class="card">
          <h2>Habit reminders</h2>
          <p class="muted">Nudges fire while the app is open. On a phone, add this page to the home screen so it is one tap away.</p>
          <div class="list" style="margin-top:10px">${state.reminders.map((r) =>
            `<div class="list-item"><div>⏰</div><div><b>${esc(r.label)}</b><div class="tiny">${esc(r.time)}</div></div><button class="chip ${r.enabled ? "active" : ""}" data-act="tog-rem" data-id="${r.id}">${r.enabled ? "On" : "Off"}</button></div>`
          ).join("")}</div>
        </section>
        <section class="card">
          <h2>Settings</h2>
          <div class="btn-row">
            <button class="btn" data-act="theme">Toggle ${state.theme === "light" ? "dark" : "light"} mode</button>
            <button class="btn" data-act="export">Download my data</button>
            <button class="btn" data-act="reset">Reset app</button>
          </div>
          <p class="tiny" style="margin-top:10px">Estimates are educational, not medical advice. Team Red · ISE 588.</p>
        </section>
      </div>`;
  }

  function renderHistory() {
    const meals = state.meals.slice(0, 30);
    const workouts = state.workouts.slice(0, 30);
    root.innerHTML = `${topbar("History")}
      ${nav("you")}
      <div class="main grid">
        <section class="card"><h2>Meals</h2>${meals.length ? `<div class="list">${meals.map((m) =>
          `<div class="list-item"><div>🍽️</div><div><b>${esc(m.slot)}</b><div class="tiny">${esc(m.at.slice(0, 10))} · ${esc((m.items || []).map((i) => i.name).join(", "))}</div></div><b>${m.kcal}</b></div>`
        ).join("")}</div>` : `<p class="muted">Nothing logged yet.</p>`}</section>
        <section class="card"><h2>Workouts</h2>${workouts.length ? `<div class="list">${workouts.map((w) =>
          `<div class="list-item"><div>🏋️</div><div><b>${esc(w.name)}</b><div class="tiny">${esc(w.at.slice(0, 10))} · ${w.minutes} min</div></div><b>${w.kcal}</b></div>`
        ).join("")}</div>` : `<p class="muted">No workouts yet. Open Gym and finish a tutorial.</p>`}</section>
      </div>`;
  }

  function renderChallenges() {
    const you = {
      name: state.profile.name,
      streak: E.streakFromDays(E.uniqueDays(state.meals.map((m) => m.at))),
      meals: state.meals.length,
      workouts: state.workouts.length
    };
    const board = [{ ...you, id: "you", city: "You" }].concat(D.FRIENDS).sort((a, b) => b.streak - a.streak || b.meals - a.meals);
    root.innerHTML = `${topbar("Challenges")}
      ${nav("you")}
      <div class="main grid">
        <section class="card">
          <h2>This week's boards</h2>
          <div class="list">${D.CHALLENGES.map((c) => {
            const on = (state.joinedChallenges || []).includes(c.id);
            return `<div class="list-item"><div>🏁</div><div><b>${esc(c.name)}</b><div class="tiny">${esc(c.detail)}</div></div><button class="chip ${on ? "active" : ""}" data-act="join" data-id="${c.id}">${on ? "Joined" : "Join"}</button></div>`;
          }).join("")}</div>
        </section>
        <section class="card">
          <h2>Friend streak board</h2>
          <div class="list">${board.map((p, i) =>
            `<div class="list-item"><div>#${i + 1}</div><div><b>${esc(p.name)}</b><div class="tiny">${esc(p.city || "")} · ${p.meals} meals</div></div><b>${p.streak}🔥</b></div>`
          ).join("")}</div>
        </section>
      </div>`;
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "calorie-capture-data.json";
    a.click();
  }

  async function enableReminders() {
    if (!("Notification" in window)) {
      toast("This browser cannot show system notifications. In-app reminders still run.");
      return;
    }
    const perm = await Notification.requestPermission();
    toast(perm === "granted" ? "Reminders on. Keep the app open or pinned." : "Permission denied. Toggles still work in-app.");
  }

  function checkReminders() {
    const due = E.reminderDue(state.reminders);
    due.forEach((r) => {
      const key = `${E.todayKey()}-${r.id}`;
      if (state.lastNotify[key]) return;
      state.lastNotify[key] = true;
      persist();
      toast(r.label);
      if (window.Notification && Notification.permission === "granted") {
        try { new Notification("CalorieCapture", { body: r.label, icon: "assets/icon-192.png" }); } catch (err) { /* ignore */ }
      }
    });
  }

  function render() {
    applyTheme();
    const r = route();
    if (!state.profile && r.name !== "onboarding") {
      renderWelcome();
      return;
    }
    if (r.name === "onboarding" || (!state.profile && r.name === "onboarding")) {
      if (!state.draftProfile) state.draftProfile = { name: "", age: 34, sex: "male", goal: "lose", activity: "sedentary", weight: 190, weightUnit: "lb", height: 70, heightUnit: "in" };
      renderOnboarding();
      return;
    }
    const views = {
      home: renderHome,
      log: renderLog,
      gym: () => (r.id ? renderTutorial(r.id) : renderGym()),
      tutorial: () => renderTutorial(r.id),
      plan: renderPlan,
      you: renderYou,
      history: renderHistory,
      challenges: renderChallenges
    };
    (views[r.name] || renderHome)();
  }

  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "start") {
      state.seenWelcome = true;
      go("#/onboarding");
    }
    if (act === "demo") startDemo();
    if (act === "goal") {
      state.draftProfile = collectOnboard();
      state.draftProfile.goal = btn.dataset.id;
      render();
    }
    if (act === "activity") {
      state.draftProfile = collectOnboard();
      state.draftProfile.activity = btn.dataset.id;
      render();
    }
    if (act === "finish-onboard") finishOnboard(collectOnboard());
    if (act === "theme") {
      state.theme = state.theme === "light" ? "dark" : "light";
      persist();
      render();
    }
    if (act === "water") {
      const n = Number(btn.dataset.n);
      const current = S.waterFor(state, E.todayKey());
      S.setWater(state, E.todayKey(), current === n ? n - 1 : n);
      render();
    }
    if (act === "plate") {
      draft.plateId = btn.dataset.id;
      if (draft.analysis) {
        const historyNames = state.meals.slice(0, 12).flatMap((m) => (m.items || []).map((i) => i.name));
        draft.analysis = E.analyzeMeal({
          shares: draft.analysis.shares || {},
          plateId: draft.plateId,
          hour: new Date().getHours(),
          historyNames
        });
        draft.items = draft.analysis.items.map((item) => Object.assign({}, item));
      }
      render();
    }
    if (act === "slot") { draft.slot = btn.dataset.id; render(); }
    if (act === "add-food") {
      const food = D.FOODS.find((f) => f.id === btn.dataset.id);
      if (food) draft.items.push(E.scaleItem(food, 1, 1));
      render();
    }
    if (act === "rm-item") {
      draft.items.splice(Number(btn.dataset.i), 1);
      render();
    }
    if (act === "save-meal") saveMeal();
    if (act === "log-eq") logEquipment(btn.dataset.id);
    if (act === "mark-tutorial") {
      if (!state.tutorials.includes(btn.dataset.id)) state.tutorials.push(btn.dataset.id);
      persist();
      toast("Tutorial marked. That counts toward gym confidence.");
    }
    if (act === "plan-goal") { state.planGoal = btn.dataset.id; persist(); render(); }
    if (act === "plan-min") { state.planMin = Number(btn.dataset.n); persist(); render(); }
    if (act === "plan-set") { state.planSetting = btn.dataset.id; persist(); render(); }
    if (act === "make-plan") {
      const routine = E.generateRoutine({
        goal: state.planGoal || "balanced",
        minutes: state.planMin || 30,
        setting: state.planSetting || "gym",
        experience: "beginner"
      });
      state.routines = [routine];
      persist();
      render();
    }
    if (act === "toggle-block") {
      const routine = state.routines[0];
      if (!routine) return;
      routine.blocks[Number(btn.dataset.i)].done = !routine.blocks[Number(btn.dataset.i)].done;
      persist();
      render();
    }
    if (act === "finish-routine") {
      const routine = state.routines[0];
      if (!routine) return;
      routine.blocks.forEach((b) => {
        if (!b.done) return;
        const eq = D.EQUIPMENT.find((e) => e.id === b.equipmentId);
        S.addWorkout(state, {
          id: `wo-${Date.now()}-${b.equipmentId}`,
          at: new Date().toISOString(),
          equipmentId: b.equipmentId,
          name: b.name,
          minutes: b.minutes,
          effort: "steady",
          kcal: b.kcal
        });
        if (eq && !state.tutorials.includes(eq.id)) state.tutorials.push(eq.id);
      });
      state.completedRoutine = true;
      persist();
      toast("Session saved to calories out.");
      go("#/");
    }
    if (act === "join") {
      if (!state.joinedChallenges.includes(btn.dataset.id)) state.joinedChallenges.push(btn.dataset.id);
      persist();
      render();
    }
    if (act === "tog-rem") {
      const rem = state.reminders.find((r) => r.id === btn.dataset.id);
      if (rem) rem.enabled = !rem.enabled;
      persist();
      render();
    }
    if (act === "notify") enableReminders();
    if (act === "export") exportData();
    if (act === "reset") {
      if (confirm("Reset CalorieCapture on this device?")) {
        state = S.reset();
        go("#/");
        render();
      }
    }
  });

  window.addEventListener("hashchange", render);
  applyTheme();
  render();
  setInterval(checkReminders, 20000);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
