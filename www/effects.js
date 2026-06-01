/* =========================================================
   Idle Human — görsel efekt motoru (effects.js)
   Tek bir <canvas> üzerinde:
     - arka plan yıldız/parçacık alanı (sürekli)
     - tıklama parçacık patlamaları
     - başarım/prestij konfetisi
     - ekran sarsıntısı (screen shake)
   requestAnimationFrame ile çalışır, sekme gizliyken duraklar.
   ========================================================= */

"use strict";

const Effects = (() => {
  let canvas = null;
  let cx = null;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let particles = []; // geçici parçacıklar (tıklama, konfeti)
  let stars = []; // kalıcı arka plan yıldızları
  let shake = 0; // mevcut sarsıntı şiddeti
  let running = false;
  let reduceMotion = false;

  const PALETTE = ["#ffd166", "#06d6a0", "#7c5cff", "#f472b6", "#36d1dc", "#f5f0ff"];

  function init() {
    canvas = document.getElementById("fxCanvas");
    if (!canvas) return;
    cx = canvas.getContext("2d");
    reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    window.addEventListener("resize", resize);
    seedStars();
    running = true;
    requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Yavaşça yukarı süzülen arka plan yıldızları/baloncukları.
  function seedStars() {
    const count = reduceMotion ? 18 : Math.min(70, Math.floor((W * H) / 16000));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vy: -(Math.random() * 0.25 + 0.05),
        a: Math.random() * 0.5 + 0.2,
        tw: Math.random() * Math.PI * 2, // parıltı fazı
      });
    }
  }

  function frame() {
    if (!running) return;
    cx.clearRect(0, 0, W, H);

    // Sarsıntı: tüm sahneyi rastgele kaydır
    let ox = 0;
    let oy = 0;
    if (shake > 0.1) {
      ox = (Math.random() - 0.5) * shake;
      oy = (Math.random() - 0.5) * shake;
      shake *= 0.86;
    } else {
      shake = 0;
    }
    cx.save();
    cx.translate(ox, oy);

    drawStars();
    drawParticles();

    cx.restore();
    requestAnimationFrame(frame);
  }

  function drawStars() {
    for (const s of stars) {
      s.y += s.vy;
      s.tw += 0.03;
      if (s.y < -4) {
        s.y = H + 4;
        s.x = Math.random() * W;
      }
      const alpha = s.a * (0.6 + 0.4 * Math.sin(s.tw));
      cx.beginPath();
      cx.fillStyle = `rgba(180,160,240,${alpha.toFixed(3)})`;
      cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      cx.fill();
    }
  }

  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= 1;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.vy += p.g; // yerçekimi
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      const t = p.life / p.maxLife;
      cx.globalAlpha = Math.max(0, t);
      if (p.shape === "rect") {
        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate(p.rot);
        p.rot += p.vr;
        cx.fillStyle = p.color;
        cx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        cx.restore();
      } else {
        cx.beginPath();
        cx.fillStyle = p.color;
        cx.arc(p.x, p.y, p.r * (0.4 + 0.6 * t), 0, Math.PI * 2);
        cx.fill();
      }
    }
    cx.globalAlpha = 1;
  }

  /* --- Genel API --- */

  // Tıklama patlaması: (x,y) merkezli küçük parçacık demeti.
  function burst(x, y, opts = {}) {
    if (reduceMotion) return;
    const n = opts.count || 10;
    const power = opts.power || 1;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 2 + 1) * power;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1,
        g: 0.06,
        r: Math.random() * 3 + 1.5,
        color: opts.color || PALETTE[(Math.random() * PALETTE.length) | 0],
        life: 40,
        maxLife: 40,
        shape: "circle",
        rot: 0,
        vr: 0,
      });
    }
    if (particles.length > 600) particles.splice(0, particles.length - 600);
  }

  // Konfeti yağmuru (başarım/prestij kutlaması).
  function confetti(opts = {}) {
    if (reduceMotion) return;
    const n = opts.count || 80;
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W,
        y: -10 - Math.random() * H * 0.3,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        g: 0.07,
        r: Math.random() * 4 + 2,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        life: 120,
        maxLife: 120,
        shape: "rect",
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  // Ekran sarsıntısı tetikle (mag = piksel cinsinden şiddet).
  function screenShake(mag = 6) {
    if (reduceMotion) return;
    shake = Math.max(shake, mag);
  }

  return { init, burst, confetti, screenShake };
})();

// Klasik <script> içinde top-level `const` window'a bağlanmaz; açıkça bağla.
window.Effects = Effects;
