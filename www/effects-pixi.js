/* =========================================================
   Idle Human — PixiJS tabanlı efekt motoru (effects-pixi.js)
   effects.js ile AYNI API'yi sunar: init, burst, confetti, screenShake.
   WebGL destekleniyorsa window.Effects'i bu Pixi motoruyla değiştirir;
   desteklenmiyorsa (veya Pixi yüklenmemişse) dokunmaz ve canvas motoru
   (effects.js) yürürlükte kalır. Böylece her ortamda güvenli çalışır.
   ========================================================= */

"use strict";

(() => {
  // Pixi yoksa hiçbir şey yapma; canvas motoru devrede kalsın.
  if (!window.PIXI) return;

  // WebGL gerçekten destekleniyor mu? Değilse canvas'ta kal.
  let webgl = false;
  try {
    webgl = PIXI.utils.isWebGLSupported();
  } catch (e) {
    webgl = false;
  }
  if (!webgl) return;

  // Override başarısız olursa geri dönebilmek için canvas motorunu sakla.
  const CanvasEffects = window.Effects;

  const PALETTE = [0xffd166, 0x06d6a0, 0x7c5cff, 0xf472b6, 0x36d1dc, 0xf5f0ff];

  let app = null;
  let bgLayer = null; // arka plan yıldızları
  let fxLayer = null; // patlama + konfeti
  let circleTex = null;
  let rectTex = null;
  let stars = [];
  let particles = [];
  let shake = 0;
  let reduceMotion = false;
  let ready = false;

  // Yumuşak (radyal degrade) parçacık dokusu — glow hissi verir.
  function makeCircleTexture() {
    const s = 64;
    const cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const g = cv.getContext("2d");
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.85)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    return PIXI.Texture.from(cv);
  }

  function init() {
    const canvas = document.getElementById("fxCanvas");
    if (!canvas) return;
    reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      app = new PIXI.Application({
        view: canvas,
        resizeTo: window,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        powerPreference: "high-performance",
      });
    } catch (e) {
      // WebGL bağlamı kurulamadı — canvas motoruna güvenli geri dönüş.
      window.Effects = CanvasEffects;
      if (CanvasEffects && CanvasEffects.init) CanvasEffects.init();
      return;
    }

    circleTex = makeCircleTexture();
    rectTex = PIXI.Texture.WHITE;

    bgLayer = new PIXI.Container();
    fxLayer = new PIXI.Container();
    app.stage.addChild(bgLayer);
    app.stage.addChild(fxLayer);

    seedStars();
    ready = true;
    app.ticker.add(update);
  }

  function screen() {
    return app ? app.renderer.screen : { width: window.innerWidth, height: window.innerHeight };
  }

  // Yavaşça yukarı süzülen arka plan yıldızları (kalıcı, additive glow).
  function seedStars() {
    const sc = screen();
    const count = reduceMotion ? 16 : Math.min(70, Math.floor((sc.width * sc.height) / 16000));
    stars.forEach((s) => s.sprite.destroy());
    stars = [];
    for (let i = 0; i < count; i++) {
      const sp = new PIXI.Sprite(circleTex);
      sp.anchor.set(0.5);
      sp.blendMode = PIXI.BLEND_MODES.ADD;
      sp.tint = 0xb4a0f0;
      const r = Math.random() * 1.8 + 0.6;
      sp.width = sp.height = r * 4;
      sp.x = Math.random() * sc.width;
      sp.y = Math.random() * sc.height;
      bgLayer.addChild(sp);
      stars.push({
        sprite: sp,
        vy: -(Math.random() * 0.25 + 0.05),
        a: Math.random() * 0.5 + 0.2,
        tw: Math.random() * Math.PI * 2,
        base: r,
      });
    }
  }

  function spawn(opts) {
    const sp = new PIXI.Sprite(opts.shape === "rect" ? rectTex : circleTex);
    sp.anchor.set(0.5);
    if (opts.shape !== "rect") sp.blendMode = PIXI.BLEND_MODES.ADD;
    sp.tint = opts.color;
    sp.x = opts.x;
    sp.y = opts.y;
    fxLayer.addChild(sp);
    particles.push(Object.assign({ sprite: sp, rot: 0, vr: 0 }, opts));
    if (particles.length > 700) {
      const dead = particles.splice(0, particles.length - 700);
      dead.forEach((p) => p.sprite.destroy());
    }
  }

  function update() {
    if (!ready) return;
    const sc = screen();

    // Yıldızlar
    for (const s of stars) {
      const sp = s.sprite;
      sp.y += s.vy;
      s.tw += 0.03;
      if (sp.y < -4) {
        sp.y = sc.height + 4;
        sp.x = Math.random() * sc.width;
      }
      sp.alpha = s.a * (0.6 + 0.4 * Math.sin(s.tw));
    }

    // Geçici parçacıklar
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= 1;
      if (p.life <= 0) {
        p.sprite.destroy();
        particles.splice(i, 1);
        continue;
      }
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      const t = p.life / p.maxLife;
      const sp = p.sprite;
      sp.x = p.x;
      sp.y = p.y;
      sp.alpha = Math.max(0, t);
      if (p.shape === "rect") {
        p.rot += p.vr;
        sp.rotation = p.rot;
        sp.width = p.r * 2;
        sp.height = p.r * 1.2;
      } else {
        const d = p.r * (0.4 + 0.6 * t) * 4;
        sp.width = sp.height = d;
      }
    }

    // Ekran sarsıntısı
    if (shake > 0.1) {
      app.stage.x = (Math.random() - 0.5) * shake;
      app.stage.y = (Math.random() - 0.5) * shake;
      shake *= 0.86;
    } else if (app.stage.x !== 0 || app.stage.y !== 0) {
      app.stage.x = 0;
      app.stage.y = 0;
      shake = 0;
    }
  }

  /* --- effects.js ile aynı genel API --- */

  function burst(x, y, opts = {}) {
    if (reduceMotion || !ready) return;
    const n = opts.count || 10;
    const power = opts.power || 1;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 2 + 1) * power;
      spawn({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1,
        g: 0.06,
        r: Math.random() * 3 + 1.5,
        color: opts.color || PALETTE[(Math.random() * PALETTE.length) | 0],
        life: 40, maxLife: 40, shape: "circle",
      });
    }
  }

  function confetti(opts = {}) {
    if (reduceMotion || !ready) return;
    const sc = screen();
    const n = opts.count || 80;
    for (let i = 0; i < n; i++) {
      spawn({
        x: Math.random() * sc.width,
        y: -10 - Math.random() * sc.height * 0.3,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        g: 0.07,
        r: Math.random() * 4 + 2,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        life: 120, maxLife: 120, shape: "rect",
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  function screenShake(mag = 6) {
    if (reduceMotion || !ready) return;
    shake = Math.max(shake, mag);
  }

  // Pixi motorunu etkinleştir: window.Effects'i değiştir.
  window.Effects = { init, burst, confetti, screenShake, engine: "pixi" };
})();
