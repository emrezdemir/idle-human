/* =========================================================
   Idle Human — savaş ve ekipman (combat.js)
   Idle dövüş, boss, can/aşama HUD'u ve ekipman ganimeti tek modülde.
   game.js, Combat.init({...}) ile bu modülü besler (state ve yardımcı
   fonksiyonları geçer). Davranış bağımlılıkları opsiyoneldir: SFX/Effects
   yoksa modül sessizce çalışır.
   ========================================================= */

"use strict";

(() => {
  /* --- Sabitler ---------------------------------------------------- */
  const ENEMY_BASE_HP = 8;
  const ENEMY_HP_GROWTH = 1.45;
  const BOSS_EVERY = 10;
  const BOSS_HP_MULT = 6;
  const BOSS_TIME = 30000; // ms
  const BOSS_BONUS = 0.05; // her yenilen boss kalıcı +%5 üretim
  // Boss süresi dolarsa: hasarın bir kısmı korunur (tam iyileşme yerine).
  const BOSS_TIMEOUT_HEAL = 0.65; // %65 iyileşir, %35 hasar korunur
  const BOSS_REWARD_MULT = 10; // boss öldürünce normalin 10 katı puan

  // Slotlar: silah=tık hasarı, zırh=üretim, yüzük=kritik şansı.
  const SLOTS = [
    { id: "weapon", name: "Silah", icon: "⚔️", stat: "tap",  statLabel: "hasar" },
    { id: "armor",  name: "Zırh",  icon: "🛡️", stat: "prod", statLabel: "üretim" },
    { id: "ring",   name: "Yüzük", icon: "💍", stat: "crit", statLabel: "kritik" },
  ];
  const RARITIES = [
    { id: "common",    name: "Sıradan",  color: "#9aa0aa", mult: 1, weight: 58 },
    { id: "rare",      name: "Nadir",    color: "#4aa3ff", mult: 2, weight: 28 },
    { id: "epic",      name: "Destansı", color: "#b45aff", mult: 4, weight: 11 },
    { id: "legendary", name: "Efsanevi", color: "#ffb33a", mult: 8, weight: 3 },
  ];
  function rarityById(id) { return RARITIES.find((r) => r.id === id) || RARITIES[0]; }
  function slotById(id) { return SLOTS.find((s) => s.id === id) || SLOTS[0]; }

  // Bir ekipman parçasının güç (% bonus) değeri: nadirlik × aşamayla ölçek.
  function piecePower(rarityMult, stage) {
    return Math.round((4 + stage * 0.6) * rarityMult);
  }

  /* --- Bağımlılıklar (game.js'ten enjekte edilir) ------------------ */
  // deps: { getState, clickPower, totalPerSecond, spawnFloatText,
  //        spawnDamageText, enemyCenter, showToast, say, randomFrom }
  let deps = null;
  // deps henüz bağlanmadıysa null döner; okuma fonksiyonları bunu tolere eder.
  // (game.js init sırasında buildShops/globalMultiplier, Combat.init'ten önce
  //  bu modüle dokunabilir — o anda çökmek yerine güvenli varsayılan ver.)
  function S() { return deps ? deps.getState() : null; }

  /* --- Stage / boss yardımcıları ---------------------------------- */
  function isBossStage(s) { return s % BOSS_EVERY === 0; }
  function enemyTier(s) { return Math.floor((s - 1) / BOSS_EVERY); }
  function enemyMaxHp(s) {
    let hp = ENEMY_BASE_HP * Math.pow(ENEMY_HP_GROWTH, s - 1);
    if (isBossStage(s)) hp *= BOSS_HP_MULT;
    return hp;
  }
  function bossMultiplier() { const st = S(); return 1 + ((st && st.bossWins) || 0) * BOSS_BONUS; }

  /* --- Ekipman çarpanları ----------------------------------------- */
  function equipPct(slot) {
    const st = S();
    const p = st && st.equip && st.equip[slot];
    return p ? p.power : 0;
  }
  function equipTapMult() { return 1 + equipPct("weapon") / 100; }
  function equipProdMult() { return 1 + equipPct("armor") / 100; }
  // Kritik şansı: yüzükten azalan getirili — sqrt eğrisi.
  // Eski formül (eşit) tek efsaneviyle %60 tavanı anında doldurmuştu.
  // Yeni: critChance = min(60, floor(sqrt(ringPct * 5))) — kademeli yükselir.
  // Örnek: ring %16 -> %8.94 kritik, ring %40 -> %14.14, ring %180 -> %30, ring %720 -> %60.
  function critChance() {
    const ringPct = equipPct("ring");
    if (ringPct <= 0) return 0;
    return Math.min(60, Math.floor(Math.sqrt(ringPct * 5)));
  }

  /* --- Çalışma zamanı durumu (kaydedilmez) ------------------------ */
  let enemyHp = 0, enemyMax = 0, bossUntil = 0;

  function initEnemy() {
    const st = S();
    enemyMax = enemyMaxHp(st.stage);
    enemyHp = enemyMax;
    const boss = isBossStage(st.stage);
    bossUntil = boss ? Date.now() + BOSS_TIME : 0;
    if (window.Scene2D) {
      window.Scene2D.setEnemy(enemyTier(st.stage), boss);
      renderCombat();
    }
  }

  function renderCombat() {
    if (!window.Scene2D) return;
    const st = S();
    const boss = isBossStage(st.stage);
    window.Scene2D.setHp(enemyMax > 0 ? enemyHp / enemyMax : 0);
    window.Scene2D.setStage(st.stage, boss);
    window.Scene2D.setBossTimer(
      boss && enemyMax > 0 ? Math.max(0, (bossUntil - Date.now()) / 1000) : null
    );
  }

  function hasEnemy() { return enemyMax > 0; }

  // Bir öldürmenin puan ödülü (üretimle orantılı — ekonomiyi bozmaz).
  function killReward() {
    return Math.max(1, deps.clickPower() * 2, deps.totalPerSecond() * 3);
  }

  function dealDamage(dmg) {
    if (dmg <= 0 || enemyMax <= 0) return;
    enemyHp -= dmg;
    if (enemyHp <= 0) killEnemy();
  }

  function killEnemy() {
    const st = S();
    const boss = isBossStage(st.stage);
    enemyMax = 0; // ölüm animasyonu sırasında tekrar tetiklenmesin
    let reward = killReward();
    if (boss) {
      reward *= BOSS_REWARD_MULT;
      st.bossWins = (st.bossWins || 0) + 1;
      deps.showToast("👑 Boss yenildi! Kalıcı +%5 üretim");
      deps.say(deps.randomFrom([
        "Boss düştü! 💪",
        "Bir duvar daha aştık!",
        "Kimse bizi durduramaz!",
      ]), 3000);
      if (window.Effects) {
        window.Effects.confetti({ count: 80 });
        window.Effects.screenShake(8);
      }
      if (st.soundOn && window.SFX && window.SFX.milestone) window.SFX.milestone();
      dropEquipment(); // boss ganimeti
    } else if (st.soundOn && window.SFX) {
      window.SFX.buy();
    }
    st.population += reward;
    st.totalEarned += reward;
    st.runEarned += reward;
    const e = deps.enemyCenter();
    deps.spawnFloatText(e.x, e.y - 24, "+" + (deps.fmt ? deps.fmt(reward) : Math.floor(reward)));
    if (window.Effects) {
      window.Effects.burst(e.x, e.y, { count: boss ? 24 : 12, power: boss ? 2 : 1.3 });
    }
    if (window.Scene2D) window.Scene2D.enemyDie();
    st.stage += 1;
    setTimeout(initEnemy, 240);
  }

  function drawRarity() {
    const total = RARITIES.reduce((s, r) => s + r.weight, 0);
    let roll = Math.random() * total, rar = RARITIES[0];
    for (const r of RARITIES) { if (roll < r.weight) { rar = r; break; } roll -= r.weight; }
    return rar;
  }

  // Boss yenince ekipman düşür (rastgele slot + ağırlıklı nadirlik).
  function dropEquipment() {
    const st = S();
    if (!st.equip) st.equip = { weapon: null, armor: null, ring: null };
    const rar = drawRarity();
    const slot = SLOTS[(Math.random() * SLOTS.length) | 0];
    const power = piecePower(rar.mult, st.stage);
    const cur = st.equip[slot.id];
    const better = !cur || power > cur.power;
    if (better) st.equip[slot.id] = { rarity: rar.id, power: power };
    const tag = `${rar.name} ${slot.name}`;
    if (better) {
      deps.showToast(`✨ ${tag}! +${power}% ${slot.statLabel}`);
      if (rar.id === "legendary" || rar.id === "epic") {
        deps.say(rar.id === "legendary" ? "EFSANEVİ düştü! 🌟" : "Destansı parça! 🔥", 3000);
        if (window.Effects) {
          window.Effects.confetti({ count: rar.id === "legendary" ? 110 : 50 });
        }
      }
    } else {
      deps.showToast(`${tag} düştü · mevcut daha iyi`);
    }
    renderEquipment();
  }

  /* --- Yeniden çekme (reroll) -------------------------------------
     Oyuncuya ekipman üstünde ajans verir: bir slotu rastgele yeni
     nadirlik + güçle değiştirir. Maliyet: 60 saniyelik üretim (min 1K).
     Mevcut parça boşsa kullanılamaz (önce bir boss yenilmeli). */
  function rerollCost() {
    return Math.max(1000, Math.floor(deps.totalPerSecond() * 60));
  }

  function rerollEquipment(slotId) {
    const st = S();
    const slot = slotById(slotId);
    const cur = st.equip && st.equip[slot.id];
    if (!cur) {
      deps.showToast("Önce bir boss yenmelisin (boş slot)");
      return false;
    }
    const cost = rerollCost();
    if (st.population < cost) {
      deps.showToast(`Yetersiz puan · ${deps.fmt ? deps.fmt(cost) : cost} gerek`);
      return false;
    }
    st.population -= cost;
    const rar = drawRarity();
    const power = piecePower(rar.mult, st.stage);
    const replaced = { rarity: rar.id, power: power };
    const better = power > cur.power;
    st.equip[slot.id] = replaced; // reroll: oyuncu kabul ediyor
    deps.showToast(
      (better ? "🔁 Daha iyi! " : "🔁 ") +
      `${rar.name} ${slot.name} · +${power}% ${slot.statLabel}`
    );
    if (window.Effects && (rar.id === "legendary" || rar.id === "epic")) {
      window.Effects.confetti({ count: rar.id === "legendary" ? 80 : 30 });
    }
    if (st.soundOn && window.SFX) {
      (rar.id === "legendary" ? window.SFX.upgrade : window.SFX.buy)();
    }
    renderEquipment();
    if (deps.renderResource) deps.renderResource();
    return true;
  }

  /* --- Ekipman paneli --------------------------------------------- */
  function renderEquipment() {
    const st = S();
    if (!st.equip) st.equip = { weapon: null, armor: null, ring: null };
    const cost = rerollCost();
    const fmt = deps && deps.fmt ? deps.fmt : ((n) => Math.floor(n).toString());
    SLOTS.forEach((slot) => {
      const card = document.getElementById("equip-" + slot.id);
      if (!card) return;
      const p = st.equip[slot.id];
      const r = p ? rarityById(p.rarity) : null;
      card.style.borderColor = r ? r.color : "rgba(255,255,255,0.12)";
      card.disabled = !p;
      card.innerHTML = p
        ? `<span class="equip-icon">${slot.icon}</span>
           <span class="equip-body">
             <span class="equip-rar" style="color:${r.color}">${r.name} ${slot.name}</span>
             <span class="equip-stat">+${p.power}% ${slot.statLabel}</span>
           </span>
           <span class="equip-reroll" data-cost="${cost}">🔁 ${fmt(cost)}</span>`
        : `<span class="equip-icon dim">${slot.icon}</span>
           <span class="equip-body">
             <span class="equip-rar dim">${slot.name}</span>
             <span class="equip-stat dim">boş · boss'tan düşer</span>
           </span>`;
    });
    const cc = document.getElementById("equipCrit");
    if (cc) cc.textContent = "Kritik şansı: %" + critChance();
  }

  // Boss süresi dolduysa kısmi iyileş — tam reset değil, ilerlemeyi koru.
  function checkBossTimeout() {
    const st = S();
    if (isBossStage(st.stage) && enemyMax > 0 && Date.now() > bossUntil) {
      // Eskiden tam iyileşiyordu (enemyHp = enemyMax). Şimdi sadece %65 dolar.
      const cur = Math.max(0, enemyHp);
      const target = enemyMax * BOSS_TIMEOUT_HEAL;
      enemyHp = Math.min(enemyMax, Math.max(cur, target));
      bossUntil = Date.now() + BOSS_TIME;
      deps.say("Daha güçlü olmalıyız!", 2500);
      if (window.Scene2D) window.Scene2D.enemyAttack();
    }
  }

  /* --- Init -------------------------------------------------------- */
  function init(d) {
    deps = d || {};
    // Slot kartlarına tıklayınca onay modal'ı ile reroll
    SLOTS.forEach((slot) => {
      const card = document.getElementById("equip-" + slot.id);
      if (!card) return;
      card.addEventListener("click", () => {
        if (deps.onRerollClick) deps.onRerollClick(slot.id);
      });
    });
  }

  window.Combat = {
    // Sabitler / dışa açık ölçekler
    SLOTS, RARITIES, BOSS_EVERY,
    // Yardımcılar (game.js içinden okunur)
    isBossStage, enemyTier, enemyMaxHp, bossMultiplier,
    equipTapMult, equipProdMult, critChance,
    // Yaşam döngüsü
    init, initEnemy, renderCombat, renderEquipment,
    dealDamage, checkBossTimeout, hasEnemy,
    rerollEquipment, rerollCost,
  };
})();
