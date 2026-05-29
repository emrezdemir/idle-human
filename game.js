/* =========================================================
   Idle Human — basit bir idle/clicker oyunu
   Saf JavaScript, bağımlılık yok. localStorage'a kaydeder.
   ========================================================= */

"use strict";

const SAVE_KEY = "idle-human-save-v1";
const TICK_MS = 100; // oyun döngüsü (saniyede 10 kez)

/* --- Tanımlar --------------------------------------------------------- */

// Otomatik üreticiler: saniyede pasif puan üretir.
// cost = baseCost * (costGrowth ^ owned)
const GENERATORS = [
  { id: "worker",    icon: "🧑‍🌾", name: "İşçi",          desc: "Elleriyle çalışır",            baseCost: 15,      costGrowth: 1.15, baseRate: 0.2 },
  { id: "farmer",    icon: "🌾",   name: "Çiftçi",        desc: "Toprağı eker biçer",           baseCost: 100,     costGrowth: 1.15, baseRate: 1 },
  { id: "craftsman", icon: "🔨",   name: "Zanaatkâr",     desc: "Aletler ve eşyalar üretir",    baseCost: 1100,    costGrowth: 1.15, baseRate: 8 },
  { id: "merchant",  icon: "⚖️",   name: "Tüccar",        desc: "Ticaretle değer katar",        baseCost: 12000,   costGrowth: 1.15, baseRate: 47 },
  { id: "scientist", icon: "🔬",   name: "Bilim İnsanı",  desc: "Bilgiyi ilerletir",            baseCost: 130000,  costGrowth: 1.15, baseRate: 260 },
  { id: "engineer",  icon: "⚙️",   name: "Mühendis",      desc: "Makineler tasarlar",           baseCost: 1.4e6,   costGrowth: 1.15, baseRate: 1400 },
  { id: "factory",   icon: "🏭",   name: "Fabrika",       desc: "Seri üretim yapar",            baseCost: 2.0e7,   costGrowth: 1.15, baseRate: 7800 },
  { id: "ai",        icon: "🤖",   name: "Yapay Zekâ",    desc: "Her şeyi otomatikleştirir",    baseCost: 3.3e8,   costGrowth: 1.15, baseRate: 44000 },
];

// Yükseltmeler: bir kez satın alınır, çarpan uygular.
// type "click"  -> dokunuş gücünü çarpar
// type "all"    -> tüm pasif üretimi çarpar
// type "gen"    -> belirli bir üreticinin üretimini çarpar (targetId)
const UPGRADES = [
  { id: "u_click_1", icon: "👆", name: "Güçlü Parmaklar",   desc: "Dokunuş gücü x2",            cost: 100,     type: "click", mult: 2 },
  { id: "u_click_2", icon: "💪", name: "Demir İrade",       desc: "Dokunuş gücü x2",            cost: 5000,    type: "click", mult: 2 },
  { id: "u_worker",  icon: "🧤", name: "İş Eldivenleri",    desc: "İşçi üretimi x2",            cost: 500,     type: "gen", targetId: "worker", mult: 2 },
  { id: "u_farmer",  icon: "🚜", name: "Saban",             desc: "Çiftçi üretimi x2",          cost: 4000,    type: "gen", targetId: "farmer", mult: 2 },
  { id: "u_all_1",   icon: "📜", name: "Yazının İcadı",     desc: "Tüm pasif üretim x2",        cost: 25000,   type: "all", mult: 2 },
  { id: "u_sci",     icon: "🧪", name: "Laboratuvar",       desc: "Bilim İnsanı üretimi x3",    cost: 750000,  type: "gen", targetId: "scientist", mult: 3 },
  { id: "u_all_2",   icon: "💡", name: "Aydınlanma",        desc: "Tüm pasif üretim x2",        cost: 5e6,     type: "all", mult: 2 },
  { id: "u_click_3", icon: "⚡", name: "Sinir Hızlandırıcı", desc: "Dokunuş gücü x3",           cost: 2e7,     type: "click", mult: 3 },
  { id: "u_all_3",   icon: "🌐", name: "Dijital Çağ",       desc: "Tüm pasif üretim x3",        cost: 1e9,     type: "all", mult: 3 },
];

/* --- Oyun durumu ------------------------------------------------------ */

function newState() {
  const owned = {};
  GENERATORS.forEach((g) => (owned[g.id] = 0));
  return {
    population: 0,
    totalEarned: 0,
    clicks: 0,
    owned,
    upgrades: {}, // id -> true
    lastSeen: Date.now(),
  };
}

let state = newState();

// Toplu alım miktarı: 1, 10, 100 veya "max" (kaydedilmez, UI tercihi)
let buyAmount = 1;

/* --- Hesaplamalar ----------------------------------------------------- */

function clickPower() {
  let power = 1;
  UPGRADES.forEach((u) => {
    if (u.type === "click" && state.upgrades[u.id]) power *= u.mult;
  });
  return power;
}

function generatorRate(gen) {
  let rate = gen.baseRate * state.owned[gen.id];
  UPGRADES.forEach((u) => {
    if (!state.upgrades[u.id]) return;
    if (u.type === "all") rate *= u.mult;
    if (u.type === "gen" && u.targetId === gen.id) rate *= u.mult;
  });
  return rate;
}

function totalPerSecond() {
  return GENERATORS.reduce((sum, g) => sum + generatorRate(g), 0);
}

function generatorCost(gen) {
  return Math.floor(gen.baseCost * Math.pow(gen.costGrowth, state.owned[gen.id]));
}

// N adet üreticinin toplam maliyeti (geometrik seri toplamı).
function bulkCost(gen, n) {
  const r = gen.costGrowth;
  const k = state.owned[gen.id];
  const first = gen.baseCost * Math.pow(r, k);
  return Math.floor((first * (Math.pow(r, n) - 1)) / (r - 1));
}

// Mevcut puanla satın alınabilecek en fazla adet.
function maxAffordable(gen) {
  const r = gen.costGrowth;
  const k = state.owned[gen.id];
  const first = gen.baseCost * Math.pow(r, k);
  // first * (r^n - 1)/(r-1) <= population  ->  n <= log_r( pop*(r-1)/first + 1 )
  const ratio = (state.population * (r - 1)) / first + 1;
  if (ratio <= 1) return 0;
  return Math.floor(Math.log(ratio) / Math.log(r));
}

// Şu anki toplu alım moduna göre (adet, maliyet) döndürür.
function purchasePlan(gen) {
  let n = buyAmount === "max" ? maxAffordable(gen) : buyAmount;
  if (buyAmount === "max" && n < 1) n = 1; // göstermek için en az 1
  return { n, cost: bulkCost(gen, n) };
}

/* --- Sayı biçimlendirme ----------------------------------------------- */

const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

function fmt(n) {
  if (n < 1000) return Math.floor(n).toString();
  let tier = Math.floor(Math.log10(n) / 3);
  if (tier >= SUFFIXES.length) tier = SUFFIXES.length - 1;
  const scaled = n / Math.pow(1000, tier);
  return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + SUFFIXES[tier];
}

/* --- DOM referansları -------------------------------------------------- */

const el = {
  population: document.getElementById("population"),
  perSecond: document.getElementById("perSecond"),
  clickPower: document.getElementById("clickPower"),
  clickButton: document.getElementById("clickButton"),
  generators: document.getElementById("generators"),
  upgrades: document.getElementById("upgrades"),
  toast: document.getElementById("toast"),
};

/* --- Satın alma ------------------------------------------------------- */

function buyGenerator(gen) {
  const { n, cost } = purchasePlan(gen);
  if (n < 1 || state.population < cost) return;
  state.population -= cost;
  state.owned[gen.id] += n;
  renderShops();
  renderResource();
}

function buyUpgrade(up) {
  if (state.upgrades[up.id] || state.population < up.cost) return;
  state.population -= up.cost;
  state.upgrades[up.id] = true;
  showToast(`${up.icon} ${up.name} alındı!`);
  renderShops();
  renderResource();
}

/* --- Tıklama ----------------------------------------------------------- */

function handleClick(evt) {
  const gain = clickPower();
  state.population += gain;
  state.totalEarned += gain;
  state.clicks++;
  spawnFloatText(evt, "+" + fmt(gain));
  renderResource();
}

function spawnFloatText(evt, text) {
  const x = evt.clientX || window.innerWidth / 2;
  const y = evt.clientY || window.innerHeight / 2;
  const span = document.createElement("span");
  span.className = "float-text";
  span.textContent = text;
  span.style.left = x + "px";
  span.style.top = y + "px";
  document.body.appendChild(span);
  setTimeout(() => span.remove(), 900);
}

/* --- Arayüz oluşturma -------------------------------------------------- */

function buildShops() {
  el.generators.innerHTML = "";
  GENERATORS.forEach((gen) => {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.dataset.gen = gen.id;
    btn.addEventListener("click", () => buyGenerator(gen));
    el.generators.appendChild(btn);
  });

  el.upgrades.innerHTML = "";
  UPGRADES.forEach((up) => {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.dataset.upgrade = up.id;
    btn.addEventListener("click", () => buyUpgrade(up));
    el.upgrades.appendChild(btn);
  });
  renderShops();
}

function renderShops() {
  GENERATORS.forEach((gen) => {
    const btn = el.generators.querySelector(`[data-gen="${gen.id}"]`);
    if (!btn) return;
    const { n, cost } = purchasePlan(gen);
    const affordable = n >= 1 && state.population >= cost;
    btn.disabled = !affordable;
    const amountTag = buyAmount === "max" ? `(${n})` : `×${buyAmount}`;
    btn.innerHTML = `
      <span class="card-icon">${gen.icon}</span>
      <span class="card-body">
        <span class="card-title">${gen.name} <span class="card-buy-tag">${amountTag}</span></span>
        <span class="card-desc">${gen.desc} · +${fmt(generatorRate(gen) || gen.baseRate)}/sn</span>
      </span>
      <span class="card-meta">
        <span class="card-cost ${affordable ? "affordable" : ""}">${fmt(cost)}</span>
        <span class="card-count">sahip: ${state.owned[gen.id]}</span>
      </span>`;
  });

  UPGRADES.forEach((up) => {
    const btn = el.upgrades.querySelector(`[data-upgrade="${up.id}"]`);
    if (!btn) return;
    const bought = !!state.upgrades[up.id];
    const affordable = state.population >= up.cost;
    btn.disabled = bought || !affordable;
    btn.innerHTML = `
      <span class="card-icon">${up.icon}</span>
      <span class="card-body">
        <span class="card-title">${up.name}</span>
        <span class="card-desc">${up.desc}</span>
      </span>
      <span class="card-meta">
        <span class="card-cost ${bought ? "" : affordable ? "affordable" : ""}">${bought ? "✓ Alındı" : fmt(up.cost)}</span>
      </span>`;
  });
}

function renderResource() {
  el.population.textContent = fmt(state.population);
  el.perSecond.textContent = "+" + fmt(totalPerSecond()) + " / sn";
  el.clickPower.textContent = fmt(clickPower());
  // Mağaza butonlarının erişilebilirlik durumunu güncelle (ucuz işlem)
  refreshAffordability();
}

// Sadece disabled/affordable durumunu günceller; innerHTML'i yeniden yazmaz.
function refreshAffordability() {
  GENERATORS.forEach((gen) => {
    const btn = el.generators.querySelector(`[data-gen="${gen.id}"]`);
    if (!btn) return;
    const { n, cost } = purchasePlan(gen);
    const affordable = n >= 1 && state.population >= cost;
    btn.disabled = !affordable;
    const costEl = btn.querySelector(".card-cost");
    if (costEl) {
      costEl.textContent = fmt(cost);
      costEl.classList.toggle("affordable", affordable);
    }
    // MAKS modunda adet sürekli değişir; etiketi de güncelle
    if (buyAmount === "max") {
      const tagEl = btn.querySelector(".card-buy-tag");
      if (tagEl) tagEl.textContent = `(${n})`;
    }
  });
  UPGRADES.forEach((up) => {
    const btn = el.upgrades.querySelector(`[data-upgrade="${up.id}"]`);
    if (!btn || state.upgrades[up.id]) return;
    const affordable = state.population >= up.cost;
    btn.disabled = !affordable;
    const costEl = btn.querySelector(".card-cost");
    if (costEl) costEl.classList.toggle("affordable", affordable);
  });
}

/* --- Oyun döngüsü ------------------------------------------------------ */

let lastTick = Date.now();

function gameLoop() {
  const now = Date.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  const gain = totalPerSecond() * dt;
  if (gain > 0) {
    state.population += gain;
    state.totalEarned += gain;
  }
  renderResource();
}

/* --- Kaydetme / yükleme ----------------------------------------------- */

function save(showMessage) {
  state.lastSeen = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    if (showMessage) showToast("💾 Kaydedildi");
  } catch (e) {
    if (showMessage) showToast("⚠️ Kaydedilemedi");
  }
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    state = Object.assign(newState(), data);
    // Eksik üretici alanlarını tamamla (versiyon güncellemelerine karşı)
    GENERATORS.forEach((g) => {
      if (typeof state.owned[g.id] !== "number") state.owned[g.id] = 0;
    });
    return true;
  } catch (e) {
    return false;
  }
}

function applyOfflineProgress() {
  const now = Date.now();
  const elapsed = (now - (state.lastSeen || now)) / 1000;
  if (elapsed < 10) return; // 10 sn altını yok say
  const rate = totalPerSecond();
  const gain = rate * elapsed;
  if (gain <= 0) return;
  state.population += gain;
  state.totalEarned += gain;
  showOfflineModal(gain, elapsed);
}

function showOfflineModal(gain, seconds) {
  document.getElementById("offlineAmount").textContent = fmt(gain);
  document.getElementById("offlineTime").textContent =
    "Geçen süre: " + formatDuration(seconds);
  document.getElementById("offlineModal").classList.remove("hidden");
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (h) parts.push(h + "sa");
  if (m) parts.push(m + "dk");
  if (s || !parts.length) parts.push(s + "sn");
  return parts.join(" ");
}

function hardReset() {
  if (!confirm("Tüm ilerlemen silinecek. Emin misin?")) return;
  localStorage.removeItem(SAVE_KEY);
  state = newState();
  renderShops();
  renderResource();
  showToast("♻️ Oyun sıfırlandı");
}

/* --- Toast ------------------------------------------------------------- */

let toastTimer = null;
function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add("hidden"), 1800);
}

/* --- Sekmeler ---------------------------------------------------------- */

function setupTabs() {
  const buyBar = document.getElementById("buyAmountBar");
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
      // Toplu alım çubuğu yalnızca Üreticiler sekmesinde anlamlı
      buyBar.classList.toggle("hidden", tab.dataset.tab !== "generators");
    });
  });
}

function setupBuyAmount() {
  document.querySelectorAll(".buy-amount").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".buy-amount").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const v = btn.dataset.amount;
      buyAmount = v === "max" ? "max" : parseInt(v, 10);
      renderShops();
    });
  });
}

/* --- Başlat ------------------------------------------------------------ */

function init() {
  const loaded = load();
  buildShops();
  setupTabs();
  setupBuyAmount();

  if (loaded) applyOfflineProgress();
  renderResource();

  el.clickButton.addEventListener("click", handleClick);
  document.getElementById("saveButton").addEventListener("click", () => save(true));
  document.getElementById("resetButton").addEventListener("click", hardReset);
  document.getElementById("offlineClose").addEventListener("click", () => {
    document.getElementById("offlineModal").classList.add("hidden");
    renderResource();
  });

  lastTick = Date.now();
  setInterval(gameLoop, TICK_MS);
  setInterval(() => save(false), 15000); // 15 sn'de bir otomatik kayıt
  window.addEventListener("beforeunload", () => save(false));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) save(false);
  });
}

document.addEventListener("DOMContentLoaded", init);
