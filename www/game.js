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
  { id: "robot",     icon: "🦾",   name: "Robot Ordusu",  desc: "Yorulmadan üretir",            baseCost: 5.0e9,   costGrowth: 1.15, baseRate: 260000 },
  { id: "rocket",    icon: "🚀",   name: "Uzay Filosu",   desc: "Yıldızlara açılır",            baseCost: 7.5e10,  costGrowth: 1.15, baseRate: 1.6e6 },
  { id: "colony",    icon: "🪐",   name: "Gezegen Kolonisi", desc: "Yeni dünyalar kurar",       baseCost: 1.0e12,  costGrowth: 1.15, baseRate: 9.0e6 },
  { id: "dyson",     icon: "🌌",   name: "Dyson Küresi",  desc: "Bir yıldızın gücünü toplar",   baseCost: 1.5e13,  costGrowth: 1.15, baseRate: 5.5e7 },
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
  { id: "u_ai",      icon: "🧠", name: "Sinir Ağı",         desc: "Yapay Zekâ üretimi x3",      cost: 5e10,    type: "gen", targetId: "ai", mult: 3 },
  { id: "u_all_4",   icon: "🛰️", name: "Uzay Çağı",         desc: "Tüm pasif üretim x3",        cost: 1e12,    type: "all", mult: 3 },
  { id: "u_robot",   icon: "🔧", name: "Otomasyon",         desc: "Robot Ordusu üretimi x3",    cost: 5e12,    type: "gen", targetId: "robot", mult: 3 },
  { id: "u_click_4", icon: "✨", name: "Kuantum Dokunuş",   desc: "Dokunuş gücü x4",            cost: 5e13,    type: "click", mult: 4 },
  { id: "u_all_5",   icon: "🌟", name: "Tip-1 Medeniyet",   desc: "Tüm pasif üretim x4",        cost: 5e14,    type: "all", mult: 4 },
];

// Başarımlar: koşul sağlanınca kalıcı açılır, her biri +%1 üretim verir.
// check(s) -> boolean; s = oyun durumu
const ACHIEVEMENTS = [
  { id: "a_first_click", icon: "👆", name: "İlk Adım", desc: "İlk dokunuşunu yap", check: (s) => s.clicks >= 1 },
  { id: "a_100_clicks", icon: "✋", name: "Çalışkan", desc: "100 kez dokun", check: (s) => s.clicks >= 100 },
  { id: "a_1000_clicks", icon: "🙌", name: "Yorulmaz", desc: "1.000 kez dokun", check: (s) => s.clicks >= 1000 },
  { id: "a_pop_1k", icon: "🏘️", name: "Topluluk", desc: "1.000 puana ulaş", check: (s) => s.population >= 1e3 },
  { id: "a_pop_1m", icon: "🏙️", name: "Şehir", desc: "1M puana ulaş", check: (s) => s.population >= 1e6 },
  { id: "a_earn_1b", icon: "🌍", name: "Medeniyet", desc: "Toplam 1B kazan", check: (s) => s.totalEarned >= 1e9 },
  { id: "a_first_gen", icon: "🤝", name: "İlk Yardımcı", desc: "Bir üretici al", check: (s) => totalOwned(s) >= 1 },
  { id: "a_gen_50", icon: "👥", name: "Kalabalık", desc: "Toplam 50 üretici sahibi ol", check: (s) => totalOwned(s) >= 50 },
  { id: "a_all_types", icon: "🌈", name: "Çeşitlilik", desc: "Her üretici türünden en az 1 al", check: (s) => GENERATORS.every((g) => s.owned[g.id] >= 1) },
  { id: "a_first_upg", icon: "⬆️", name: "Gelişim", desc: "Bir yükseltme al", check: (s) => Object.keys(s.upgrades).length >= 1 },
  { id: "a_first_prestige", icon: "🧬", name: "Yeniden Doğuş", desc: "İlk kez prestij yap", check: (s) => s.prestiges >= 1 },
  { id: "a_genes_10", icon: "🧪", name: "Evrim", desc: "10 Gen biriktir", check: (s) => s.genes >= 10 },
  { id: "a_pop_1b", icon: "🌐", name: "Küresel Güç", desc: "1B puana ulaş", check: (s) => s.population >= 1e9 },
  { id: "a_pop_1t", icon: "🚀", name: "Yıldızlararası", desc: "1T puana ulaş", check: (s) => s.population >= 1e12 },
  { id: "a_space", icon: "🪐", name: "Uzaya Açılış", desc: "Bir Gezegen Kolonisi kur", check: (s) => s.owned.colony >= 1 },
  { id: "a_dyson", icon: "🌌", name: "Yıldız Avcısı", desc: "Bir Dyson Küresi inşa et", check: (s) => s.owned.dyson >= 1 },
  { id: "a_gen_200", icon: "🏛️", name: "İmparatorluk", desc: "Toplam 200 üretici sahibi ol", check: (s) => totalOwned(s) >= 200 },
  { id: "a_prestige_10", icon: "♾️", name: "Sonsuz Döngü", desc: "10 kez prestij yap", check: (s) => s.prestiges >= 10 },
  { id: "a_genes_100", icon: "🧬", name: "Üstün Tür", desc: "100 Gen biriktir", check: (s) => s.genes >= 100 },
  { id: "a_all_upgrades", icon: "🏆", name: "Mükemmeliyet", desc: "Tüm yükseltmeleri al", check: (s) => UPGRADES.every((u) => s.upgrades[u.id]) },
];

function totalOwned(s) {
  return GENERATORS.reduce((sum, g) => sum + (s.owned[g.id] || 0), 0);
}

function unlockedCount() {
  return Object.keys(state.unlocked).length;
}

/* --- Çağlar (evrim sistemi) -------------------------------------------
   İnsanlığın yolculuğu: toplam kazanç (totalEarned) kilometre taşlarını
   geçtikçe yeni bir çağa girilir. Her çağ kalıcı bir üretim çarpanı verir
   (prestijde sıfırlanmaz), tıklanan avatarı ve arka plan tonunu değiştirir.
   - threshold: bu çağa girmek için gereken toplam kazanç
   - mult: bu çağın eklediği kalıcı çarpan (çağ 0 = başlangıç, 1)
   - icon: hem tıklama butonundaki avatar hem göstergedeki simge
   - bg2: arka plan radyal degradesinin üst tonu (koyu kalır) */
const ERAS = [
  { id: "stone",      name: "Taş Devri",        icon: "🧍",     threshold: 0,    mult: 1,    bg2: "#2a1a4f", story: "İnsanlık ateşi keşfetti. Uzun yolculuk başlıyor." },
  { id: "hunter",     name: "Avcılık Çağı",     icon: "🏃",     threshold: 1e3,  mult: 1.6,  bg2: "#2e2218", story: "Sürülerin peşinde, mızrak elde — ilk avcı-toplayıcılar." },
  { id: "agri",       name: "Tarım Devrimi",    icon: "🧑‍🌾",   threshold: 1e5,  mult: 1.7,  bg2: "#1f3a24", story: "Tohum toprakla buluştu; ilk köyler kuruldu." },
  { id: "antiquity",  name: "Antik Çağ",        icon: "🧑‍🎓",   threshold: 1e7,  mult: 1.8,  bg2: "#3a3320", story: "Şehirler, yazı ve filozoflar doğdu." },
  { id: "medieval",   name: "Orta Çağ",         icon: "💂",     threshold: 1e9,  mult: 1.9,  bg2: "#2a1f3a", story: "Şatolar yükseldi, loncalar ve krallıklar kuruldu." },
  { id: "renaissance",name: "Rönesans",         icon: "🧑‍🎨",   threshold: 1e11, mult: 2.0,  bg2: "#3a2030", story: "Sanat ve bilim yeniden doğdu." },
  { id: "industrial", name: "Sanayi Devrimi",   icon: "🧑‍🏭",   threshold: 1e13, mult: 2.2,  bg2: "#2b2b30", story: "Buhar ve çelik dünyayı dönüştürdü." },
  { id: "info",       name: "Bilgi Çağı",       icon: "🧑‍💻",   threshold: 1e15, mult: 2.4,  bg2: "#15303a", story: "Bilgi ışık hızında akıyor; dünya birbirine bağlandı." },
  { id: "space",      name: "Uzay Çağı",        icon: "🧑‍🚀",   threshold: 1e18, mult: 2.6,  bg2: "#1a1f3a", story: "İnsanlık yıldızlara açıldı." },
  { id: "galactic",   name: "Galaktik Çağ",     icon: "🦾",     threshold: 1e21, mult: 3.0,  bg2: "#2a1040", story: "Galaksi artık eviniz. Tür sınırı aştı." },
];

// state.era'yı geçerli aralığa sabitler (bozuk/eski kayıtlara karşı).
function sanitizeEra() {
  if (typeof state.era !== "number" || state.era < 0 || isNaN(state.era)) state.era = 0;
  if (state.era >= ERAS.length) state.era = ERAS.length - 1;
}

// totalEarned'a göre ulaşılabilecek en yüksek çağ indeksi.
function highestEraIndex(totalEarned) {
  let idx = 0;
  for (let i = 0; i < ERAS.length; i++) {
    if (totalEarned >= ERAS[i].threshold) idx = i;
  }
  return idx;
}

// Ulaşılan tüm çağların kalıcı çarpanı (çarpımları).
function eraMultiplier() {
  let m = 1;
  for (let i = 0; i <= state.era && i < ERAS.length; i++) m *= ERAS[i].mult;
  return m;
}

/* --- Oyun durumu ------------------------------------------------------ */

function newState() {
  const owned = {};
  GENERATORS.forEach((g) => (owned[g.id] = 0));
  return {
    population: 0,
    totalEarned: 0, // tüm zamanların kazancı (prestijde sıfırlanmaz)
    runEarned: 0, // bu turun kazancı (prestijde sıfırlanır)
    clicks: 0,
    genes: 0, // kalıcı prestij puanı
    prestiges: 0, // kaç kez prestij yapıldı
    era: 0, // ulaşılan en yüksek çağ indeksi (prestijde sıfırlanmaz)
    owned,
    upgrades: {}, // id -> true
    unlocked: {}, // açılan başarımlar: id -> true
    soundOn: true, // ses efektleri (SFX)
    musicOn: true, // arka plan müziği
    lastSeen: Date.now(),
  };
}

let state = newState();

// Toplu alım miktarı: 1, 10, 100 veya "max" (kaydedilmez, UI tercihi)
let buyAmount = 1;

// 3D avatar (Three.js) devreye girdiyse true; değilse SVG avatar kullanılır.
let avatar3dActive = false;

/* --- Kombo sistemi (UI tercihi, kaydedilmez) --------------------------
   Hızlı ardışık tıklamalar komboyu büyütür; kombo dokunuş gücünü çarpar.
   Tıklama arası COMBO_WINDOW'u aşarsa kombo sıfırlanır. */

const COMBO_WINDOW = 1500; // ms — bu süre içinde tıklamazsan kombo düşer
const COMBO_MAX = 50; // kombo tavanı (tıklama sayısı)
const COMBO_BONUS_AT_MAX = 1.0; // max komboda +%100 dokunuş gücü

let comboCount = 0;
let comboLast = 0;
let comboDecayTimer = null;

// 0..1 arası kombo yoğunluğu (ses ve efekt şiddeti için).
function comboIntensity() {
  return Math.min(1, comboCount / COMBO_MAX);
}

// Kombodan gelen dokunuş çarpanı (1.0 .. 1+COMBO_BONUS_AT_MAX).
function comboMultiplier() {
  return 1 + comboIntensity() * COMBO_BONUS_AT_MAX;
}

function registerComboHit() {
  const now = Date.now();
  if (now - comboLast > COMBO_WINDOW) comboCount = 0;
  comboLast = now;
  comboCount = Math.min(COMBO_MAX, comboCount + 1);
  renderCombo();
  clearTimeout(comboDecayTimer);
  comboDecayTimer = setTimeout(resetCombo, COMBO_WINDOW);
}

function resetCombo() {
  comboCount = 0;
  renderCombo();
}

function renderCombo() {
  const bar = document.getElementById("comboBar");
  if (!bar) return;
  if (comboCount <= 1) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  const mult = comboMultiplier();
  document.getElementById("comboValue").textContent =
    "x" + mult.toFixed(2).replace(/\.00$/, "");
  const fill = document.getElementById("comboMeterFill");
  if (fill) fill.style.width = Math.round(comboIntensity() * 100) + "%";
}

/* --- Prestij sabitleri ------------------------------------------------ */

const GENES_THRESHOLD = 1e6; // ilk gen için gereken tur kazancı
const GENE_BONUS = 0.1; // her gen tüm üretime +%10

// Gen puanlarından gelen çarpan.
function geneMultiplier() {
  return 1 + state.genes * GENE_BONUS;
}

// Açılan her başarım tüm üretime +%1 katar.
const ACH_BONUS = 0.01;
function achievementMultiplier() {
  return 1 + unlockedCount() * ACH_BONUS;
}

// Üretime ve dokunuşa uygulanan toplam küresel çarpan.
function globalMultiplier() {
  return geneMultiplier() * achievementMultiplier() * eraMultiplier();
}

// Şu an prestij yapılırsa kazanılacak gen sayısı.
function prestigeGain() {
  return Math.floor(Math.sqrt(state.runEarned / GENES_THRESHOLD));
}

/* --- Hesaplamalar ----------------------------------------------------- */

// Kombo dahil olmayan "temel" dokunuş gücü (UI'da gösterilen değer).
function baseClickPower() {
  let power = 1;
  UPGRADES.forEach((u) => {
    if (u.type === "click" && state.upgrades[u.id]) power *= u.mult;
  });
  return power * globalMultiplier();
}

// Bir dokunuşun gerçek kazancı: temel güç × anlık kombo çarpanı.
function clickPower() {
  return baseClickPower() * comboMultiplier();
}

function generatorRate(gen) {
  let rate = gen.baseRate * state.owned[gen.id];
  UPGRADES.forEach((u) => {
    if (!state.upgrades[u.id]) return;
    if (u.type === "all") rate *= u.mult;
    if (u.type === "gen" && u.targetId === gen.id) rate *= u.mult;
  });
  return rate * globalMultiplier();
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

/* --- Ses köprüsü ------------------------------------------------------
   Gerçek ses sentezi audio.js içindeki Audio modülünde. Buradaki ince
   sarmalayıcılar yalnızca "ses açık mı?" kontrolünü ve geriye dönük
   uyumluluğu sağlar. */

function ensureAudio() {
  if (window.SFX) SFX.ensure();
}

function playClick() {
  if (state.soundOn && window.SFX) SFX.click(comboIntensity());
}

function playBuy() {
  if (state.soundOn && window.SFX) SFX.buy();
}

function playAchievement() {
  if (state.soundOn && window.SFX) SFX.achievement();
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
  playBuy();
  renderShops();
  renderResource();
}

function doPrestige() {
  const gain = prestigeGain();
  if (gain < 1) {
    showToast("Henüz yeterli ilerleme yok");
    return;
  }
  if (
    !confirm(
      `Yeniden doğacaksın!\n\n+${fmt(gain)} Gen kazanacaksın (kalıcı +%${gain * GENE_BONUS * 100} üretim).\n\nPuanların, üreticilerin ve yükseltmelerin sıfırlanacak. Genlerin kalır.\n\nEmin misin?`
    )
  )
    return;

  const keptGenes = state.genes + gain;
  const keptTotal = state.totalEarned;
  const keptPrestiges = state.prestiges + 1;
  const keptUnlocked = state.unlocked;
  const keptClicks = state.clicks;
  const keptSound = state.soundOn;
  const keptMusic = state.musicOn;
  const keptEra = state.era; // çağlar kalıcı yolculuk — prestijde korunur
  state = newState();
  state.genes = keptGenes;
  state.totalEarned = keptTotal;
  state.prestiges = keptPrestiges;
  state.unlocked = keptUnlocked;
  state.clicks = keptClicks;
  state.soundOn = keptSound;
  state.musicOn = keptMusic;
  state.era = keptEra;

  renderShops();
  renderResource();
  renderPrestige();
  save(false);
  showToast(`🧬 Yeniden doğdun! +${fmt(gain)} Gen`);
  if (state.soundOn && window.SFX) SFX.prestige();
  if (window.Effects) {
    Effects.confetti({ count: 140 });
    Effects.screenShake(10);
  }
}

function buyUpgrade(up) {
  if (state.upgrades[up.id] || state.population < up.cost) return;
  state.population -= up.cost;
  state.upgrades[up.id] = true;
  if (state.soundOn && window.SFX) SFX.upgrade();
  showToast(`${up.icon} ${up.name} alındı!`);
  if (window.Effects) Effects.confetti({ count: 30 });
  renderShops();
  renderResource();
}

// Açılmamış başarımları kontrol et, yenileri açıldıysa bildir.
function checkAchievements() {
  let changed = false;
  ACHIEVEMENTS.forEach((a) => {
    if (!state.unlocked[a.id] && a.check(state)) {
      state.unlocked[a.id] = true;
      changed = true;
      playAchievement();
      showToast(`🏆 Başarım: ${a.name}`);
      if (window.Effects) {
        Effects.confetti({ count: 60 });
        Effects.screenShake(4);
      }
    }
  });
  if (changed) renderAchievements();
}

/* --- Tıklama ----------------------------------------------------------- */

function handleClick(evt) {
  ensureAudio();
  registerComboHit();
  const gain = clickPower();
  state.population += gain;
  state.totalEarned += gain;
  state.runEarned += gain;
  state.clicks++;
  playClick();

  // Tıklama konumu (fare ya da dokunma)
  const x = evt.clientX || (evt.touches && evt.touches[0] && evt.touches[0].clientX) ||
    window.innerWidth / 2;
  const y = evt.clientY || (evt.touches && evt.touches[0] && evt.touches[0].clientY) ||
    window.innerHeight / 2;

  spawnFloatText(x, y, "+" + fmt(gain));
  triggerClickFx(x, y);
  renderResource();
}

// Görsel geri bildirim: buton zıplaması, halka dalgası, parçacık patlaması.
function triggerClickFx(x, y) {
  const intensity = comboIntensity();

  // 3D avatar etkinse zıplat (squash & stretch)
  if (avatar3dActive && window.Avatar3D) window.Avatar3D.bounce();

  // Parçacık patlaması (kombo arttıkça daha güçlü ve renkli)
  if (window.Effects) {
    Effects.burst(x, y, {
      count: 8 + Math.round(intensity * 10),
      power: 1 + intensity,
    });
    if (intensity >= 0.99) Effects.screenShake(5); // max komboda hafif sarsıntı
  }

  // Tıklama butonuna kısa "pop" animasyonu
  const btn = el.clickButton;
  if (btn) {
    btn.classList.remove("pop");
    void btn.offsetWidth; // reflow ile animasyonu yeniden başlat
    btn.classList.add("pop");
  }

  // Halka dalgası
  const ring = document.getElementById("clickRing");
  if (ring) {
    ring.classList.remove("animate");
    void ring.offsetWidth;
    ring.classList.add("animate");
  }
}

function spawnFloatText(x, y, text) {
  const span = document.createElement("span");
  span.className = "float-text";
  if (comboIntensity() > 0.6) span.classList.add("float-hot");
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

function renderPrestige() {
  const gain = prestigeGain();
  document.getElementById("geneCount").textContent = fmt(state.genes);
  document.getElementById("geneBonus").textContent =
    "+%" + Math.round(state.genes * GENE_BONUS * 100);
  document.getElementById("prestigeGain").textContent = fmt(gain);
  document.getElementById("prestigeCount").textContent = fmt(state.prestiges);

  const hint = document.getElementById("prestigeHint");
  const btn = document.getElementById("prestigeButton");
  if (gain < 1) {
    const need = fmt(GENES_THRESHOLD);
    hint.textContent = `İlk Gen için bu turda ${need} İnsanlık Puanı kazanman gerek.`;
    btn.disabled = true;
  } else {
    hint.textContent = `Yeni bonus: +%${Math.round((state.genes + gain) * GENE_BONUS * 100)} üretim`;
    btn.disabled = false;
  }
}

function renderAchievements() {
  const list = document.getElementById("achList");
  if (!list) return;
  document.getElementById("achCount").textContent = unlockedCount();
  document.getElementById("achTotal").textContent = ACHIEVEMENTS.length;
  document.getElementById("achBonus").textContent =
    "+%" + unlockedCount() * Math.round(ACH_BONUS * 100);
  list.innerHTML = "";
  ACHIEVEMENTS.forEach((a) => {
    const unlocked = !!state.unlocked[a.id];
    const row = document.createElement("div");
    row.className = "ach-card" + (unlocked ? " unlocked" : " locked");
    row.innerHTML = `
      <span class="card-icon">${unlocked ? a.icon : "🔒"}</span>
      <span class="card-body">
        <span class="card-title">${a.name}</span>
        <span class="card-desc">${a.desc}</span>
      </span>`;
    list.appendChild(row);
  });
}

/* --- Çağ arayüzü ------------------------------------------------------ */

// Bir çağın görseli: özel SVG figürü (yoksa emoji yedeği).
function eraArt(i) {
  const era = ERAS[i];
  if (window.ERA_ART && window.ERA_ART[era.id]) return window.ERA_ART[era.id];
  return era.icon; // güvenli yedek
}

// Tıklanan avatarı mevcut çağa göre günceller.
// 3D avatar etkinse onu güncelle; değilse SVG figürünü göster.
function updateAvatar() {
  if (avatar3dActive && window.Avatar3D) {
    window.Avatar3D.setEra(state.era);
    return;
  }
  const emoji = document.getElementById("clickEmoji");
  if (emoji) emoji.innerHTML = eraArt(state.era);
}

// Arka plan tonunu çağa göre yumuşakça değiştirir.
function applyEraTheme() {
  const bg2 = ERAS[state.era].bg2;
  if (bg2) document.documentElement.style.setProperty("--bg-2", bg2);
}

// Çağ göstergesini (ad, simge, sonraki çağa ilerleme) günceller.
function renderEra() {
  const era = ERAS[state.era];
  const nameEl = document.getElementById("eraName");
  const iconEl = document.getElementById("eraIcon");
  if (nameEl) nameEl.textContent = era.name;
  if (iconEl) iconEl.innerHTML = eraArt(state.era);

  const next = ERAS[state.era + 1];
  const nextEl = document.getElementById("eraNext");
  const fill = document.getElementById("eraMeterFill");
  if (next) {
    // Bu çağın başlangıcı ile sonraki çağ eşiği arasındaki ilerleme (log ölçek).
    const lo = era.threshold > 0 ? Math.log10(era.threshold) : 0;
    const hi = Math.log10(next.threshold);
    const cur = state.totalEarned > 0 ? Math.log10(state.totalEarned) : 0;
    const pct = Math.max(0, Math.min(1, (cur - lo) / (hi - lo)));
    if (nextEl) nextEl.textContent = "sonraki: " + next.name + " %" + Math.floor(pct * 100);
    if (fill) fill.style.width = Math.round(pct * 100) + "%";
  } else {
    if (nextEl) nextEl.textContent = "son çağ — zirvedesin";
    if (fill) fill.style.width = "100%";
  }
}

// totalEarned yeni çağ(lar)ı açtıysa ilerlet ve kutla.
function checkEra() {
  const target = highestEraIndex(state.totalEarned);
  if (target <= state.era) return;
  state.era = target; // birden fazla çağ atlanırsa en yükseğe sıçra
  updateAvatar();
  applyEraTheme();
  renderEra();
  showEraPopup(target);
  if (state.soundOn && window.SFX) SFX.prestige();
  if (window.Effects) {
    Effects.confetti({ count: 120 });
    Effects.screenShake(8);
  }
}

function showEraPopup(idx) {
  const era = ERAS[idx];
  document.getElementById("eraModalIcon").innerHTML = eraArt(idx);
  document.getElementById("eraModalName").textContent = era.name;
  document.getElementById("eraModalStory").textContent = era.story;
  document.getElementById("eraModalBonus").textContent =
    Math.round((era.mult - 1) * 100);
  document.getElementById("eraModal").classList.remove("hidden");
}

function openEras() {
  document.getElementById("erasReached").textContent = state.era + 1;
  document.getElementById("erasTotal").textContent = ERAS.length;
  document.getElementById("erasBonus").textContent =
    "+%" + Math.round((eraMultiplier() - 1) * 100);
  const list = document.getElementById("erasList");
  list.innerHTML = "";
  ERAS.forEach((era, i) => {
    const reached = i <= state.era;
    const current = i === state.era;
    const row = document.createElement("div");
    row.className = "era-row" + (reached ? " reached" : " locked") + (current ? " current" : "");
    const bonus = i === 0 ? "başlangıç" : "+%" + Math.round((era.mult - 1) * 100) + " üretim";
    row.innerHTML = `
      <span class="era-row-icon">${reached ? eraArt(i) : "🔒"}</span>
      <span class="era-row-body">
        <span class="era-row-name">${era.name}${current ? ' <span class="era-row-tag">şu an</span>' : ""}</span>
        <span class="era-row-desc">${reached ? era.story : "Aç: " + fmt(era.threshold) + " toplam kazanç"}</span>
      </span>
      <span class="era-row-bonus">${bonus}</span>`;
    list.appendChild(row);
  });
  document.getElementById("erasModal").classList.remove("hidden");
}

function updateSoundButton() {
  // Üst bardaki hızlı sessize-al ikonu (ses efektleri ana anahtarı).
  const btn = document.getElementById("soundButton");
  if (btn) {
    btn.textContent = state.soundOn ? "🔊" : "🔇";
    btn.setAttribute("aria-label", state.soundOn ? "Sesi kapat" : "Sesi aç");
    btn.classList.toggle("muted", !state.soundOn);
  }
}

// Ses tercihlerini (efekt + müzik) ses motoruna ve arayüze uygular.
function applyAudioPrefs() {
  if (window.SFX) {
    SFX.setEnabled(state.soundOn);
    if (state.soundOn && state.musicOn) {
      ensureAudio();
      SFX.startMusic();
    } else {
      SFX.stopMusic();
    }
  }
  updateSoundButton();
  renderSettings();
}

// Ayarlar penceresindeki anahtarların görünümünü güncelle.
function renderSettings() {
  const sfx = document.getElementById("sfxToggle");
  const music = document.getElementById("musicToggle");
  if (sfx) {
    sfx.classList.toggle("on", state.soundOn);
    sfx.setAttribute("aria-checked", String(state.soundOn));
  }
  if (music) {
    // Müzik yalnızca ses açıkken anlamlı; ses kapalıyken anahtarı sönükleştir.
    music.classList.toggle("on", state.soundOn && state.musicOn);
    music.setAttribute("aria-checked", String(state.soundOn && state.musicOn));
    music.disabled = !state.soundOn;
  }
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  applyAudioPrefs();
  if (state.soundOn) playBuy();
  save(false);
}

function toggleMusic() {
  if (!state.soundOn) {
    // Ses kapalıyken müzik açılamaz; kullanıcıyı yönlendir.
    showToast("Önce ses efektlerini aç");
    return;
  }
  state.musicOn = !state.musicOn;
  applyAudioPrefs();
  save(false);
}

/* --- Hesap & bulut kayıt arayüzü -------------------------------------- */

// Mevcut tüm kaydı tek bir metne (yedek kodu) dönüştürür.
function currentSaveString() {
  state.lastSeen = Date.now();
  return JSON.stringify(state);
}

// Bir yedek kaydı/metni uygula (geri yükleme).
function applySaveString(saveString) {
  const data = JSON.parse(saveString);
  if (!data || typeof data !== "object") throw new Error("geçersiz veri");
  state = Object.assign(newState(), data);
  GENERATORS.forEach((g) => {
    if (typeof state.owned[g.id] !== "number") state.owned[g.id] = 0;
  });
  sanitizeEra();
  save(false);
  renderShops();
  updateAvatar();
  applyEraTheme();
  renderResource();
  renderAchievements();
  applyAudioPrefs();
}

function openAccountModal() {
  // Yedek kodunu hazırla
  const codeArea = document.getElementById("saveCodeArea");
  if (codeArea) codeArea.value = Cloud.encodeCode(currentSaveString());

  // Play Games bölümü yalnızca eklenti varsa görünür
  const playSection = document.getElementById("playSection");
  if (playSection) {
    playSection.classList.toggle("hidden", !Cloud.isPlayAvailable());
  }
  refreshAccountStatus();
  document.getElementById("accountModal").classList.remove("hidden");
}

function refreshAccountStatus() {
  const status = document.getElementById("accountStatus");
  const user = Cloud.currentUser();
  const syncBtn = document.getElementById("playSyncButton");
  const outBtn = document.getElementById("playSignOutButton");
  const inBtn = document.getElementById("playSignInButton");
  if (user) {
    if (status) status.textContent = `Giriş yapıldı: ${user} · Bulut kayıt etkin.`;
    syncBtn && syncBtn.classList.remove("hidden");
    outBtn && outBtn.classList.remove("hidden");
    inBtn && inBtn.classList.add("hidden");
  } else {
    if (status) {
      status.textContent = Cloud.isPlayAvailable()
        ? "Google Play ile giriş yaparak ilerlemeni buluta yedekleyebilirsin."
        : "Yerel kayıt kullanılıyor. İlerlemeni taşımak için yedek kodunu kullan.";
    }
    syncBtn && syncBtn.classList.add("hidden");
    outBtn && outBtn.classList.add("hidden");
    inBtn && inBtn.classList.remove("hidden");
  }
}

async function handlePlaySignIn() {
  showToast("⏳ Giriş yapılıyor…");
  const res = await Cloud.signIn();
  if (res.ok) {
    showToast(`✅ Hoş geldin, ${res.name}`);
    refreshAccountStatus();
  } else if (res.reason === "unavailable") {
    showToast("Play Games bu sürümde kullanılamıyor");
  } else {
    showToast("Giriş iptal edildi");
  }
}

async function handlePlaySignOut() {
  await Cloud.signOut();
  refreshAccountStatus();
  showToast("Çıkış yapıldı");
}

// Buluta yedekle, sonra buluttaki daha güçlü kaydı geri getirmeyi öner.
async function handlePlaySync() {
  showToast("☁️ Bulutla eşitleniyor…");
  const up = await Cloud.uploadToPlay(currentSaveString());
  if (!up.ok) {
    showToast("Buluta yazılamadı");
    return;
  }
  showToast("✅ Bulut kaydı güncellendi");
}

function copySaveCode() {
  const codeArea = document.getElementById("saveCodeArea");
  if (!codeArea) return;
  codeArea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (e) {
    ok = false;
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(codeArea.value).then(
      () => showToast("📋 Kod kopyalandı"),
      () => showToast(ok ? "📋 Kod kopyalandı" : "Kopyalanamadı, elle seç")
    );
  } else {
    showToast(ok ? "📋 Kod kopyalandı" : "Kopyalanamadı, elle seç");
  }
}

function restoreSaveCode() {
  const codeArea = document.getElementById("saveCodeArea");
  if (!codeArea) return;
  const code = prompt("Yedek kodunu yapıştır:");
  if (!code) return;
  try {
    const saveString = Cloud.decodeCode(code);
    if (!confirm("Mevcut ilerlemenin üzerine bu kayıt yazılacak. Devam edilsin mi?")) {
      return;
    }
    applySaveString(saveString);
    showToast("📥 İlerleme geri yüklendi");
    codeArea.value = Cloud.encodeCode(currentSaveString());
  } catch (e) {
    showToast("⚠️ Geçersiz kod");
  }
}

function renderResource() {
  el.population.textContent = fmt(state.population);
  el.perSecond.textContent = "+" + fmt(totalPerSecond()) + " / sn";
  // Gösterilen dokunuş gücü kombosuz "temel" değerdir; kombo ayrı gösterilir.
  el.clickPower.textContent = fmt(baseClickPower());
  // Mağaza butonlarının erişilebilirlik durumunu güncelle (ucuz işlem)
  refreshAffordability();
  renderPrestige();
  renderEra();
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
    state.runEarned += gain;
  }
  checkEra();
  checkAchievements();
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
    sanitizeEra();
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
  state.runEarned += gain;
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
  updateAvatar();
  applyEraTheme();
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

/* --- Sürüm bilgisi & geçmişi ------------------------------------------ */

// version.js yoksa (beklenmedik) güvenli varsayılan.
function appVersion() {
  return window.APP_VERSION || { version: "?", build: "dev", date: "", changelog: [] };
}

// Ekranda gösterilecek kısa sürüm metni, örn: "v1.1.0 · abc1234".
function versionLabel() {
  const v = appVersion();
  const build = v.build && v.build !== "dev" ? " · " + v.build : " · dev";
  return "v" + v.version + build;
}

// Sürüm etiketini ve menü/ayarlardaki sürüm satırlarını doldurur.
function renderVersion() {
  const v = appVersion();
  const label = versionLabel();
  const tag = document.getElementById("versionTag");
  if (tag) tag.textContent = label;
  const mv = document.getElementById("menuVersion");
  if (mv) mv.textContent = label + (v.date ? " (" + v.date + ")" : "");
  const sv = document.getElementById("settingsVersion");
  if (sv) sv.textContent = label + (v.date ? " · " + v.date : "");
  const av = document.getElementById("aboutVersion");
  if (av) av.textContent = label + (v.date ? " (" + v.date + ")" : "");
}

// Sürüm geçmişi listesini oluşturur.
function renderChangelog() {
  const v = appVersion();
  const cur = document.getElementById("changelogCurrent");
  if (cur) {
    cur.textContent =
      "Yüklü sürüm: " + versionLabel() + (v.date ? " (" + v.date + ")" : "");
  }
  const list = document.getElementById("changelogList");
  if (!list) return;
  list.innerHTML = "";
  (v.changelog || []).forEach((entry) => {
    const card = document.createElement("div");
    card.className = "changelog-entry";
    const notes = (entry.notes || [])
      .map((n) => `<li>${n}</li>`)
      .join("");
    card.innerHTML = `
      <div class="changelog-head">
        <span class="changelog-ver">v${entry.version}</span>
        <span class="changelog-name">${entry.title || ""}</span>
      </div>
      <ul class="changelog-notes">${notes}</ul>`;
    list.appendChild(card);
  });
}

/* --- Pencere açma/kapama (menü, ayarlar, geçmiş) ---------------------- */

function show(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("hidden");
}
function hide(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("hidden");
}

function openMenu() {
  renderVersion();
  show("mainMenu");
}
function openSettings() {
  renderSettings();
  renderVersion();
  show("settingsModal");
}
function openChangelog() {
  renderChangelog();
  show("changelogModal");
}
function openAbout() {
  renderVersion();
  show("aboutModal");
}

/* --- Başlat ------------------------------------------------------------ */

function init() {
  const loaded = load();

  // Görsel efekt motorunu başlat (arka plan parçacıkları her zaman çalışır)
  if (window.Effects) Effects.init();

  buildShops();
  setupTabs();
  setupBuyAmount();

  // Çağ: yüklemede mevcut çağa sessizce eşitle (popup yok), avatar+temayı uygula.
  // Popup yalnızca oyun sırasında YENİ bir çağ açılınca gösterilir (checkEra).
  state.era = Math.max(state.era || 0, highestEraIndex(state.totalEarned));
  sanitizeEra();
  updateAvatar();
  applyEraTheme();
  // WebGL varsa tıklama avatarını 3D'ye yükselt (Three.js); yoksa SVG'de kal.
  if (window.Avatar3D) {
    avatar3dActive = window.Avatar3D.tryMount(
      document.getElementById("clickButton"),
      state.era
    );
  }

  if (loaded) applyOfflineProgress();
  renderAchievements();
  renderResource();
  renderCombo();
  renderVersion();
  // Ses + müzik tercihlerini uygula (anahtarları da senkronlar)
  applyAudioPrefs();

  el.clickButton.addEventListener("click", handleClick);
  document.getElementById("prestigeButton").addEventListener("click", doPrestige);
  // Üst bardaki hızlı sessize-al ikonu
  document.getElementById("soundButton").addEventListener("click", toggleSound);
  document.getElementById("offlineClose").addEventListener("click", () => {
    document.getElementById("offlineModal").classList.add("hidden");
    renderResource();
  });

  // Ana menü (☰): oyun menüsü — ayarlar + sürüm. Hesap burada DEĞİL (👤'de).
  document.getElementById("menuButton").addEventListener("click", openMenu);
  document.getElementById("menuResume").addEventListener("click", () => hide("mainMenu"));
  document.getElementById("menuSettings").addEventListener("click", () => {
    hide("mainMenu");
    openSettings();
  });
  document.getElementById("menuChangelog").addEventListener("click", openChangelog);
  document.getElementById("menuAbout").addEventListener("click", () => {
    hide("mainMenu");
    openAbout();
  });
  document.getElementById("aboutClose").addEventListener("click", () => hide("aboutModal"));

  // Ayarlar
  document.getElementById("settingsClose").addEventListener("click", () => hide("settingsModal"));
  document.getElementById("sfxToggle").addEventListener("click", toggleSound);
  document.getElementById("musicToggle").addEventListener("click", toggleMusic);
  document.getElementById("settingsSave").addEventListener("click", () => save(true));
  document.getElementById("settingsChangelog").addEventListener("click", openChangelog);
  document.getElementById("settingsReset").addEventListener("click", hardReset);

  // Sürüm geçmişi
  document.getElementById("versionTag").addEventListener("click", openChangelog);
  document.getElementById("changelogClose").addEventListener("click", () => hide("changelogModal"));

  // Çağlar
  document.getElementById("eraIndicator").addEventListener("click", openEras);
  document.getElementById("erasClose").addEventListener("click", () => hide("erasModal"));
  document.getElementById("eraModalClose").addEventListener("click", () => hide("eraModal"));

  // Hesap / bulut kayıt arayüzü
  document.getElementById("accountButton").addEventListener("click", openAccountModal);
  document.getElementById("accountClose").addEventListener("click", () => {
    document.getElementById("accountModal").classList.add("hidden");
  });
  document.getElementById("playSignInButton").addEventListener("click", handlePlaySignIn);
  document.getElementById("playSignOutButton").addEventListener("click", handlePlaySignOut);
  document.getElementById("playSyncButton").addEventListener("click", handlePlaySync);
  document.getElementById("copyCodeButton").addEventListener("click", copySaveCode);
  document.getElementById("restoreCodeButton").addEventListener("click", restoreSaveCode);

  // İlk kullanıcı etkileşiminde sesi/müziği aç (tarayıcı politikası gereği)
  document.body.addEventListener(
    "pointerdown",
    () => {
      ensureAudio();
      if (state.soundOn && state.musicOn && window.SFX) SFX.startMusic();
    },
    { once: true }
  );

  lastTick = Date.now();
  setInterval(gameLoop, TICK_MS);
  setInterval(() => save(false), 15000); // 15 sn'de bir otomatik kayıt
  window.addEventListener("beforeunload", () => save(false));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) save(false);
  });
}

document.addEventListener("DOMContentLoaded", init);
