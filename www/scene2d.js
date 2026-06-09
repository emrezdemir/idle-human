/* =========================================================
   Idle Human — 2D çağ sahnesi (scene2d.js)
   Saf CSS/SVG, "flat" sevimli stil (Forge Master esintili, özgün çizim):
     - sade gökyüzü degradesi + minimal tepe silüetleri + zemin
     - ön planda KARAKTER: yuvarlak kafa + gövde + çağ eşyası + aksesuar,
       hepsi vektör (SVG). Çağa göre kıyafet rengi/eşya/aksesuar değişir.
       Karakter nefes alır, dokununca squash yapar.
   API: window.Scene2D = { mount(container, eraIndex), setEra(i), tap() }
   ========================================================= */

"use strict";

(() => {
  const ORDER = ["stone","hunter","agri","antiquity","medieval","renaissance","industrial","info","space","galactic"];

  // Çağ -> kıyafet rengi + elindeki eşya + kafa aksesuarı
  const CHAR = {
    stone:       { cloth:"#966e46", item:"stick",  acc:"furcap" },
    hunter:      { cloth:"#5c6b3a", item:"spear",  acc:"headband" },
    agri:        { cloth:"#6b8e3a", item:"hoe",    acc:"strawhat" },
    antiquity:   { cloth:"#d8d0b8", item:"scroll", acc:"laurel" },
    medieval:    { cloth:"#6b7280", item:"sword",  acc:"helmet" },
    renaissance: { cloth:"#7a3050", item:"brush",  acc:"beret" },
    industrial:  { cloth:"#3a3a42", item:"hammer", acc:"goggles" },
    info:        { cloth:"#2a6b7a", item:"tablet", acc:"headset" },
    space:       { cloth:"#cdd6ea", item:"ray",    acc:"spacehelmet" },
    galactic:    { cloth:"#9b59ff", item:"saber",  acc:"halo" },
  };

  // Çağ -> [gökyüzü üst, gökyüzü alt, zemin]
  const SKY = {
    stone:["#5b4a6e","#caa98a","#6b5436"], hunter:["#3a4a30","#9fb47a","#3f5a2e"],
    agri:["#7fae5a","#d9eab0","#5a8a3a"], antiquity:["#caa23b","#f0e0b0","#cabf98"],
    medieval:["#33303c","#7b7488","#4a4658"], renaissance:["#3a2838","#caa0a8","#6a5560"],
    industrial:["#3a3a42","#8a7a6a","#46464e"], info:["#0f2630","#2bb6c9","#123038"],
    space:["#06061a","#1a2046","#23284e"], galactic:["#0a0018","#2a1040","#241038"],
  };

  const ST = 'stroke="#2a201e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';

  function itemPart(t) {
    switch (t) {
      case "stick":  return `<rect x="44" y="144" width="106" height="14" rx="7" fill="#966a3a" ${ST}/><circle cx="150" cy="151" r="11" fill="#966a3a" ${ST}/>`;
      case "spear":  return `<rect x="40" y="147" width="112" height="8" rx="4" fill="#966a3a" ${ST}/><polygon points="150,141 174,151 150,161" fill="#cdd3df" ${ST}/>`;
      case "hoe":    return `<rect x="40" y="147" width="112" height="8" rx="4" fill="#966a3a" ${ST}/><rect x="150" y="137" width="15" height="26" rx="3" fill="#788090" ${ST}/>`;
      case "scroll": return `<rect x="52" y="142" width="96" height="18" rx="6" fill="#eee6d2" ${ST}/><rect x="46" y="140" width="14" height="22" rx="6" fill="#c8b996" ${ST}/><rect x="140" y="140" width="14" height="22" rx="6" fill="#c8b996" ${ST}/>`;
      case "sword":  return `<polygon points="46,152 140,142 162,151 140,160 46,158" fill="#d2d7e1" ${ST}/><rect x="40" y="143" width="12" height="18" rx="4" fill="#78502d" ${ST}/><rect x="52" y="139" width="8" height="26" rx="3" fill="#969aa0" ${ST}/>`;
      case "brush":  return `<rect x="44" y="147" width="96" height="8" rx="4" fill="#8c5f37" ${ST}/><polygon points="140,140 168,151 140,162" fill="#78b4e6" ${ST}/>`;
      case "hammer": return `<rect x="44" y="146" width="96" height="10" rx="5" fill="#8c5f37" ${ST}/><rect x="132" y="133" width="34" height="36" rx="8" fill="#788090" ${ST}/>`;
      case "tablet": return `<rect x="54" y="130" width="92" height="38" rx="10" fill="#28343c" ${ST}/><rect x="62" y="137" width="76" height="24" rx="5" fill="#50c8dc"/>`;
      case "ray":    return `<rect x="46" y="141" width="94" height="16" rx="8" fill="#6e7a96" ${ST}/><circle cx="156" cy="149" r="17" fill="#82d7eb" ${ST}/><rect x="70" y="156" width="16" height="16" rx="4" fill="#5a6480" ${ST}/>`;
      case "saber":  return `<rect x="40" y="143" width="24" height="18" rx="5" fill="#5a6068" ${ST}/><rect x="64" y="145" width="106" height="10" rx="5" fill="#b478ff" ${ST}/><rect x="66" y="147" width="104" height="6" rx="3" fill="#ebd2ff"/>`;
      default: return "";
    }
  }

  function accPart(t) {
    switch (t) {
      case "furcap":   return `<polygon points="56,76 60,34 78,30 100,40 122,30 140,34 144,76" fill="#6e482a" ${ST}/>`;
      case "headband": return `<rect x="54" y="60" width="92" height="14" rx="5" fill="#963c32" ${ST}/><polygon points="150,50 168,46 156,68" fill="#dcd2c8" ${ST}/>`;
      case "strawhat": return `<polygon points="100,16 66,54 134,54" fill="#d6b056" ${ST}/><ellipse cx="100" cy="56" rx="60" ry="9" fill="#c49e48" ${ST}/>`;
      case "laurel":   return `<path d="M58,96 A34,34 0 0 1 72,42" fill="none" stroke="#5a9646" stroke-width="6" stroke-linecap="round"/><path d="M162,96 A34,34 0 0 0 148,42" fill="none" stroke="#5a9646" stroke-width="6" stroke-linecap="round"/>`;
      case "helmet":   return `<path d="M54,84 A46,46 0 0 1 146,84 Z" fill="#969eaa" ${ST}/><rect x="92" y="66" width="16" height="30" rx="4" fill="#606a78" ${ST}/>`;
      case "beret":    return `<ellipse cx="100" cy="46" rx="42" ry="16" fill="#3a2030" ${ST}/><circle cx="138" cy="40" r="5" fill="#3a2030"/>`;
      case "goggles":  return `<rect x="56" y="46" width="88" height="16" rx="8" fill="#465064" ${ST}/><circle cx="80" cy="54" r="13" fill="#96dceb" ${ST}/><circle cx="120" cy="54" r="13" fill="#96dceb" ${ST}/>`;
      case "headset":  return `<path d="M54,82 A46,46 0 0 1 146,82" fill="none" stroke="#28303a" stroke-width="8" stroke-linecap="round"/><rect x="48" y="64" width="14" height="26" rx="5" fill="#28303a" ${ST}/><rect x="138" y="64" width="14" height="26" rx="5" fill="#28303a" ${ST}/>`;
      case "spacehelmet": return `<circle cx="100" cy="80" r="56" fill="rgba(188,214,255,0.18)" stroke="#b6d2e6" stroke-width="4"/>`;
      case "halo":     return `<ellipse cx="100" cy="28" rx="36" ry="8" fill="none" stroke="#78e1ff" stroke-width="6"/>`;
      default: return "";
    }
  }

  function characterSvg(id) {
    const c = CHAR[id] || CHAR.stone;
    const cloth = c.cloth, skin = "#ecc29a";
    return `<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" class="hero-char-svg">` +
      // gövde + kollar
      `<rect x="58" y="130" width="84" height="76" rx="36" fill="${cloth}" ${ST}/>` +
      `<rect x="44" y="148" width="24" height="42" rx="12" fill="${cloth}" ${ST}/>` +
      `<rect x="152" y="148" width="24" height="42" rx="12" fill="${cloth}" ${ST}/>` +
      itemPart(c.item) +
      // kafa + yüz
      `<circle cx="100" cy="82" r="46" fill="${skin}" ${ST}/>` +
      `<circle cx="82" cy="80" r="6" fill="#2d2328"/><circle cx="118" cy="80" r="6" fill="#2d2328"/>` +
      `<circle cx="70" cy="95" r="8" fill="#f4a89e"/><circle cx="130" cy="95" r="8" fill="#f4a89e"/>` +
      `<path d="M88,94 Q100,104 112,94" fill="none" stroke="#46322d" stroke-width="4" stroke-linecap="round"/>` +
      accPart(c.acc) +
      `</svg>`;
  }

  // Minimal, çağdan bağımsız tepe silüetleri (sade durur).
  const SCENERY = `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">` +
    `<ellipse cx="110" cy="206" rx="180" ry="64" fill="rgba(0,0,0,0.10)"/>` +
    `<ellipse cx="320" cy="210" rx="150" ry="54" fill="rgba(0,0,0,0.16)"/></svg>`;

  // Düşman (sevimli ama kızgın "slime") — tier'a göre renk, boss kırmızı+boynuz.
  const ENEMY_COLORS = ["#9b59ff","#5aa0e0","#e0894a","#6bbf59","#c05ad0","#e0c04a","#5ac0b0","#d05a7a"];
  function enemySvg(tier, boss) {
    const col = boss ? "#c44b58" : ENEMY_COLORS[tier % ENEMY_COLORS.length];
    const horns = boss
      ? `<polygon points="34,70 24,30 56,64" fill="#7a2e36" ${ST}/><polygon points="126,70 136,30 104,64" fill="#7a2e36" ${ST}/>`
      : "";
    return `<svg viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg">` +
      horns +
      `<path d="M20,150 A60,60 0 0 1 140,150 Z" fill="${col}" ${ST}/>` +
      `<circle cx="60" cy="98" r="15" fill="#fff" ${ST}/><circle cx="100" cy="98" r="15" fill="#fff" ${ST}/>` +
      `<circle cx="62" cy="101" r="6" fill="#2a2028"/><circle cx="102" cy="101" r="6" fill="#2a2028"/>` +
      `<path d="M44,80 L70,90" stroke="#2a201e" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M116,80 L90,90" stroke="#2a201e" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M64,128 Q80,116 96,128" fill="none" stroke="#2a201e" stroke-width="5" stroke-linecap="round"/>` +
      `</svg>`;
  }

  let host = null, scenery = null, ground = null, heroChar = null;
  let enemyArt = null, enemyHpFill = null, stageLabel = null, bossTimer = null;
  let mounted = false, tapT = null;

  function setEra(eraIndex) {
    if (!mounted) return;
    const id = ORDER[Math.max(0, Math.min(ORDER.length - 1, eraIndex))];
    const sk = SKY[id] || SKY.stone;
    host.style.setProperty("--sky-top", sk[0]);
    host.style.setProperty("--sky-bot", sk[1]);
    if (ground) ground.style.background = sk[2];
    if (scenery && scenery.innerHTML.indexOf("<svg") < 0) scenery.innerHTML = SCENERY;
    if (heroChar) heroChar.innerHTML = characterSvg(id);
  }

  function mount(container, eraIndex) {
    if (!container || mounted) return mounted;
    host = container;
    scenery = container.querySelector(".scene-scenery");
    ground = container.querySelector(".scene-ground");
    heroChar = container.querySelector(".scene-hero-char");
    enemyArt = container.querySelector(".scene-enemy-art");
    enemyHpFill = container.querySelector(".scene-enemy-hp-fill");
    stageLabel = container.querySelector(".scene-stage");
    bossTimer = container.querySelector(".scene-boss-timer");
    mounted = true;
    setEra(eraIndex);
    return true;
  }

  /* --- Savaş HUD'u --- */
  function setEnemy(tier, boss) {
    if (enemyArt) enemyArt.innerHTML = enemySvg(tier || 0, !!boss);
    const wrap = host && host.querySelector(".scene-enemy");
    if (wrap) wrap.classList.toggle("boss", !!boss);
  }
  function setHp(frac) {
    if (enemyHpFill) enemyHpFill.style.width = Math.max(0, Math.min(1, frac)) * 100 + "%";
  }
  function setStage(stage, boss) {
    if (stageLabel) stageLabel.textContent = (boss ? "👑 BOSS · " : "") + "Stage " + stage;
    if (stageLabel) stageLabel.classList.toggle("boss", !!boss);
  }
  function setBossTimer(sec) {
    if (!bossTimer) return;
    if (sec == null) bossTimer.classList.add("hidden");
    else { bossTimer.classList.remove("hidden"); bossTimer.textContent = "⏱ " + Math.ceil(sec) + "s"; }
  }
  function hitEnemy() {
    if (!enemyArt) return;
    enemyArt.classList.remove("hit");
    void enemyArt.offsetWidth;
    enemyArt.classList.add("hit");
  }
  function enemyDie() {
    const wrap = host && host.querySelector(".scene-enemy");
    if (!wrap) return;
    wrap.classList.remove("die");
    void wrap.offsetWidth;
    wrap.classList.add("die");
    setTimeout(() => wrap.classList.remove("die"), 360);
  }

  function tap() {
    const hero = host && host.querySelector(".scene-hero");
    if (!hero) return;
    hero.classList.remove("tap");
    void hero.offsetWidth;
    hero.classList.add("tap");
    clearTimeout(tapT);
    tapT = setTimeout(() => hero.classList.remove("tap"), 240);
  }

  window.Scene2D = { mount, setEra, tap, setEnemy, setHp, setStage, setBossTimer, hitEnemy, enemyDie };
})();
