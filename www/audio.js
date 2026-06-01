/* =========================================================
   Idle Human — ses motoru (audio.js)
   Web Audio API ile dosyasız, prosedürel ses efektleri.
   Tüm tonlar çalışma anında sentezlenir; hiçbir ses dosyası yüklenmez.
   ========================================================= */

"use strict";

const SFX = (() => {
  let ctx = null;
  let masterGain = null;
  let enabled = true;
  let musicNode = null; // arka plan ambiyans düğümü (varsa)

  // Tarayıcı, kullanıcı etkileşimine kadar AudioContext'i askıya alır.
  function ensure() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      ctx = new Ctx();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.9;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return true;
  }

  function setEnabled(on) {
    enabled = on;
    if (!on) stopMusic();
  }

  // Tek bir osilatör tonu (ADSR benzeri yumuşak zarf ile).
  function tone(freq, dur, type = "sine", vol = 0.1, when = 0) {
    if (!enabled || !ensure()) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); // hızlı atak
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // sönüm
    osc.connect(g).connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // Frekansı yukarı/aşağı kaydıran "sweep" tonu.
  function sweep(f1, f2, dur, type = "sawtooth", vol = 0.08, when = 0) {
    if (!enabled || !ensure()) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // Kısa gürültü patlaması (vurmalı/"pop" hissi için).
  function noise(dur, vol = 0.06, when = 0) {
    if (!enabled || !ensure()) return;
    const t0 = ctx.currentTime + when;
    const frames = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames); // sönen gürültü
    }
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    g.gain.value = vol;
    src.buffer = buf;
    src.connect(g).connect(masterGain);
    src.start(t0);
  }

  /* --- Oyun olayları için hazır sesler --- */

  // Tıklama: combo arttıkça perde yükselir (0..1 yoğunluk).
  function click(intensity = 0) {
    const base = 380 + intensity * 520;
    tone(base + Math.random() * 40, 0.07, "triangle", 0.07);
    if (intensity > 0.5) tone(base * 1.5, 0.05, "sine", 0.03, 0.01);
  }

  // Üretici/yükseltme satın alma: yükselen iki notalı akor.
  function buy() {
    tone(523.25, 0.09, "square", 0.05); // C5
    tone(783.99, 0.11, "square", 0.05, 0.06); // G5
  }

  // Yükseltme: küçük bir fanfar.
  function upgrade() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, 0.14, "triangle", 0.06, i * 0.06)
    );
  }

  // Başarım: parlak arpej + tıngırtı.
  function achievement() {
    [659.25, 830.61, 987.77, 1318.5].forEach((f, i) =>
      tone(f, 0.18, "sine", 0.09, i * 0.08)
    );
    noise(0.15, 0.03, 0.1);
  }

  // Prestij: aşağıdan yukarı süpüren epik geçiş.
  function prestige() {
    sweep(110, 880, 0.8, "sawtooth", 0.08);
    [261.63, 329.63, 392, 523.25].forEach((f, i) =>
      tone(f, 0.6, "sine", 0.07, 0.3 + i * 0.05)
    );
    noise(0.5, 0.04, 0.3);
  }

  // Çağ/dönüm noktası açılışı: yumuşak çan.
  function milestone() {
    tone(880, 0.5, "sine", 0.08);
    tone(1108.7, 0.5, "sine", 0.05, 0.04);
  }

  /* --- İsteğe bağlı arka plan ambiyansı --- */

  function startMusic() {
    if (!enabled || !ensure() || musicNode) return;
    // İki hafif detone osilatörden oluşan, çok kısık bir "pad".
    const g = ctx.createGain();
    g.gain.value = 0.018;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = "sine";
    o2.type = "sine";
    o1.frequency.value = 110; // A2
    o2.frequency.value = 110 * 1.5; // E3
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 0.008;
    lfo.connect(lfoGain).connect(g.gain);
    o1.connect(g);
    o2.connect(g);
    g.connect(masterGain);
    o1.start();
    o2.start();
    lfo.start();
    musicNode = { o1, o2, lfo, g };
  }

  function stopMusic() {
    if (!musicNode) return;
    try {
      musicNode.o1.stop();
      musicNode.o2.stop();
      musicNode.lfo.stop();
    } catch (e) {
      /* yoksay */
    }
    musicNode = null;
  }

  return {
    ensure,
    setEnabled,
    click,
    buy,
    upgrade,
    achievement,
    prestige,
    milestone,
    startMusic,
    stopMusic,
  };
})();

// Klasik <script> içinde top-level `const` window'a bağlanmaz; açıkça bağla.
window.SFX = SFX;
