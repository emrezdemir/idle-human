/* =========================================================
   Idle Human — prosedürel 3D çağ sahnesi (avatar3d.js)
   Three.js ile KODLA üretilen (indirilen model yok) bir "mekan":
   her çağı temsil eden zemin + gökyüzü + sis + birkaç temalı obje ve
   ortada karakter. Sahne yavaşça döner (turntable), dokununca karakter
   zıplar (sınırlı — ekrandan kaçmaz). WebGL/Three yoksa devreye girmez;
   game.js 2D butona + SVG figüre güvenle düşer.

   API: window.Avatar3D = { available, tryMount(container, eraIndex),
                            setEra(i), bounce() }
   ========================================================= */

"use strict";

(() => {
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
  const HEAD_Y = 1.15, HEAD_R = 0.6;

  // Çağ id -> karakter (gövde + tepe aksesuarı) ve mekan (zemin/gök/objeler)
  const ORDER = ["stone","hunter","agri","antiquity","medieval","renaissance","industrial","info","space","galactic"];
  const ERA3D = {
    stone:       { body:0x6b4226, top:"cap",    tc:0x3b2a1a, ground:0x6b5436, sky:0x241d2e,
                   props:[["rock",0x6b5e50,[-1.7,-0.55,-0.4],0.55],["rock",0x5a4e42,[1.6,-0.6,-0.7],0.8],["rock",0x6b5e50,[1.2,-0.62,0.7],0.4]] },
    hunter:      { body:0x5a4a2a, top:"band",   tc:0x3b2a1a, ground:0x5a6b32, sky:0x2c3624,
                   props:[["bush",0x4a6b2a,[-1.7,-0.5,-0.4],0.7],["cone",0x3a5a22,[1.7,-0.1,-0.6],1.0],["rock",0x6b5e50,[1.3,-0.62,0.7],0.4]] },
    agri:        { body:0x6b8e3a, top:"cone",   tc:0xcaa24a, ground:0x4f8a3a, sky:0x5a7a3a,
                   props:[["cone",0xe6c85a,[-1.6,-0.1,-0.3],0.7],["cone",0xe6c85a,[-1.2,-0.15,0.5],0.6],["cone",0xe6c85a,[1.6,-0.1,-0.5],0.7]] },
    antiquity:   { body:0xe8e2d0, top:"laurel", tc:0x5a8a3a, ground:0xcfc3a0, sky:0x7a6a44,
                   props:[["column",0xeee6d2,[-1.8,0.0,-0.5],1.0],["column",0xeee6d2,[1.8,0.0,-0.5],1.0],["column",0xeee6d2,[1.8,0.0,0.8],0.9]] },
    medieval:    { body:0x6b7280, top:"helmet", tc:0xaeb4c2, ground:0x5a6070, sky:0x33303c,
                   props:[["tower",0x6b6f7a,[-1.8,0.1,-0.6],1.0],["tower",0x6b6f7a,[1.8,0.1,-0.4],0.9],["rock",0x4a4f58,[1.2,-0.62,0.8],0.4]] },
    renaissance: { body:0x7a3050, top:"beret",  tc:0x3a2030, ground:0x6a4858, sky:0x3a2838,
                   props:[["arch",0xc98aa0,[-1.7,0.2,-0.6],1.0],["column",0xd8c0c8,[1.8,0.0,-0.3],0.9]] },
    industrial:  { body:0x3a3a42, top:"tophat", tc:0x26262e, ground:0x4a4a52, sky:0x32323a,
                   props:[["chimney",0x5a4a42,[-1.8,0.3,-0.6],1.0],["gear",0xcaa24a,[1.7,0.2,-0.3],0.9],["chimney",0x5a4a42,[1.5,0.2,0.8],0.7]] },
    info:        { body:0x2a6b7a, top:"band",   tc:0x1b2a33, ground:0x16323c, sky:0x0f2630,
                   props:[["monitor",0x0f3b45,[-1.8,0.0,-0.4],1.0],["monitor",0x0f3b45,[1.8,0.0,-0.4],1.0],["orb",0x36d1dc,[0,1.8,-1.2],0.4]] },
    space:       { body:0xdfe6f5, top:"dome",   tc:0xbcd0ff, ground:0x2a3052, sky:0x07071a,
                   props:[["planet",0x4a6bd0,[-1.9,1.4,-1.4],0.8],["orb",0xffe08a,[1.7,1.7,-1.0],0.25],["orb",0xffffff,[1.0,2.1,-1.5],0.12]] },
    galactic:    { body:0x9b59ff, top:"halo",   tc:0x36d1dc, ground:0x2a1840, sky:0x0a0018,
                   props:[["ring",0x9b59ff,[0,1.6,-1.3],1.2],["orb",0x36d1dc,[-1.8,1.0,-0.8],0.3],["orb",0xff7bf0,[1.8,1.3,-0.9],0.3]] },
  };

  let renderer, scene, camera, world, figure, env, raf = 0;
  let running = false, mounted = false, host = null;
  let posY = 0, vy = 0, squash = 0;

  function mat(color, opts = {}) {
    return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.7, metalness: 0.1 }, opts));
  }
  function dispose(obj) {
    if (!obj) return;
    obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    if (obj.parent) obj.parent.remove(obj);
  }

  /* --- Karakter --- */
  function buildTopper(kind, tc) {
    const g = new THREE.Group(); let m;
    switch (kind) {
      case "cap": m = new THREE.Mesh(new THREE.SphereGeometry(0.62,16,16), mat(tc,{roughness:0.9})); m.scale.set(1,0.55,1); m.position.y=HEAD_Y+0.32; g.add(m); break;
      case "band": m = new THREE.Mesh(new THREE.TorusGeometry(0.6,0.08,10,28), mat(tc)); m.rotation.x=Math.PI/2; m.position.y=HEAD_Y+0.12; g.add(m); break;
      case "cone": { const t=new THREE.Mesh(new THREE.ConeGeometry(0.7,0.55,24), mat(tc,{roughness:0.95})); t.position.y=HEAD_Y+0.55; g.add(t); const b=new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.05,24), mat(tc,{roughness:0.95})); b.position.y=HEAD_Y+0.32; g.add(b); break; }
      case "laurel": m=new THREE.Mesh(new THREE.TorusGeometry(0.58,0.07,8,28), mat(tc,{roughness:0.7})); m.rotation.x=1.2; m.position.y=HEAD_Y+0.2; g.add(m); break;
      case "helmet": m=new THREE.Mesh(new THREE.SphereGeometry(0.68,24,24), mat(tc,{metalness:0.7,roughness:0.3})); m.scale.set(1,1.05,1); m.position.y=HEAD_Y+0.08; g.add(m); break;
      case "beret": m=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.62,0.2,24), mat(tc)); m.rotation.z=0.32; m.position.set(0.12,HEAD_Y+0.42,0); g.add(m); break;
      case "tophat": { const c=new THREE.Mesh(new THREE.CylinderGeometry(0.46,0.46,0.7,24), mat(tc,{roughness:0.5})); c.position.y=HEAD_Y+0.7; g.add(c); const b=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.07,24), mat(tc,{roughness:0.5})); b.position.y=HEAD_Y+0.4; g.add(b); break; }
      case "dome": m=new THREE.Mesh(new THREE.SphereGeometry(0.82,24,24), mat(tc,{transparent:true,opacity:0.28,roughness:0.1,metalness:0.2})); m.position.y=HEAD_Y; g.add(m); break;
      case "halo": m=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.07,12,32), mat(tc,{emissive:new THREE.Color(tc),emissiveIntensity:0.8,roughness:0.4})); m.rotation.x=Math.PI/2; m.position.y=HEAD_Y+0.85; g.add(m); break;
    }
    return g;
  }
  function buildFigure(cfg) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.78,1.35,28), mat(cfg.body)); g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R,28,28), mat(SKIN,{roughness:0.8})); head.position.y=HEAD_Y; g.add(head);
    const eyeMat = mat(0x2a2030,{roughness:0.5});
    for (const dx of [-0.2,0.2]) { const e=new THREE.Mesh(new THREE.SphereGeometry(0.08,10,10), eyeMat); e.position.set(dx,HEAD_Y+0.05,HEAD_R-0.02); g.add(e); }
    g.add(buildTopper(cfg.top, cfg.tc));
    return g;
  }

  /* --- Mekan (zemin + objeler) --- */
  function makeProp(type, color, scale) {
    const s = scale || 1;
    switch (type) {
      case "rock": { const m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.5*s,0), mat(color,{flatShading:true,roughness:0.95})); return m; }
      case "bush": { const m=new THREE.Mesh(new THREE.SphereGeometry(0.5*s,12,12), mat(color,{roughness:0.95})); return m; }
      case "cone": { const m=new THREE.Mesh(new THREE.ConeGeometry(0.3*s,0.95*s,10), mat(color,{roughness:0.9})); return m; }
      case "column": { const g=new THREE.Group(); const c=new THREE.Mesh(new THREE.CylinderGeometry(0.22*s,0.24*s,1.6*s,16), mat(color)); g.add(c); const cap=new THREE.Mesh(new THREE.BoxGeometry(0.55*s,0.18*s,0.55*s), mat(color)); cap.position.y=0.85*s; g.add(cap); return g; }
      case "tower": { const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(0.7*s,1.4*s,0.7*s), mat(color)); g.add(b); const r=new THREE.Mesh(new THREE.ConeGeometry(0.55*s,0.6*s,4), mat(0x8a3a3a)); r.position.y=1.0*s; r.rotation.y=Math.PI/4; g.add(r); return g; }
      case "arch": { const m=new THREE.Mesh(new THREE.TorusGeometry(0.7*s,0.14*s,10,20,Math.PI), mat(color)); m.position.y=0.2*s; return m; }
      case "chimney": { const m=new THREE.Mesh(new THREE.CylinderGeometry(0.28*s,0.34*s,1.8*s,16), mat(color,{roughness:0.95})); return m; }
      case "gear": { const m=new THREE.Mesh(new THREE.TorusGeometry(0.45*s,0.18*s,6,12), mat(color,{metalness:0.5,roughness:0.4})); m.rotation.x=Math.PI/2; return m; }
      case "monitor": { const m=new THREE.Mesh(new THREE.BoxGeometry(0.9*s,0.6*s,0.12*s), mat(color,{emissive:new THREE.Color(0x36d1dc),emissiveIntensity:0.5})); return m; }
      case "planet": { const m=new THREE.Mesh(new THREE.SphereGeometry(0.6*s,20,20), mat(color,{roughness:0.6})); return m; }
      case "orb": { const m=new THREE.Mesh(new THREE.SphereGeometry(0.5*s,16,16), mat(color,{emissive:new THREE.Color(color),emissiveIntensity:0.9,roughness:0.4})); return m; }
      case "ring": { const m=new THREE.Mesh(new THREE.TorusGeometry(0.8*s,0.06*s,12,40), mat(color,{emissive:new THREE.Color(color),emissiveIntensity:0.7})); m.rotation.x=1.1; return m; }
      default: return new THREE.Mesh(new THREE.SphereGeometry(0.4*s,8,8), mat(color));
    }
  }
  function buildEnv(cfg) {
    const g = new THREE.Group();
    // zemin platformu (disk)
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.7,0.5,48), mat(cfg.ground,{roughness:1}));
    ground.position.y = -0.95; g.add(ground);
    // objeler
    (cfg.props || []).forEach(([type,color,pos,scale]) => {
      const p = makeProp(type,color,scale);
      p.position.set(pos[0],pos[1],pos[2]);
      g.add(p);
    });
    return g;
  }

  function applyEra(eraIndex) {
    const id = ORDER[Math.max(0, Math.min(ORDER.length-1, eraIndex))];
    const cfg = ERA3D[id] || ERA3D.stone;
    dispose(figure); dispose(env);
    env = buildEnv(cfg); world.add(env);
    figure = buildFigure(cfg); world.add(figure);
    scene.background = new THREE.Color(cfg.sky);
    if (scene.fog) { scene.fog.color.setHex(cfg.sky); }
    else scene.fog = new THREE.Fog(cfg.sky, 6.5, 15);
  }

  function setEra(eraIndex) { if (mounted) applyEra(eraIndex); }

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const t = performance.now() / 1000;

    // sınırlı zıplama: pozisyon tavanı var, birikip kaçamaz
    posY += vy; vy -= 0.014;
    if (posY < 0) { posY = 0; vy *= -0.3; if (Math.abs(vy) < 0.01) vy = 0; }
    if (posY > 0.6) { posY = 0.6; if (vy > 0) vy = 0; } // TAVAN — ekrandan kaçmaz
    squash *= 0.9;

    if (world) world.rotation.y = t * 0.25;           // mekan turntable
    if (figure) {
      figure.position.y = posY + Math.sin(t*1.6)*0.04; // nefes/bob
      const sx = 1 + 0.14*squash, sy = 1 - 0.18*squash;
      figure.scale.set(sx, sy, sx);
    }
    renderer.render(scene, camera);
  }

  function sizeOf() {
    const w = (host && host.clientWidth) || 320;
    const h = (host && host.clientHeight) || 220;
    return { w: Math.max(120, w), h: Math.max(120, h) };
  }

  function tryMount(container, eraIndex) {
    if (!container || mounted || !webglOK()) return false;
    host = container;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) { return false; }
    const { w, h } = sizeOf();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.domElement.className = "stage3d-canvas";

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.3, 5.4);
    camera.lookAt(0, 0.5, 0);

    scene.add(new THREE.AmbientLight(0xb6b0d0, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(2.5,4,3); scene.add(key);
    const rim = new THREE.DirectionalLight(0x7c5cff, 0.55); rim.position.set(-3,1.5,-2); scene.add(rim);

    world = new THREE.Group(); scene.add(world);
    applyEra(eraIndex);

    container.appendChild(renderer.domElement);
    mounted = true; running = true;
    frame();

    document.addEventListener("visibilitychange", () => { running = !document.hidden && mounted; if (running) frame(); });
    window.addEventListener("resize", () => {
      if (!mounted) return;
      const s = sizeOf();
      renderer.setSize(s.w, s.h, false);
      camera.aspect = s.w / s.h; camera.updateProjectionMatrix();
    });
    return true;
  }

  function bounce() {
    if (!mounted) return;
    // birikmeyi önle: yalnızca yerdeyken/inişteyken yeni zıplama ver
    if (posY < 0.05 || vy <= 0) vy = 0.16;
    squash = 1;
  }

  window.Avatar3D = { available: webglOK(), tryMount, setEra, bounce };
})();
