// Vice Ledger — GTA 6 trophy guide & tracker.
// Loads app/data/trophies.json (same origin, no network beyond the app itself),
// saves checklist progress in localStorage, and offers export / import.
// URL helpers for screenshots and sharing: ?demo=1 seeds 13 earned trophies,
// ?view=roadmap|missables|sources opens a section, ?open=<trophy id> expands one guide.
const STORE_KEY = "vice-ledger-progress-v1";
const DEMO_EARNED = [
  "just-like-paradise", "paradise-lost", "t-ass-drug-money", "vice-city-baby",
  "trust", "family-matters", "stick-fiddler", "baited-my-tackle",
  "in-the-beginning", "lets-go-bowling", "treat-yo-self", "on-the-spot",
  "a-classic-blitz-play",
];

const KIND_LABELS = {
  story: "Story", side: "Side characters", activity: "Activities",
  collectible: "Collectibles", robbery: "Robberies", exploration: "Exploration",
  money: "Money", secret: "Secrets", completion: "100% completion", platinum: "Platinum",
};

const ROADMAP = [
  {
    title: "Stage 1 — Play the story",
    text: "Chapters 1 to 4, then the final mission. Twelve story trophies unlock automatically as you finish missions — including the gold for the final mission. Keep a manual save at the start of every chapter. Do the meditation spots the moment you find them: Positive Mental Attitude is the run's only missable trophy, and its Chapter 1 spot vanishes when the chapter ends.",
    stage: 1,
  },
  {
    title: "Stage 2 — Side characters & strangers",
    text: "Finish the mission strands for Andy, Kenton, Billy, Randy, Tyrone and Bret, and complete 8 stranger strands across Leonida for the silver Strangers & Freaks. Start strands as their icons appear; each one ends with a final mission that carries its own trophy.",
    stage: 2,
  },
  {
    title: "Stage 3 — Activities & challenges",
    text: "The skill grind: gold medals in all 42 Shooting Range challenges, 250 stunts, 20 different race wins, a Top Fun drone race win at every location, beating Cal at fishing, one arcade game, 50 challenges, and 5 takedowns in a single Combat Focus. Practise the shooting range between story missions so it is not 42 golds in one sitting.",
    stage: 3,
  },
  {
    title: "Stage 4 — Robberies & money",
    text: "Five bank vaults, one armored truck, one jewelry store without being detected, one illegal operation per gang, and three shops back-to-back with your partner. Launder $250,000 in Marked Bills through your contacts, spend $100,000 in shops, and buy every garage property. Plan escape routes before you go in — the escape is half the robbery.",
    stage: 4,
  },
  {
    title: "Stage 5 — Collectibles, exploration & the platinum",
    text: "WAiNK at 100 locations, 100 vehicles discovered, 3 collectible card sets, 10 vehicles registered, the whole of Leonida explored, and the 100% completion checklist (A Long Road) finished. The platinum, Vice Got a Price!, pops the moment the other 54 are done.",
    stage: 5,
  },
];

const state = {
  trophies: [],
  sources: {},
  earned: new Set(),
  search: "",
  grade: "",
  kind: "",
  earnedOnly: false,
  spoilersHidden: true,
  openId: null,
};

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed.earned) ? parsed.earned : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...state.earned].sort(), savedAt: new Date().toISOString() }));
}

function gradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isSpoilerHidden(trophy) {
  return state.spoilersHidden && trophy.hidden && !state.earned.has(trophy.id);
}

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.grade && t.grade !== state.grade) return false;
    if (state.kind && t.kind !== state.kind) return false;
    if (state.earnedOnly && !state.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const earned = state.earned.size;
  const total = state.trophies.length || 55;
  $("earnedCount").textContent = earned;
  $("progressFill").style.width = `${(earned / total) * 100}%`;
  $("progressBar").setAttribute("aria-valuenow", String(earned));
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  state.trophies.forEach((t) => { if (state.earned.has(t.id)) counts[t.grade] += 1; });
  $("gradeLine").textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
  const next = state.trophies.find((t) => !state.earned.has(t.id) && t.missable)
    || state.trophies.find((t) => !state.earned.has(t.id));
  $("nextUp").textContent = next
    ? (next.missable ? `Do first: ${next.name} — the only missable trophy.` : `Next up: ${next.name}`)
    : "Platinum earned — Leonida Legend!";
}

function sourceLinks(trophy) {
  return (trophy.sources || []).map((key) => {
    const s = state.sources[key];
    if (!s) return key;
    return `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`;
  }).join(" · ");
}

function renderList() {
  const list = visibleTrophies();
  const ul = $("trophyList");
  ul.innerHTML = "";
  $("emptyState").hidden = list.length > 0;
  $("resultCount").textContent = `Showing ${list.length} of ${state.trophies.length} trophies · ${state.earned.size} earned`;
  list.forEach((t) => {
    const earned = state.earned.has(t.id);
    const hidden = isSpoilerHidden(t);
    const li = document.createElement("li");
    li.className = `trophy${earned ? " earned" : ""}`;
    li.id = `trophy-${t.id}`;
    const name = hidden ? "Hidden story trophy" : t.name;
    const desc = hidden ? "Earn this trophy to reveal its name and description." : t.description;
    const target = t.target ? `<span class="tag">Target: ${Number(t.target).toLocaleString("en-US")}</span>` : "";
    const missable = t.missable ? `<span class="tag missable">⚠ Missable — do it in Chapter 1</span>` : "";
    const hiddenTag = t.hidden ? `<span class="tag hidden-tag">Hidden on PSN</span>` : "";
    const open = state.openId === t.id;
    li.innerHTML = `
      <div class="trophy-head">
        <input type="checkbox" class="trophy-check" data-id="${t.id}" ${earned ? "checked" : ""}
          aria-label="Mark ${hidden ? "hidden trophy" : t.name} as earned">
        <div class="trophy-main">
          <h3 class="trophy-name">${name}</h3>
          <p class="trophy-desc">${desc}</p>
          <div class="trophy-meta">
            <span class="badge ${t.grade}">${gradeWord(t.grade)}</span>
            <span class="tag">${KIND_LABELS[t.kind] || t.kind}</span>
            ${target}${missable}${hiddenTag}
          </div>
          <div class="trophy-detail" ${open ? "" : "hidden"}>
            <h4>Guide</h4>
            <p>${t.guide}</p>
            <p class="sources">Sources: ${sourceLinks(t)}</p>
          </div>
          <button type="button" class="details-btn" data-id="${t.id}" aria-expanded="${open}">
            ${open ? "Hide guide ▲" : "Read the guide ▼"}
          </button>
        </div>
      </div>`;
    ul.appendChild(li);
  });
}

function renderRoadmap() {
  const ol = $("roadmapList");
  ol.innerHTML = "";
  ROADMAP.forEach((stage) => {
    const names = state.trophies
      .filter((t) => t.stage === stage.stage)
      .map((t) => t.name);
    const li = document.createElement("li");
    li.innerHTML = `<h4>${stage.title}</h4><p>${stage.text}</p>
      <p class="stage-trophies">Trophies in this stage: ${names.join(" · ")}</p>`;
    ol.appendChild(li);
  });
}

function renderMissables() {
  const box = $("missableList");
  const missable = state.trophies.filter((t) => t.missable);
  box.innerHTML = "";
  missable.forEach((t) => {
    const earned = state.earned.has(t.id);
    const div = document.createElement("div");
    div.className = `trophy${earned ? " earned" : ""}`;
    div.innerHTML = `
      <div class="trophy-head">
        <input type="checkbox" class="trophy-check" data-id="${t.id}" ${earned ? "checked" : ""}
          aria-label="Mark ${t.name} as earned">
        <div class="trophy-main">
          <h3 class="trophy-name">${t.name}</h3>
          <p class="trophy-desc">${t.description}</p>
          <div class="trophy-meta"><span class="badge ${t.grade}">${gradeWord(t.grade)}</span>
          <span class="tag missable">⚠ Missable — do it in Chapter 1</span></div>
          <div class="trophy-detail"><h4>Guide</h4><p>${t.guide}</p>
          <p class="sources">Sources: ${sourceLinks(t)}</p></div>
        </div>
      </div>`;
    box.appendChild(div);
  });
}

function renderSources() {
  const ul = $("sourceList");
  ul.innerHTML = "";
  Object.values(state.sources).forEach((s) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`;
    ul.appendChild(li);
  });
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
  renderMissables();
  renderSources();
}

function setView(view) {
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  document.querySelectorAll(".view").forEach((s) => s.classList.toggle("active", s.id === `view-${view}`));
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ app: "vice-ledger", exportedAt: new Date().toISOString(), earned: [...state.earned].sort() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "vice-ledger-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = new Set(state.trophies.map((t) => t.id));
      const earned = (parsed.earned || []).filter((id) => ids.has(id));
      state.earned = new Set(earned);
      saveProgress();
      renderAll();
    } catch {
      alert("That file is not a valid Vice Ledger progress export.");
    }
  };
  reader.readAsText(file);
}

async function boot() {
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  state.trophies = data.trophies;
  state.sources = data.sources || {};
  state.earned = loadProgress();

  // Demo mode for screenshots: seed 13 earned trophies without touching saved progress.
  if (params.get("demo") === "1") {
    state.earned = new Set(DEMO_EARNED);
  }
  if (params.get("view")) setView(params.get("view"));
  if (params.get("open")) state.openId = params.get("open");
  if (params.get("q")) { state.search = params.get("q"); $("searchBox").value = state.search; }

  $("searchBox").addEventListener("input", (e) => { state.search = e.target.value; renderList(); });
  $("gradeFilter").addEventListener("change", (e) => { state.grade = e.target.value; renderList(); });
  $("kindFilter").addEventListener("change", (e) => { state.kind = e.target.value; renderList(); });
  $("earnedOnly").addEventListener("change", (e) => { state.earnedOnly = e.target.checked; renderList(); });
  $("spoilerToggle").addEventListener("change", (e) => { state.spoilersHidden = e.target.checked; renderList(); });
  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  document.addEventListener("change", (e) => {
    const box = e.target.closest(".trophy-check");
    if (!box) return;
    if (box.checked) state.earned.add(box.dataset.id); else state.earned.delete(box.dataset.id);
    if (params.get("demo") !== "1") saveProgress();
    renderAll();
  });
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".details-btn");
    if (!btn) return;
    state.openId = state.openId === btn.dataset.id ? null : btn.dataset.id;
    renderList();
    const el = document.getElementById(`trophy-${btn.dataset.id}`);
    if (el) el.scrollIntoView({ block: "nearest" });
  });

  $("exportBtn").addEventListener("click", exportProgress);
  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  $("resetBtn").addEventListener("click", () => {
    if (confirm("Reset all 55 trophies to unearned?")) {
      state.earned = new Set();
      saveProgress();
      renderAll();
    }
  });

  renderAll();
  if (location.hash.startsWith("#trophy-")) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) el.scrollIntoView({ block: "start" });
  }
}

boot();
