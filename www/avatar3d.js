/* =========================================================
   Idle Human — prosedürel 3D avatar (avatar3d.js)
   Three.js ile, KODLA üretilen (indirilen model yok) düşük-poligon
   karakter. Tıklama butonunun içinde küçük bir 3D sahne olarak çalışır:
   çağa göre gövde rengi + tepe aksesuarı değişir, hafifçe döner ve
   dokununca zıplar (squash & stretch). WebGL/Three yoksa hiç devreye
   girmez; game.js SVG figürüne (eras-art.js) güvenle düşer.

   API: window.Avatar3D = { available, tryMount(container, eraIndex),
                            setEra(i), bounce() }
   ========================================================= */

"use strict";

(() => {
  // Three yoksa modülü pasif bırak.
  if (!window.THREE) {
    window.Avatar3D = { available: false, tryMount: () => false, setEra() {}, bounce() {} };
    return;
  }

  function webglOK() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  const SKIN = 0xe8b98f;

  // Çağ id -> 3D görünüm: gövde rengi, tepe aksesuarı türü + rengi.
  const ERA3D = {
    stone:       { body: 0x6b4226, top: "cap",    tc: 0x3b2a1a },
    hunter:      { body: 0x5a4a2a, top: "band",   tc: 0x3b2a1a },
    agri:        { body: 0x6b8e3a, top: "cone",   tc: 0xcaa24a },
    antiquity:   { body: 0xe8e2d0, top: "laurel", tc: 0x5a8a3a },
    medieval:    { body: 0x6b7280, top: "helmet", tc: 0xaeb4c2 },
    renaissance: { body: 0x7a3050, top: "beret",  tc: 0x3a2030 },
    industrial:  { body: 0x3a3a42, top: "tophat", tc: 0x26262e },
    info:        { body: 0x2a6b7a, top: "band",   tc: 0x1b2a33 },
    space:       { body: 0xdfe6f5, top: "dome",   tc: 0xbcd0ff },
    galactic:    { body: 0x9b59ff, top: "halo",   tc: 0x36d1dc },
  };
  const ORDER = ["stone","hunter","agri","antiquity","medieval","renaissance","industrial","info","space","galactic"];

  let renderer, scene, camera, group, raf = 0;
  let running = false, mounted = false;
  const HEAD_Y = 1.15, HEAD_R = 0.6;

  // Zıplama durumu
  let posY = 0, vy = 0, squash = 0, spin = 0;

  function mat(color, opts = {}) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color, roughness: 0.6, metalness: 0.1,
    }, opts));
  }

  function disposeGroup(g) {
    if (!g) return;
    g.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    scene.remove(g);
  }

  function buildTopper(kind, tc) {
    const g = new THREE.Group();
    let m;
    switch (kind) {
      case "cap": // dağınık saç / kafa kapağı
        m = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 16), mat(tc, { roughness: 0.9 }));
        m.scale.set(1, 0.55, 1); m.position.y = HEAD_Y + 0.32; g.add(m); break;
      case "band": // baş bandı / kulaklık bandı
        m = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 10, 28), mat(tc));
        m.rotation.x = Math.PI / 2; m.position.y = HEAD_Y + 0.12; g.add(m); break;
      case "cone": { // hasır şapka
        const top = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.55, 24), mat(tc, { roughness: 0.95 }));
        top.position.y = HEAD_Y + 0.55; g.add(top);
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 24), mat(tc, { roughness: 0.95 }));
        brim.position.y = HEAD_Y + 0.32; g.add(brim); break;
      }
      case "laurel": // defne tacı (eğik ince halka)
        m = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.07, 8, 28), mat(tc, { roughness: 0.7 }));
        m.rotation.x = 1.2; m.position.y = HEAD_Y + 0.2; g.add(m); break;
      case "helmet": // metalik miğfer
        m = new THREE.Mesh(new THREE.SphereGeometry(0.68, 24, 24), mat(tc, { metalness: 0.7, roughness: 0.3 }));
        m.scale.set(1, 1.05, 1); m.position.y = HEAD_Y + 0.08; g.add(m); break;
      case "beret": // eğik bere
        m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.62, 0.2, 24), mat(tc));
        m.rotation.z = 0.32; m.position.set(0.12, HEAD_Y + 0.42, 0); g.add(m); break;
      case "tophat": { // silindir şapka
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.7, 24), mat(tc, { roughness: 0.5 }));
        crown.position.y = HEAD_Y + 0.7; g.add(crown);
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.07, 24), mat(tc, { roughness: 0.5 }));
        brim.position.y = HEAD_Y + 0.4; g.add(brim); break;
      }
      case "dome": // uzay kaskı (saydam kubbe)
        m = new THREE.Mesh(new THREE.SphereGeometry(0.82, 24, 24),
          mat(tc, { transparent: true, opacity: 0.28, roughness: 0.1, metalness: 0.2 }));
        m.position.y = HEAD_Y; g.add(m); break;
      case "halo": // galaktik halka (parlayan)
        m = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 12, 32),
          mat(tc, { emissive: new THREE.Color(tc), emissiveIntensity: 0.8, roughness: 0.4 }));
        m.rotation.x = Math.PI / 2; m.position.y = HEAD_Y + 0.85; g.add(m); break;
    }
    return g;
  }

  function buildFigure(eraIndex) {
    const id = ORDER[Math.max(0, Math.min(ORDER.length - 1, eraIndex))];
    const cfg = ERA3D[id] || ERA3D.stone;
    const g = new THREE.Group();

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.78, 1.35, 28), mat(cfg.body));
    body.position.y = 0; g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 28, 28), mat(SKIN, { roughness: 0.8 }));
    head.position.y = HEAD_Y; g.add(head);

    // basit yüz: iki koyu göz
    const eyeMat = mat(0x2a2030, { roughness: 0.5 });
    for (const dx of [-0.2, 0.2]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), eyeMat);
      eye.position.set(dx, HEAD_Y + 0.05, HEAD_R - 0.02);
      g.add(eye);
    }

    g.add(buildTopper(cfg.top, cfg.tc));
    return g;
  }

  function setEra(eraIndex) {
    if (!mounted) return;
    disposeGroup(group);
    group = buildFigure(eraIndex);
    scene.add(group);
  }

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const t = performance.now() / 1000;

    // Zıplama fiziği
    posY += vy; vy -= 0.012;
    if (posY < 0) { posY = 0; vy *= -0.35; if (Math.abs(vy) < 0.01) vy = 0; }
    squash *= 0.9;

    if (group) {
      group.rotation.y = t * 0.6 + spin;
      group.position.y = posY + Math.sin(t * 1.6) * 0.04; // hafif nefes/bob
      const sx = 1 + 0.14 * squash;
      const sy = 1 - 0.18 * squash;
      group.scale.set(sx, sy, sx);
    }
    renderer.render(scene, camera);
  }

  function tryMount(container, eraIndex) {
    if (!container || mounted) return mounted;
    if (!webglOK()) return false;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) {
      return false; // WebGL bağlamı yok — SVG'de kal
    }
    const size = Math.max(96, container.clientWidth || 150);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size, false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "avatar3d-canvas";

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.6, 4.6);
    camera.lookAt(0, 0.5, 0);

    scene.add(new THREE.AmbientLight(0xb6b0d0, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(2.5, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7c5cff, 0.5);
    rim.position.set(-3, 1, -2);
    scene.add(rim);

    group = buildFigure(eraIndex);
    scene.add(group);

    // SVG avatarı gizle, 3D tuvali butona yerleştir
    const emoji = document.getElementById("clickEmoji");
    if (emoji) emoji.style.display = "none";
    container.appendChild(renderer.domElement);

    mounted = true;
    running = true;
    frame();

    document.addEventListener("visibilitychange", () => {
      running = !document.hidden && mounted;
      if (running) frame();
    });
    window.addEventListener("resize", () => {
      if (!mounted) return;
      const s = Math.max(96, container.clientWidth || 150);
      renderer.setSize(s, s, false);
    });
    return true;
  }

  function bounce() {
    if (!mounted) return;
    vy = 0.13;       // zıpla
    squash = 1;      // squash & stretch
    spin += 0.5;     // hafif ekstra dönüş
  }

  window.Avatar3D = { available: webglOK(), tryMount, setEra, bounce };
})();
