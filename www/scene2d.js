/* =========================================================
   Idle Human — 2D çağ sahnesi (scene2d.js)
   Saf CSS/SVG (3D yok). Her çağ için:
     - gökyüzü degradesi (CSS değişkenleri)
     - katmanlı SVG silüet manzara (tepeler, ağaç, yapı...)
     - zemin bandı
     - ön planda KARAKTER: kullanıcının pixel-art portresi, arka planı
       flood-fill ile kırpılır (rozet/kare değil), nefes alır, dokununca
       squash yapar.
   API: window.Scene2D = { mount(container, eraIndex), setEra(i), tap() }
   ========================================================= */

"use strict";

(() => {
  // Çağ id -> portre dosyası (assets/characters/<n>p.png) — analizle seçildi.
  const FACE = {
    stone: 1, hunter: 13, agri: 8, antiquity: 4, medieval: 2,
    renaissance: 6, industrial: 12, info: 11, space: 3, galactic: 9,
  };
  const ORDER = ["stone","hunter","agri","antiquity","medieval","renaissance","industrial","info","space","galactic"];

  // Sahne tanımları: gökyüzü üst/alt, zemin rengi ve silüet SVG'si.
  // SVG viewBox 0 0 400 200, alta yaslı; sky CSS ile arkada.
  const SCENES = {
    stone: { skyTop:"#5b4a6e", skyBot:"#caa98a", ground:"#5a4632", svg:
      `<polygon points="0,150 90,95 180,150" fill="#4a3d55"/>
       <polygon points="150,150 260,80 370,150" fill="#3e3349"/>
       <ellipse cx="70" cy="60" rx="26" ry="26" fill="#ffe6a8" opacity="0.9"/>
       <rect x="0" y="150" width="400" height="50" fill="#5a4632"/>
       <polygon points="40,150 60,120 80,150" fill="#6b5640"/>
       <polygon points="300,150 330,110 360,150" fill="#6b5640"/>` },
    hunter: { skyTop:"#3a4a30", skyBot:"#9fb47a", ground:"#3f5a2e", svg:
      `<polygon points="0,150 120,90 240,150" fill="#2f4226"/>
       <rect x="0" y="150" width="400" height="50" fill="#3f5a2e"/>
       <g fill="#26361f">
         <polygon points="60,150 75,95 90,150"/><polygon points="62,120 75,80 88,120"/>
         <polygon points="320,150 338,90 356,150"/><polygon points="322,118 338,75 354,118"/>
         <polygon points="180,150 192,110 204,150"/></g>` },
    agri: { skyTop:"#7fae5a", skyBot:"#d9eab0", ground:"#5a8a3a", svg:
      `<ellipse cx="330" cy="55" rx="30" ry="30" fill="#fff0b0"/>
       <polygon points="0,150 140,100 300,150" fill="#4f7a32"/>
       <rect x="0" y="150" width="400" height="50" fill="#5a8a3a"/>
       <g fill="#3f6328"><rect x="0" y="158" width="400" height="4"/><rect x="0" y="170" width="400" height="4"/><rect x="0" y="184" width="400" height="4"/></g>
       <g><rect x="150" y="112" width="46" height="38" fill="#7a4a2a"/><polygon points="146,112 173,90 200,112" fill="#8a3a2a"/></g>` },
    antiquity: { skyTop:"#caa23b", skyBot:"#f0e0b0", ground:"#cabf98", svg:
      `<rect x="0" y="150" width="400" height="50" fill="#cabf98"/>
       <polygon points="40,150 110,60 180,150" fill="#caa86a"/>
       <polygon points="220,150 300,50 380,150" fill="#b9975a"/>
       <g fill="#efe6d2"><rect x="150" y="95" width="10" height="55"/><rect x="172" y="95" width="10" height="55"/><rect x="194" y="95" width="10" height="55"/><rect x="142" y="88" width="70" height="10"/></g>` },
    medieval: { skyTop:"#33303c", skyBot:"#7b7488", ground:"#4a4658", svg:
      `<polygon points="0,150 160,80 360,150" fill="#332f3c"/>
       <rect x="0" y="150" width="400" height="50" fill="#4a4658"/>
       <g fill="#2a2733"><rect x="150" y="80" width="100" height="70"/>
        <rect x="140" y="66" width="20" height="84"/><rect x="240" y="66" width="20" height="84"/>
        <polygon points="138,66 150,48 162,66"/><polygon points="238,66 250,48 262,66"/>
        <rect x="190" y="110" width="20" height="40" fill="#1a1822"/></g>` },
    renaissance: { skyTop:"#3a2838", skyBot:"#caa0a8", ground:"#6a5560", svg:
      `<rect x="0" y="150" width="400" height="50" fill="#6a5560"/>
       <g fill="#4a3744"><rect x="40" y="100" width="40" height="50"/><rect x="90" y="112" width="34" height="38"/>
        <rect x="300" y="104" width="38" height="46"/><rect x="262" y="116" width="30" height="34"/></g>
       <g fill="#5a4450"><rect x="170" y="86" width="60" height="64"/>
        <path d="M170 86 a30 30 0 0 1 60 0 z"/></g>
       <rect x="196" y="58" width="8" height="20" fill="#5a4450"/>` },
    industrial: { skyTop:"#3a3a42", skyBot:"#8a7a6a", ground:"#46464e", svg:
      `<rect x="0" y="150" width="400" height="50" fill="#46464e"/>
       <g fill="#2e2e36"><rect x="40" y="96" width="90" height="54"/><rect x="150" y="84" width="110" height="66"/>
        <rect x="60" y="60" width="16" height="40"/><rect x="180" y="46" width="16" height="40"/><rect x="226" y="54" width="16" height="40"/>
        <rect x="300" y="100" width="70" height="50"/></g>
       <g fill="#6a6a72" opacity="0.5"><ellipse cx="68" cy="52" rx="18" ry="10"/><ellipse cx="188" cy="38" rx="22" ry="12"/></g>` },
    info: { skyTop:"#0f2630", skyBot:"#2bb6c9", ground:"#123038", svg:
      `<rect x="0" y="150" width="400" height="50" fill="#123038"/>
       <g fill="#0c1f26"><rect x="30" y="70" width="34" height="80"/><rect x="74" y="96" width="30" height="54"/>
        <rect x="150" y="54" width="40" height="96"/><rect x="200" y="84" width="30" height="66"/>
        <rect x="300" y="64" width="36" height="86"/><rect x="344" y="100" width="26" height="50"/></g>
       <g fill="#36d1dc"><rect x="40" y="80" width="6" height="6"/><rect x="160" y="64" width="6" height="6"/><rect x="160" y="80" width="6" height="6"/><rect x="310" y="76" width="6" height="6"/></g>` },
    space: { skyTop:"#06061a", skyBot:"#1a2046", ground:"#23284e", svg:
      `<g fill="#ffffff"><circle cx="40" cy="40" r="1.6"/><circle cx="120" cy="26" r="1.2"/><circle cx="210" cy="50" r="1.8"/><circle cx="300" cy="30" r="1.4"/><circle cx="360" cy="60" r="1.6"/><circle cx="80" cy="80" r="1.2"/><circle cx="260" cy="86" r="1.2"/></g>
       <circle cx="320" cy="64" r="34" fill="#4a6bd0"/><ellipse cx="320" cy="64" rx="48" ry="10" fill="#7a9ae0" opacity="0.5"/>
       <rect x="0" y="150" width="400" height="50" fill="#23284e"/>
       <g fill="#3a4068"><rect x="150" y="110" width="40" height="40"/><polygon points="150,110 170,86 190,110"/></g>` },
    galactic: { skyTop:"#0a0018", skyBot:"#2a1040", ground:"#241038", svg:
      `<g fill="#ffffff"><circle cx="50" cy="40" r="1.4"/><circle cx="140" cy="30" r="1.2"/><circle cx="240" cy="46" r="1.6"/><circle cx="330" cy="28" r="1.2"/><circle cx="90" cy="74" r="1.2"/></g>
       <ellipse cx="200" cy="70" rx="150" ry="40" fill="#7c3aed" opacity="0.25"/>
       <ellipse cx="200" cy="70" rx="90" ry="22" fill="#b86bff" opacity="0.25"/>
       <circle cx="110" cy="70" r="22" fill="#ff7bf0"/><circle cx="300" cy="60" r="16" fill="#36d1dc"/>
       <rect x="0" y="150" width="400" height="50" fill="#241038"/>` },
  };

  let host = null, sky = null, scenery = null, ground = null, heroImg = null;
  let mounted = false, currentId = null;
  const heroCache = {}; // id -> dataURL | null (işlenemedi) | undefined

  // Portrenin arka planını köşelerden flood-fill ile saydam yapar (kırpma).
  function processHero(id, cb) {
    if (id in heroCache) { cb(heroCache[id]); return; }
    const n = FACE[id];
    if (!n) { heroCache[id] = null; cb(null); return; }
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.width || 32, h = img.height || 32;
        const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        const g = cv.getContext("2d");
        g.imageSmoothingEnabled = false;
        g.drawImage(img, 0, 0);
        const im = g.getImageData(0, 0, w, h);
        floodRemove(im.data, w, h);
        g.putImageData(im, 0, 0);
        const url = cv.toDataURL("image/png");
        heroCache[id] = url; cb(url);
      } catch (e) {
        // İşlenemedi (ör. canvas yok) — ham portreyi kullan
        heroCache[id] = "assets/characters/" + n + "p.png"; cb(heroCache[id]);
      }
    };
    img.onerror = () => { heroCache[id] = null; cb(null); };
    img.src = "assets/characters/" + n + "p.png";
  }

  // Arka planı iki adımda temizler (denek bütün kalır):
  //  1) köşelerden bölge-büyütme — komşu renk yakınsa saydam (degradeyi takip eder)
  //  2) kalan arka-plan-renkli artıkları sil (yüzü yemez, sadece bg tonuna çok yakınlar)
  function floodRemove(d, w, h) {
    const FLOOD = 2700, BG = 1000;
    // köşelerin ortalama arka plan rengi
    const cidx = [0, (w - 1), (h - 1) * w, (h - 1) * w + (w - 1)];
    let br = 0, bgc = 0, bb = 0;
    for (const c of cidx) { br += d[c * 4]; bgc += d[c * 4 + 1]; bb += d[c * 4 + 2]; }
    br /= 4; bgc /= 4; bb /= 4;
    const seen = new Uint8Array(w * h);
    const st = [];
    const push = (x, y) => { const p = y * w + x; if (!seen[p]) { seen[p] = 1; st.push(x, y); } };
    push(0, 0); push(w - 1, 0); push(0, h - 1); push(w - 1, h - 1);
    while (st.length) {
      const y = st.pop(), x = st.pop();
      const i = (y * w + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      d[i + 3] = 0;
      const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (let k = 0; k < 4; k++) {
        const nx = nb[k][0], ny = nb[k][1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const p = ny * w + nx; if (seen[p]) continue;
        const j = p * 4;
        const dr = d[j] - r, dg = d[j + 1] - g, db = d[j + 2] - b;
        if (dr * dr + dg * dg + db * db < FLOOD) push(nx, ny);
      }
    }
    for (let p = 0; p < w * h; p++) {
      const i = p * 4; if (d[i + 3] === 0) continue;
      const dr = d[i] - br, dg = d[i + 1] - bgc, db = d[i + 2] - bb;
      if (dr * dr + dg * dg + db * db < BG) d[i + 3] = 0;
    }
  }

  function setEra(eraIndex) {
    if (!mounted) return;
    const id = ORDER[Math.max(0, Math.min(ORDER.length - 1, eraIndex))];
    currentId = id;
    const sc = SCENES[id] || SCENES.stone;
    host.style.setProperty("--sky-top", sc.skyTop);
    host.style.setProperty("--sky-bot", sc.skyBot);
    if (ground) ground.style.background = sc.ground;
    if (scenery) scenery.innerHTML =
      `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">${sc.svg}</svg>`;
    processHero(id, (url) => {
      if (currentId === id && heroImg) {
        if (url) { heroImg.src = url; heroImg.style.visibility = "visible"; }
        else heroImg.style.visibility = "hidden";
      }
    });
  }

  function mount(container, eraIndex) {
    if (!container || mounted) return mounted;
    host = container;
    sky = container.querySelector(".scene-sky");
    scenery = container.querySelector(".scene-scenery");
    ground = container.querySelector(".scene-ground");
    heroImg = container.querySelector(".scene-hero-img");
    mounted = true;
    // hepsini önceden işle (10 minik PNG)
    ORDER.forEach((id) => processHero(id, () => {}));
    setEra(eraIndex);
    return true;
  }

  function tap() {
    const hero = host && host.querySelector(".scene-hero");
    if (!hero) return;
    hero.classList.remove("tap");
    void hero.offsetWidth;
    hero.classList.add("tap");
  }

  window.Scene2D = { mount, setEra, tap };
})();
