(function () {
  const E = window.CC_ENGINE;
  const D = window.CC_DATA;
  const S = window.CC_STORE;
  const AI = window.CC_AI;
  const root = document.getElementById("app");
  let state = S.load();
  let draft = null;
  let analyzing = false;
  let restLeft = 0;
  let restTimer = null;
  let onboard = { step: 0, goal: "lose", experience: "beginner", frequency: "4-5", motive: "progress", name: "", persona: "" };

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function go(h) { location.hash = h; }
  function persist() { S.save(state); }
  function route() {
    const parts = (location.hash || "#/").replace(/^#/, "").split("/").filter(Boolean);
    if (!parts.length) return { name: "home" };
    if (parts[0] === "workout" && parts[1]) return { name: "exercise", id: parts[1] };
    if (parts[0] === "equipment" && parts[1]) return { name: "equipment", id: parts[1] };
    return { name: parts[0], id: parts[1] };
  }
  function todayMeals() {
    return state.meals.filter((m) => E.todayKey(m.at) === E.todayKey());
  }
  function eaten() { return todayMeals().reduce((s, m) => s + (m.kcal || 0), 0); }
  function protein() { return todayMeals().reduce((s, m) => s + (m.protein || 0), 0); }
  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }
  function persona() {
    return D.PERSONAS.find((p) => p.id === (state.profile && state.profile.persona)) || D.PERSONAS[1];
  }
  function peopleById(id) { return D.PEOPLE.find((p) => p.id === id); }
  function sessionSets() {
    let done = 0; let total = 0;
    (state.session.exercises || []).forEach((ex) => (ex.sets || []).forEach((s) => { total += 1; if (s.done) done += 1; }));
    return { done, total };
  }
  function award(kind, label) {
    const xp = E.xpFor(kind);
    state.points = (state.points || 0) + xp;
    state.xpLog.unshift({ at: new Date().toISOString(), kind, xp, label });
    const day = E.todayKey();
    if (!state.activityDays.includes(day)) {
      state.activityDays.push(day);
      state.streak = E.streakFromDays(state.activityDays);
    }
    persist();
    showXp(label, xp);
  }
  function showXp(label, xp) {
    document.querySelectorAll(".xp").forEach((n) => n.remove());
    const el = document.createElement("div");
    el.className = "xp";
    el.innerHTML = `<b>${esc(label)}</b><div>+${xp} XP</div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  function shell(active, inner) {
    const first = (state.profile && state.profile.name || "there").split(" ")[0];
    const items = [
      ["#/", "home", "⌂", "Home"],
      ["#/meals", "meals", "🍽", "Meals"],
      ["#/workout", "workout", "💪", "Workout"],
      ["#/friends", "friends", "◎", "Friends"],
      ["#/profile", "profile", "●", "Profile"]
    ];
    const desk = items.concat([["#/progress", "progress", "📈", "Progress"]]);
    return `<aside class="rail">
      <div class="logo"><i>C</i> Calorie Capture</div>
      <nav class="desk-nav">${desk.map(([href, id, icon, label]) =>
        `<a href="${href}" class="${active === id || (active === "exercise" && id === "workout") || (active === "scan" && id === "meals") ? "active" : ""}">${icon} ${label}</a>`
      ).join("")}</nav>
      <button class="log-meal" data-act="scan" style="margin-top:16px">+ Log meal</button>
    </aside>
    <div class="main">
      <div class="top">
        <div class="logo"><i>C</i><div>Calorie Capture<div class="tiny">${esc(persona().name)}</div></div></div>
        <button class="log-meal" data-act="scan">+ Log meal</button>
      </div>
      ${inner}
    </div>
    <nav class="nav">${items.map(([href, id, icon, label]) =>
      `<a href="${href}" class="${active === id || (active === "exercise" && id === "workout") || (active === "scan" && id === "meals") ? "active" : ""}"><span>${icon}</span>${label}</a>`
    ).join("")}</nav>`;
  }

  function ring(pct) {
    const p = E.clamp(pct, 0, 1);
    const c = 2 * Math.PI * 54;
    return `<svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
      <circle cx="66" cy="66" r="54" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="12"/>
      <circle cx="66" cy="66" r="54" fill="none" stroke="#FF5A5F" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${(c * p).toFixed(1)} ${c}" style="animation:ringin .7s ease"/>
    </svg>`;
  }

  function renderOnboard() {
    const steps = [
      { title: "What is your main goal?", key: "goal", opts: D.GOALS.map((g) => [g.id, g.label]) },
      { title: "What's your experience?", key: "experience", opts: [["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]] },
      { title: "How often do you want to work out?", key: "frequency", opts: [["2-3", "2–3 days"], ["4-5", "4–5 days"], ["6+", "6+ days"]] },
      { title: "What motivates you?", key: "motive", opts: [["progress", "Seeing progress"], ["competition", "Competition"], ["streaks", "Streaks"], ["goals", "Personal goals"], ["rewards", "Rewards"]] },
      { title: "Choose your persona", key: "persona", opts: D.PERSONAS.map((p) => [p.id, `${p.emoji} ${p.name}`]) }
    ];
    const s = steps[onboard.step] || steps[0];
    if (onboard.step === 4 && !onboard.persona) onboard.persona = E.pickPersona(onboard);
    root.innerHTML = `<div class="ob">
      <p class="tiny">Step ${onboard.step + 1} of 5</p>
      <h1>${esc(s.title)}</h1>
      ${onboard.step === 0 ? `<label class="field"><span>Your name</span><input id="ob-name" value="${esc(onboard.name)}" placeholder="Kshitija" /></label>` : ""}
      <div class="btn-row">${s.opts.map(([id, label]) =>
        `<button class="chip ${onboard[s.key] === id ? "on" : ""}" data-act="ob-opt" data-key="${s.key}" data-id="${id}">${esc(label)}</button>`
      ).join("")}</div>
      ${onboard.step === 4 ? `<p class="muted" style="margin:12px 0">${esc((D.PERSONAS.find((p) => p.id === onboard.persona) || {}).line || "")}</p>` : ""}
      <div class="btn-row" style="margin-top:18px">
        ${onboard.step ? `<button class="btn" data-act="ob-back">Back</button>` : ""}
        <button class="btn btn-primary" data-act="ob-next">${onboard.step === 4 ? "Build my home" : "Continue"}</button>
      </div>
      <button class="btn btn-wide" data-act="demo" style="margin-top:10px">Show stakeholder demo</button>
    </div>`;
  }

  function finishOnboard() {
    const name = (document.getElementById("ob-name") && document.getElementById("ob-name").value.trim()) || onboard.name || "Friend";
    const personaId = onboard.persona || E.pickPersona(onboard);
    state.profile = {
      name, username: name.toLowerCase().replace(/\s+/g, ""), persona: personaId,
      goal: onboard.goal, experience: onboard.experience, frequency: onboard.frequency, motive: onboard.motive,
      age: 25, sex: "female", weight: 132, weightUnit: "lb", height: 64, heightUnit: "in", activity: "light"
    };
    state.targets = Object.assign(E.estimateTargets(state.profile), { sleep: "—" });
    if (state.targets.calories === 1850 || onboard.goal === "lose") state.targets.calories = Math.min(state.targets.calories, 1850);
    state.onboarded = true;
    persist();
    go("#/");
  }

  function renderHome() {
    const t = state.targets;
    const inK = eaten();
    const remain = Math.max(0, t.calories - inK);
    const insight = E.insightCopy(state);
    const p = persona();
    const sets = sessionSets();
    const cards = state.dashCards || ["goal", "score", "plan", "meals", "circle"];
    const first = state.profile.name.split(" ")[0];
    const within = inK > 0 && inK <= t.calories;
    let html = `<section class="hello"><h1>${greeting()}, ${esc(first)}.</h1><p>${esc(p.emoji)} ${esc(p.line)}</p></section><div class="grid two">`;
    if (cards.includes("goal")) {
      html += `<section class="card goal-card">
        <p class="tiny">Your goal today</p>
        <h2 style="font-size:1.6rem">${inK.toLocaleString()} / ${t.calories.toLocaleString()} kcal</h2>
        <div class="rings">
          <div class="ring">${ring(inK / t.calories)}<div class="ring-c"><strong>${remain}</strong><span class="tiny">remaining</span></div></div>
          <div>
            <div class="stat"><span>Consumed</span><b>${inK}</b></div>
            <div class="bar"><i style="width:${E.clamp(inK / t.calories * 100, 0, 100)}%"></i></div>
            <div class="stat"><span>Protein</span><b>${protein()} / ${t.protein}g</b></div>
            <p class="insight">${esc(insight.lines[0])}</p>
          </div>
        </div>
      </section>`;
    }
    if (cards.includes("score")) {
      html += `<section class="card"><h2>Today's score</h2>
        <div class="score"><div><b>${state.points}</b><span class="tiny">points</span></div>
        <div><span class="pill">🔥 ${state.streak} day streak</span><p class="tiny" style="margin-top:8px">You're on a roll.</p></div></div>
        <p class="muted" style="margin-top:10px">${esc(insight.lines[1])}</p></section>`;
    }
    html += `</div><div class="grid" style="margin-top:12px">`;
    if (cards.includes("plan")) {
      html += `<section class="card"><h2>Today's plan</h2><div class="plan">
        <a href="#/workout"><div><div class="tiny">Workout</div><b>${esc(state.session.name)}</b></div><span class="tiny">${sets.done}/${sets.total} sets</span></a>
        <a href="#/scan"><div><div class="tiny">Nutrition</div><b>${remain} kcal remaining</b></div><span class="tiny">${within ? "In range" : "Log the next plate"}</span></a>
        <div class="row-card"><div><div class="tiny">Recovery</div><b>${esc(t.sleep || "—")}</b></div><span class="tiny">Sleep last night</span></div>
      </div><p class="muted" style="margin-top:10px">${esc(insight.lines[2])}</p></section>`;
    }
    if (cards.includes("meals")) {
      const meals = todayMeals();
      html += `<section class="card"><div class="row"><h2>Today's plates</h2><button class="chip" data-act="scan">Scan meal</button></div>
        ${meals.length ? meals.map(mealRow).join("") : empty("Your food journey starts here.", "Snap your first meal and let AI do the logging.", "scan")}</section>`;
    }
    if (cards.includes("circle")) {
      html += `<section class="card"><div class="row"><h2>Your circle</h2><a class="tiny" href="#/friends">See all</a></div>${circleList()}</section>`;
    }
    html += `</div>`;
    root.innerHTML = shell("home", html);
  }

  function mealRow(m) {
    const img = m.image ? `<img src="${esc(m.image)}" alt="">` : `<div class="ph"></div>`;
    return `<div class="meal" style="margin-top:8px">${img}<div><b>${esc(m.title || m.slot)}</b><div class="tiny">${esc(m.slot)} · ${esc((m.items || []).map((i) => i.name).join(", ") || "Logged meal")}</div></div><b>${m.kcal}</b></div>`;
  }
  function empty(title, body, act) {
    return `<div class="empty"><h2>${esc(title)}</h2><p class="muted">${esc(body)}</p>${act ? `<button class="btn btn-primary" style="margin-top:12px" data-act="${act}">Start</button>` : ""}</div>`;
  }
  function circleList() {
    const mine = state.friends.map(peopleById).filter(Boolean);
    if (!mine.length) return empty("Build your fitness circle.", "Add friends and keep each other accountable.", "goto-friends");
    return mine.map((p) => `<div class="friend"><div class="av">${esc(p.name[0])}</div><div><b>${esc(p.name)}</b><div class="tiny">${p.streak} day streak · ${p.workoutsWeek} workouts</div></div><b>${p.points}</b></div>`).join("");
  }

  function renderMeals() {
    const groups = {};
    state.meals.forEach((m) => {
      const k = E.todayKey(m.at) === E.todayKey() ? "TODAY" : E.todayKey(m.at);
      groups[k] = groups[k] || [];
      groups[k].push(m);
    });
    const keys = Object.keys(groups);
    root.innerHTML = shell("meals", `<section class="card scan" data-act="scan"><div><p class="tiny">AI meal camera</p><b>📸 Scan your meal</b><p class="tiny">Camera or photo library. Estimates only.</p></div></section>
      <div class="grid" style="margin-top:12px">${keys.length ? keys.map((k) =>
        `<section class="card"><h2>${esc(k)}</h2>${groups[k].map(mealRow).join("")}</section>`
      ).join("") : `<section class="card">${empty("Your food journey starts here.", "Snap your first meal and let AI do the logging.", "scan")}</section>`}</div>`);
  }

  function renderScan() {
    const t = draft && draft.totals;
    root.innerHTML = shell("scan", `<section class="card">
      <h2>Scan your meal</h2>
      <div class="scan" style="margin-top:10px">
        ${draft && draft.image ? `<img src="${draft.image}" alt="Meal">` : `<div><b>Take or upload a photo</b><p class="tiny">Nothing leaves this device.</p></div>`}
        <input id="meal-file" type="file" accept="image/*" capture="environment">
      </div>
      ${analyzing ? `<div class="analyzing"><div class="orb"></div><b>Analyzing your meal…</b></div>` : ""}
      ${draft && !analyzing ? `<div style="margin-top:14px">
        <p class="tiny">Estimated plate</p>
        <h2>${esc(draft.title)}</h2>
        <p><b>${t.kcal} kcal</b> · Confidence: ${esc(draft.confidence)}</p>
        <p class="tiny">${esc(draft.note)}</p>
        ${(draft.items || []).map((item, i) => `<div class="row" style="margin-top:10px">
          <div><b>${esc(item.name)}</b><div class="tiny">~${item.grams}g · ${item.kcal} kcal</div></div>
          <select data-act="grams" data-i="${i}">${[100, 150, 200, 250].map((g) =>
            `<option value="${g}" ${Number(item.grams) === g ? "selected" : ""}>${g}g</option>`
          ).join("")}<option value="custom">Custom</option></select>
        </div>`).join("")}
        <p style="margin-top:12px">Macros · P ${t.protein}g · C ${t.carbs}g · F ${t.fat}g</p>
        <button class="btn btn-primary btn-wide" data-act="save-meal" style="margin-top:12px">Save estimated meal · +${D.XP.meal} XP</button>
      </div>` : `<p class="muted" style="margin-top:12px">Choose camera or a file. Then edit portions before you save.</p>`}
    </section>`);
    const file = document.getElementById("meal-file");
    if (file) file.addEventListener("change", onMealFile);
    root.querySelectorAll("select[data-act='grams']").forEach((sel) => {
      sel.addEventListener("change", () => {
        const i = Number(sel.dataset.i);
        const food = D.FOODS.find((f) => f.id === draft.items[i].id);
        let g = sel.value;
        if (g === "custom") g = window.prompt("Grams?", draft.items[i].grams) || draft.items[i].grams;
        draft.items[i] = Object.assign(E.scaleByGrams(food, Number(g)), { approx: true });
        draft.totals = E.sumMacros(draft.items);
        render();
      });
    });
  }

  async function onMealFile(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    analyzing = true;
    render();
    try {
      draft = await AI.analyzeMeal(file, { historyNames: state.meals.flatMap((m) => (m.items || []).map((i) => i.name)) });
    } catch (err) {
      draft = null;
      showXp("Could not read that photo", 0);
    }
    analyzing = false;
    render();
  }

  function saveMeal() {
    if (!draft) return;
    const totals = E.sumMacros(draft.items);
    state.meals.unshift({
      id: `meal-${Date.now()}`,
      at: new Date().toISOString(),
      slot: E.mealSlotForHour(new Date().getHours()),
      title: draft.title,
      image: draft.image,
      items: draft.items,
      kcal: totals.kcal,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat
    });
    award("meal", "Meal logged");
    if (eaten() <= state.targets.calories) award("withinTarget", "Within target");
    draft = null;
    go("#/meals");
  }

  function renderWorkout() {
    const s = state.session;
    const sets = sessionSets();
    root.innerHTML = shell("workout", `<section class="card goal-card">
      <p class="tiny">Today's workout</p>
      <h2 style="font-size:1.7rem">${esc(s.name)}</h2>
      <p>${s.minutes} min · ${s.exercises.length} exercises · ${sets.done}/${sets.total} sets</p>
      <p class="insight">${esc(E.insightCopy(state).lines[2])}</p>
    </section>
    <div class="grid" style="margin-top:12px">${s.exercises.map((ex) => {
      const done = ex.sets.filter((x) => x.done).length;
      return `<a class="ex" href="#/workout/${ex.id}"><div class="row"><b>${esc(ex.name)}</b><span class="tiny">${done}/${ex.sets.length}</span></div>
        <p class="tiny">${esc(ex.muscles.join(" · "))} · ${ex.sets.length} sets × ${ex.sets[0].reps} ${ex.unit || "reps"}</p></a>`;
    }).join("")}</div>
    ${sets.done === 0 ? `<section class="card" style="margin-top:12px">${empty("Ready to move?", "Start today's workout and earn your first XP.", "")}</section>` : ""}`);
  }

  function renderExercise(id) {
    const ex = state.session.exercises.find((e) => e.id === id);
    if (!ex) return renderWorkout();
    const eq = D.EQUIPMENT.find((e) => e.id === ex.equipmentId);
    root.innerHTML = shell("exercise", `<section class="card">
      <p class="tiny">${esc(ex.muscles.join(" · "))}</p>
      <h2 style="font-size:1.6rem">${esc(ex.name)}</h2>
      <p class="muted">${ex.sets.length} sets · rest ${ex.rest}s</p>
      ${restLeft ? `<p class="rest">Rest ${restLeft}s</p>` : ""}
      ${ex.sets.map((set, i) => `<div class="set"><div><b>Set ${i + 1}</b><div class="tiny">${set.reps} ${ex.unit || "reps"}${set.weight ? ` · ${set.weight}` : ""}</div></div>
        <button class="btn ${set.done ? "btn-mint" : "btn-primary"}" data-act="set" data-ex="${ex.id}" data-i="${i}">${set.done ? "Done" : "Complete set"}</button></div>`).join("")}
      <a class="btn btn-wide" href="#/equipment/${ex.equipmentId}" style="margin-top:12px;display:block;text-align:center">How to use this machine</a>
    </section>`);
  }

  function completeSet(exId, i) {
    const ex = state.session.exercises.find((e) => e.id === exId);
    if (!ex || ex.sets[i].done) return;
    ex.sets[i].done = true;
    award("set", "SET COMPLETE");
    if (ex.sets.every((s) => s.done)) award("exercise", "Exercise done");
    const all = state.session.exercises.every((e) => e.sets.every((s) => s.done));
    if (all && !state.session.done) {
      state.session.done = true;
      award("workout", "Workout complete");
      state.workouts.unshift({ id: `w-${Date.now()}`, at: new Date().toISOString(), name: state.session.name, kcal: 240 });
    }
    persist();
    restLeft = ex.rest;
    clearInterval(restTimer);
    restTimer = setInterval(() => {
      restLeft -= 1;
      if (restLeft <= 0) { clearInterval(restTimer); restLeft = 0; }
      if (route().name === "exercise") render();
    }, 1000);
    render();
  }

  function renderEquipment(id) {
    const eq = D.EQUIPMENT.find((e) => e.id === id);
    if (!eq) return renderWorkout();
    if (!state.tutorials.includes(eq.id)) state.tutorials.push(eq.id);
    persist();
    root.innerHTML = shell("workout", `<section class="card">
      <div class="video-ph"><div><b>Tutorial</b><p class="tiny">Video slot ready — connect a real source later. No fake links.</p></div></div>
      <h2>${esc(eq.name)}</h2>
      <p class="muted">${esc(eq.summary)}</p>
      <h3 style="margin:14px 0 8px">How to use it</h3>
      <div class="steps">${eq.steps.map((s) => `<div class="step"><div>${esc(s)}</div></div>`).join("")}</div>
      <h3 style="margin:14px 0 8px">Common mistakes</h3>
      <ul>${eq.mistakes.map((m) => `<li class="muted">${esc(m)}</li>`).join("")}</ul>
      <a class="btn btn-primary btn-wide" href="#/workout" style="margin-top:14px;display:block;text-align:center">Back to workout</a>
    </section>`);
  }

  function renderProgress() {
    const week = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = E.todayKey(d);
      week.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), on: state.activityDays.includes(key) });
    }
    const workoutsWeek = state.workouts.filter((w) => (Date.now() - new Date(w.at).getTime()) < 8 * 86400000).length;
    const avg = Math.round(state.meals.slice(0, 7).reduce((s, m) => s + m.kcal, 0) / Math.max(1, Math.min(7, state.meals.length)));
    root.innerHTML = shell("progress", `<section class="card"><h2>Weekly consistency</h2>
      <div class="week">${week.map((d) => `<div><i class="${d.on ? "on" : ""}">${d.on ? "✓" : "—"}</i><div class="tiny">${esc(d.label)}</div></div>`).join("")}</div></section>
      <div class="grid two" style="margin-top:12px">
        <section class="card"><h2>Calories</h2><b style="font-size:1.6rem">${avg}</b><p class="tiny">Weekly average logged</p></section>
        <section class="card"><h2>Workouts</h2><b style="font-size:1.6rem">${workoutsWeek} / 5</b><p class="tiny">Completed this week</p></section>
        <section class="card"><h2>Points</h2><b style="font-size:1.6rem">${state.points} XP</b></section>
        <section class="card"><h2>Streak</h2><b style="font-size:1.6rem">${state.streak} days</b><p class="tiny">Meaningful activity — a meal or a set.</p></section>
      </div>`);
  }

  function renderFriends() {
    const q = (state.friendQuery || "").toLowerCase();
    const hits = D.PEOPLE.filter((p) => !state.friends.includes(p.id) && (`${p.name} ${p.username}`.toLowerCase().includes(q)));
    root.innerHTML = shell("friends", `<section class="card"><h2>Your circle</h2>
      ${circleList()}</section>
      <section class="card" style="margin-top:12px"><h2>Add friends</h2>
        <input class="search" id="fq" placeholder="Search username" value="${esc(state.friendQuery || "")}">
        ${hits.slice(0, 5).map((p) => `<div class="friend"><div class="av">${esc(p.name[0])}</div><div><b>${esc(p.name)}</b><div class="tiny">@${esc(p.username)}</div></div>
          <button class="chip" data-act="request" data-id="${p.id}">${state.outgoing.includes(p.id) ? "Sent" : "Add"}</button></div>`).join("")}
      </section>
      ${state.requests.length ? `<section class="card" style="margin-top:12px"><h2>Requests</h2>${state.requests.map((r) => {
        const p = peopleById(r.from); if (!p) return "";
        return `<div class="friend"><div class="av">${esc(p.name[0])}</div><div><b>${esc(p.name)}</b></div>
          <div class="btn-row"><button class="chip on" data-act="accept" data-id="${p.id}">Accept</button></div></div>`;
      }).join("")}</section>` : ""}`);
    const input = document.getElementById("fq");
    if (input) input.addEventListener("input", (e) => { state.friendQuery = e.target.value; renderFriends(); });
  }

  function renderProfile() {
    const p = state.profile;
    root.innerHTML = shell("profile", `<section class="card">
      <h2>${esc(p.name)}</h2>
      <p class="muted">@${esc(p.username)} · ${esc(persona().name)}</p>
      <div class="btn-row" style="margin-top:10px">
        <a class="btn" href="#/progress">Progress</a>
        <a class="btn" href="#/customize">Customize</a>
      </div>
    </section>
    <section class="card" style="margin-top:12px"><h2>Persona</h2>
      <div class="btn-row">${D.PERSONAS.map((x) =>
        `<button class="chip ${p.persona === x.id ? "on" : ""}" data-act="persona" data-id="${x.id}">${x.emoji} ${esc(x.name)}</button>`
      ).join("")}</div></section>
    <section class="card" style="margin-top:12px"><h2>Daily target</h2>
      <label class="field"><span>Calories</span><input id="cal" type="number" value="${state.targets.calories}"></label>
      <button class="btn btn-primary" data-act="save-target">Save target</button>
    </section>
    <section class="card" style="margin-top:12px">
      <button class="btn" data-act="demo">Reload demo day</button>
      <button class="btn" data-act="fresh">Start over</button>
    </section>`);
  }

  function renderCustomize() {
    const cards = [
      ["goal", "Calorie ring"], ["score", "Score + streak"], ["plan", "Today's plan"], ["meals", "Plates"], ["circle", "Circle"]
    ];
    root.innerHTML = shell("profile", `<section class="card"><h2>Dashboard cards</h2>
      ${cards.map(([id, label]) =>
        `<div class="row" style="margin:8px 0"><span>${esc(label)}</span>
          <button class="chip ${state.dashCards.includes(id) ? "on" : ""}" data-act="card" data-id="${id}">${state.dashCards.includes(id) ? "On" : "Off"}</button></div>`
      ).join("")}</section>`);
  }

  function render() {
    const r = route();
    if (!state.onboarded && r.name !== "onboarding") {
      renderOnboard();
      return;
    }
    const views = {
      home: renderHome,
      meals: renderMeals,
      scan: renderScan,
      log: renderScan,
      workout: renderWorkout,
      exercise: () => renderExercise(r.id),
      equipment: () => renderEquipment(r.id),
      progress: renderProgress,
      friends: renderFriends,
      profile: renderProfile,
      customize: renderCustomize,
      onboarding: renderOnboard
    };
    (views[r.name] || renderHome)();
  }

  root.addEventListener("click", (ev) => {
    const scanBox = ev.target.closest(".scan");
    if (scanBox && !ev.target.closest("input") && route().name !== "scan") { go("#/scan"); return; }
    const btn = ev.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "scan") go("#/scan");
    if (act === "goto-friends") go("#/friends");
    if (act === "ob-opt") {
      onboard[btn.dataset.key] = btn.dataset.id;
      const n = document.getElementById("ob-name");
      if (n) onboard.name = n.value;
      render();
    }
    if (act === "ob-next") {
      const n = document.getElementById("ob-name");
      if (n) onboard.name = n.value;
      if (onboard.step < 4) onboard.step += 1;
      else finishOnboard();
      render();
    }
    if (act === "ob-back") { onboard.step = Math.max(0, onboard.step - 1); render(); }
    if (act === "demo") { state = S.seedDemo(); go("#/"); render(); }
    if (act === "fresh") { state = S.reset(); onboard.step = 0; go("#/onboarding"); render(); }
    if (act === "save-meal") saveMeal();
    if (act === "set") completeSet(btn.dataset.ex, Number(btn.dataset.i));
    if (act === "request") {
      if (!state.outgoing.includes(btn.dataset.id)) state.outgoing.push(btn.dataset.id);
      persist(); render();
    }
    if (act === "accept") {
      state.friends.push(btn.dataset.id);
      state.requests = state.requests.filter((r) => r.from !== btn.dataset.id);
      persist(); render();
    }
    if (act === "persona") { state.profile.persona = btn.dataset.id; persist(); render(); }
    if (act === "save-target") {
      state.targets.calories = Number(document.getElementById("cal").value) || state.targets.calories;
      persist(); render();
    }
    if (act === "card") {
      const id = btn.dataset.id;
      if (state.dashCards.includes(id)) state.dashCards = state.dashCards.filter((x) => x !== id);
      else state.dashCards.push(id);
      persist(); render();
    }
    if (act === "grams") {
      const i = Number(btn.dataset.i);
      const food = D.FOODS.find((f) => f.id === draft.items[i].id);
      let g = btn.value;
      if (g === "custom") g = prompt("Grams?", draft.items[i].grams) || draft.items[i].grams;
      draft.items[i] = Object.assign(E.scaleByGrams(food, Number(g)), { approx: true });
      draft.totals = E.sumMacros(draft.items);
      render();
    }
  });

  window.addEventListener("hashchange", render);
  render();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js?v=4").catch(() => {});
  }
})();
