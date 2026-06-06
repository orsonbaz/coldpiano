/* ============================================================
   COLD PIANO — piano.js
   A procedural grand piano rendered in WebGL (Three.js), driven
   by scroll position. The piano opens its lid and is orbited by
   the camera as the reader moves through the opening sections,
   then fades out so the data sections sit on a clean field.

   Builds nothing if Three.js failed to load or reduced motion is
   requested (in which case a single still frame is drawn).
   ============================================================ */
(function () {
  "use strict";
  if (typeof THREE === "undefined") return;

  const canvas = document.getElementById("pianoStage");
  if (!canvas) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp01 = x => Math.max(0, Math.min(1, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ("outputEncoding" in renderer) renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight(0xaecfe0, 0x0a0f12, 0.55);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xdfeeff, 0.92); // cold key light
  key.position.set(-5, 8, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 30;
  key.shadow.camera.left = -6; key.shadow.camera.right = 6;
  key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
  key.shadow.bias = -0.0008;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x9fb8c6, 0.4); // cold rim from behind
  rim.position.set(4, 3, -6);
  scene.add(rim);

  // warm light that lives inside the case, read as the soundboard glow
  const warm = new THREE.PointLight(0xffae5e, 0.0, 8, 2);
  // added to the piano group below, so it travels with the case

  /* ---------- materials ---------- */
  const black = new THREE.MeshStandardMaterial({ color: 0x0a0c0e, metalness: 0.55, roughness: 0.32 });
  const blackSoft = new THREE.MeshStandardMaterial({ color: 0x0c0f12, metalness: 0.3, roughness: 0.5 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1f, metalness: 0.25, roughness: 0.55, emissive: 0x2a1606, emissiveIntensity: 0.45 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xeef1f0, metalness: 0.05, roughness: 0.6 });
  const ebony = new THREE.MeshStandardMaterial({ color: 0x111417, metalness: 0.2, roughness: 0.5 });
  const ice = new THREE.MeshStandardMaterial({ color: 0x6f7d86, metalness: 0.0, roughness: 0.96 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xb98a4e, metalness: 0.7, roughness: 0.35 });

  /* ---------- the grand piano ---------- */
  const piano = new THREE.Group();
  scene.add(piano);

  // interior glow lives with the case (front edge at z=0, tail at z=-L)
  warm.position.set(-0.1, 1.2, -1.7);
  piano.add(warm);

  const W = 2.2;        // width (left-right)
  const L = 3.5;        // length (front-back)
  const CASE = 0.5;     // body height
  const LEG = 0.95;     // leg length
  const baseY = LEG;    // body underside height

  // top-down wing silhouette
  const wing = new THREE.Shape();
  wing.moveTo(-W / 2, 0);
  wing.lineTo(-W / 2, L * 0.80);
  wing.quadraticCurveTo(-W / 2, L, -W / 2 + 0.55, L);
  wing.quadraticCurveTo(0.05 * W, L + 0.06, 0.2 * W, L * 0.9);
  wing.bezierCurveTo(0.64 * W, L * 0.66, 0.7 * W, L * 0.3, W / 2, 0.02);
  wing.lineTo(-W / 2, 0);

  function wingGeo(depth) {
    const g = new THREE.ExtrudeGeometry(wing, { depth: depth, bevelEnabled: false, curveSegments: 48 });
    g.rotateX(-Math.PI / 2);            // lay flat: extrude (height) now along +Y
    return g;
  }

  // body: black walls, warm soundboard as the top cap (revealed by the lid).
  // ExtrudeGeometry group 0 = the flat faces (top/bottom), group 1 = the walls.
  const body = new THREE.Mesh(wingGeo(CASE), [wood, black]);
  body.position.y = baseY;
  body.castShadow = true; body.receiveShadow = true;
  piano.add(body);

  // brass strings laid across the soundboard, revealed when the lid lifts
  // (case runs from the front edge at z=0 back to the tail at z=-L)
  const strings = new THREE.Group();
  strings.position.y = baseY + CASE + 0.012;
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, L * 0.52), brass);
    s.position.set(-W * 0.30 + i * (W * 0.6 / 6), 0, -L * 0.46);
    strings.add(s);
  }
  piano.add(strings);

  // lid: outer wing, thin, hinged along the spine (x = -W/2, running along z)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(-W / 2, baseY + CASE, 0);
  const lid = new THREE.Mesh(wingGeo(0.06), black);
  lid.position.set(W / 2, 0.0, 0); // shift so its spine edge sits at the pivot
  lid.castShadow = true;
  lidPivot.add(lid);
  piano.add(lidPivot);

  // keyboard: a key bed across the front edge, with keys
  const kbWidth = W * 0.82, kbDepth = 0.42;
  const keyBed = new THREE.Mesh(new THREE.BoxGeometry(kbWidth + 0.08, 0.12, kbDepth + 0.06), blackSoft);
  keyBed.position.set(-0.02, baseY + 0.04, -0.02);
  keyBed.castShadow = true;
  piano.add(keyBed);

  const keys = new THREE.Group();
  const nKeys = 22, kw = kbWidth / nKeys;
  for (let i = 0; i < nKeys; i++) {
    const k = new THREE.Mesh(new THREE.BoxGeometry(kw * 0.86, 0.05, kbDepth), ivory);
    k.position.set(-kbWidth / 2 + kw * (i + 0.5), baseY + 0.11, -0.02);
    keys.add(k);
    // black keys in the usual 5-of-7 pattern
    const pat = i % 7;
    if (pat === 0 || pat === 1 || pat === 3 || pat === 4 || pat === 5) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(kw * 0.5, 0.06, kbDepth * 0.62), ebony);
      b.position.set(-kbWidth / 2 + kw * (i + 1), baseY + 0.145, -0.02 - kbDepth * 0.16);
      keys.add(b);
    }
  }
  piano.add(keys);

  // legs (front-left, front-right, tail) + lyre-ish stub
  function leg(x, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, LEG, 14), black);
    m.position.set(x, LEG / 2, z);
    m.castShadow = true;
    piano.add(m);
  }
  leg(-W / 2 + 0.16, -0.12);          // front-left corner
  leg(W / 2 - 0.16, -0.12);           // front-right corner
  leg(-W / 2 + 0.55, -L * 0.86);      // tail

  // bench, in front of the keyboard (toward the player / camera)
  const bench = new THREE.Mesh(new THREE.BoxGeometry(W * 0.7, 0.07, 0.4), blackSoft);
  bench.position.set(-0.05, baseY * 0.62, 0.95);
  bench.castShadow = true;
  piano.add(bench);
  [[-W * 0.3, 0.78], [W * 0.28, 0.78], [-W * 0.3, 1.12], [W * 0.28, 1.12]].forEach(([x, z]) => {
    const bl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, baseY * 0.62, 10), blackSoft);
    bl.position.set(x, baseY * 0.31, z); bl.castShadow = true; piano.add(bl);
  });

  // ice platform
  const platform = new THREE.Mesh(new THREE.BoxGeometry(W * 2.3, 0.18, L * 1.5), ice);
  platform.position.set(0, -0.09, L * 0.42);
  platform.receiveShadow = true;
  scene.add(platform);

  // recenter the whole piano around the world origin (roughly its mass center)
  piano.position.set(0.1, 0, -L * 0.42);
  platform.position.z = 0;

  /* ---------- scroll choreography ----------
     Camera waypoints keyed by a "phase" 0..4 that tracks the scene:
       0  hero (cover)
       1  glacial air      — pulled back, the air all around
       2  the water        — low, skimming the ice and the sea around it
       3  the wooden body  — in close on the case
       4  the cold metal   — zoomed into the open lid, onto the strings
     The phase is driven by which scene accord is centred, so the 3D
     move stays in step with the highlighted text. */
  // tz aims the look-target along the piano (front of the case is near z=-1.5
  // in world space, the soundboard strings are deeper, near z=-3).
  const stops = [
    { r: 7.2, theta:  0.52, phi: 1.02, ty: 1.15, tz:  0.0, lid: 0.00 },
    { r: 9.3, theta:  0.18, phi: 0.97, ty: 1.30, tz: -1.6, lid: 0.20 },
    { r: 7.4, theta: -0.34, phi: 1.31, ty: 0.42, tz: -2.0, lid: 0.55 },
    { r: 4.8, theta: -0.58, phi: 1.00, ty: 1.10, tz: -2.6, lid: 0.95 },
    { r: 3.3, theta: -0.20, phi: 0.66, ty: 1.45, tz: -3.0, lid: 1.22 }
  ];
  const lerpStop = (a, b, t) => ({
    r: lerp(a.r, b.r, t), theta: lerp(a.theta, b.theta, t),
    phi: lerp(a.phi, b.phi, t), ty: lerp(a.ty, b.ty, t),
    tz: lerp(a.tz, b.tz, t), lid: lerp(a.lid, b.lid, t)
  });
  function sample(phase) {
    const i = Math.max(0, Math.min(stops.length - 2, Math.floor(phase)));
    const t = clamp01(phase - i);
    return lerpStop(stops[i], stops[i + 1], t * t * (3 - 2 * t));
  }

  let phase = 0, stageOpacity = 0;
  function readScroll() {
    const vh = window.innerHeight || 1;
    const c = window.scrollY + vh * 0.5;          // viewport centre, document coords
    const Yc = vh * 0.5;
    const origin = document.getElementById("origin");
    const scene = document.getElementById("scene");
    const materials = document.getElementById("materials");
    const originTop = origin ? origin.offsetTop : vh;
    const sceneTop = scene ? scene.offsetTop : vh * 2;

    // phase from whichever scene accord is nearest the viewport centre
    const layers = scene ? scene.querySelectorAll(".scene-layer") : [];
    if (layers.length) {
      const centers = [];
      layers.forEach(el => { const r = el.getBoundingClientRect(); centers.push(r.top + r.height / 2); });
      const n = centers.length;
      if (Yc <= centers[0]) {
        phase = 1 - clamp01((centers[0] - Yc) / vh);        // approach hero -> air
      } else if (Yc >= centers[n - 1]) {
        phase = n;                                           // last accord
      } else {
        let k = 0;
        for (let i = 0; i < n - 1; i++) { if (Yc >= centers[i] && Yc <= centers[i + 1]) { k = i; break; } }
        phase = 1 + k + (Yc - centers[k]) / Math.max(centers[k + 1] - centers[k], 1);
      }
    } else {
      phase = clamp01((c - originTop) / Math.max(sceneTop - originTop, 1));
    }
    phase = Math.max(0, Math.min(stops.length - 1, phase));

    // opacity: hero full, dip while reading origin, lift through the scene,
    // then clear out as the materials section arrives
    const dip  = smooth(originTop - vh * 0.35, originTop + vh * 0.30, c);
    const lift = smooth(sceneTop - vh * 0.35, sceneTop + vh * 0.15, c);
    let op = 1 - dip * 0.55 + lift * 0.20;                  // ~1 -> ~0.45 -> ~0.65
    if (materials) {
      const mTop = materials.getBoundingClientRect().top;
      op *= 1 - smooth(vh * 0.55, vh * 0.05, mTop);         // fade as materials reaches the top
    }
    stageOpacity = clamp01(op);
    canvas.style.opacity = stageOpacity.toFixed(3);
  }

  function applyFrame(time) {
    const f = sample(phase);

    // gentle idle, eased down as we zoom in so the close shots stay steady
    const calm = 1 - clamp01((phase - 2.5) / 1.5);
    const idleT = reduce ? 0 : Math.sin(time * 0.00035) * 0.022 * calm;
    const idleY = reduce ? 0 : Math.sin(time * 0.0005) * 0.014 * calm;
    const theta = f.theta + idleT;

    const target = new THREE.Vector3(0, f.ty + idleY, f.tz);
    const r = f.r;
    camera.position.set(
      target.x + r * Math.sin(f.phi) * Math.sin(theta),
      target.y + r * Math.cos(f.phi),
      target.z + r * Math.sin(f.phi) * Math.cos(theta)
    );
    camera.lookAt(target);

    // lid opening + interior glow (rises as the lid lifts toward the metal)
    lidPivot.rotation.z = f.lid;
    warm.intensity = clamp01((f.lid - 0.25) / 0.75) * 1.7;
  }

  /* ---------- sizing ---------- */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ---------- loop ---------- */
  let raf = null, lastScrollY = -1;
  function render(time) {
    raf = requestAnimationFrame(render);
    if (stageOpacity < 0.01 && !(reduce)) {
      // still update progress reading cheaply, skip drawing when invisible
      if (window.scrollY !== lastScrollY) { lastScrollY = window.scrollY; readScroll(); }
      return;
    }
    applyFrame(time);
    renderer.render(scene, camera);
  }

  function start() {
    resize();
    readScroll();
    canvas.style.opacity = stageOpacity.toFixed(3);
    if (reduce) {
      applyFrame(0);
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", () => {
    readScroll();
    if (reduce) { applyFrame(0); renderer.render(scene, camera); }
  }, { passive: true });

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduce) { applyFrame(0); renderer.render(scene, camera); } }, 150); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
    else if (!reduce && !raf) { raf = requestAnimationFrame(render); }
  });

  start();
})();
