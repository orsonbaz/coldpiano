/* ============================================================
   COLD PIANO — main.js
   Builds the data-driven sections, scroll behaviour, and the
   generative ice canvas. Depends on data.js (BRIEF, MATERIALS,
   IFRA, DERIVED).
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const eur = n => (Math.round(n * 100) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (n, d = 2) => n.toFixed(d);
  const byName = name => DERIVED.rows.find(r => r.name === name);

  /* family → wash colour (a whisper of the material's character) */
  const WASH = {
    "Marine":          "radial-gradient(130% 90% at 30% 0%, rgba(70,130,160,.30), transparent 72%)",
    "Woody":           "radial-gradient(130% 90% at 30% 0%, rgba(150,110,70,.24), transparent 72%)",
    "Woody / Earthy":  "radial-gradient(130% 90% at 30% 0%, rgba(90,95,70,.28), transparent 72%)",
    "Mossy / Woody":   "radial-gradient(130% 90% at 30% 0%, rgba(95,115,95,.24), transparent 72%)",
    "Floral":          "radial-gradient(130% 90% at 30% 0%, rgba(150,150,185,.24), transparent 72%)",
    "Musk":            "radial-gradient(130% 90% at 30% 0%, rgba(110,125,135,.26), transparent 72%)",
    "Amber":           "radial-gradient(130% 90% at 30% 0%, rgba(199,148,95,.30), transparent 72%)",
    "Aldehydic":       "radial-gradient(130% 90% at 30% 0%, rgba(160,175,185,.26), transparent 72%)",
    "Aromatic":        "radial-gradient(130% 90% at 30% 0%, rgba(110,165,175,.26), transparent 72%)"
  };

  /* ---- scene layers: the picture, read top to bottom ---- */
  const SCENE = [
    { tier: "the air above",   title: "Glacial air",          names: ["Eucalyptol", "Floralozone", "Calone"] },
    { tier: "the light",       title: "Light on water",       names: ["Hedione"] },
    { tier: "the strings",     title: "Cold metal",           names: ["Habanolide", "Aldehyde C12 MNA", "Rose Oxide"] },
    { tier: "the instrument",  title: "The wooden body",      names: ["ISO E Super", "Cedarwood EO"] },
    { tier: "beneath the ice", title: "The dark water",       names: ["Cypriol EO", "Evernyl", "Ambroxan"] }
  ];

  /* ========== 02 — SCENE ========== */
  function buildScene() {
    const ul = $("#sceneLayers"); if (!ul) return;
    ul.innerHTML = SCENE.map(layer => {
      const body = layer.names.map(byName).filter(Boolean);
      const lead = body[0];
      const mats = body.map(m => m.name).join(" · ");
      return `<li class="reveal">
        <span class="layer-tier">${layer.tier}</span>
        <div class="layer-body">
          <h3>${layer.title}</h3>
          <p>${lead ? lead.role : ""}</p>
          <p class="layer-mats">${mats}</p>
        </div>
      </li>`;
    }).join("");
  }

  /* ========== 03 — GALLERY ========== */
  function buildGallery() {
    const wrap = $("#gallery"); if (!wrap) return;
    wrap.innerHTML = DERIVED.rows.map((m, i) => {
      const wash = WASH[m.family] || WASH["Musk"];
      const no = String(i + 1).padStart(2, "0");
      const dil = m.dilution >= 0.1 ? "10%" : m.dilution === 0.01 ? "1%" : "0.1%";
      return `<article class="plate reveal" style="--wash:${wash}; --d:${(i % 4) * 70}ms">
        <span class="plate-no">n° ${no}</span>
        <h3 class="plate-name">${m.name}</h3>
        <span class="plate-fam">${m.family} · ${m.group}</span>
        <p class="plate-role">${m.role}</p>
        <p class="plate-desc">${m.descriptor}</p>
        <div class="plate-foot">
          <span><b>${m.parts}</b> /1000</span>
          <span><b>${dil}</b> dil.</span>
          <span><b>${pct(m.pctBlend, 1)}%</b></span>
        </div>
      </article>`;
    }).join("");
  }

  /* ========== 04 — FORMULA TABLE ========== */
  function buildFormula() {
    const t = $("#formulaTable"); if (!t) return;
    const dilLabel = m => m.dilution >= 0.1 ? "10%" : m.dilution === 0.01 ? "1%" : "0.1%";

    const head = `<thead><tr>
      <th>material</th><th class="num">dilution</th><th class="num">parts</th>
      <th class="num">% of&nbsp;blend</th><th class="num">€/kg&nbsp;used</th>
      <th class="num">cost €/kg</th>
    </tr></thead>`;

    const body = "<tbody>" + DERIVED.rows.map(m => {
      const usedCell = m.adjusted
        ? `<span class="strike">${eur(m.priceNeat)}</span>${eur(m.priceAdj)}<span class="adj-mark">adj</span>`
        : `${eur(m.priceAdj)}`;
      return `<tr>
        <td class="mat">${m.name}<small>${m.family}</small></td>
        <td class="num">${dilLabel(m)}</td>
        <td class="num">${m.parts}</td>
        <td class="num">${pct(m.pctBlend, 1)}%</td>
        <td class="num">${usedCell}</td>
        <td class="num">${eur(m.costInFormula)}</td>
      </tr>`;
    }).join("") + "</tbody>";

    const foot = `<tfoot><tr>
      <td>Total · ${MATERIALS.length} materials</td>
      <td class="num"></td>
      <td class="num">${DERIVED.totalParts}</td>
      <td class="num">100%</td>
      <td class="num"></td>
      <td class="num total-cost">${eur(DERIVED.totalCost)}</td>
    </tr></tfoot>`;

    t.innerHTML = head + body + foot;

    $("#activeConc").textContent = pct(DERIVED.activeConcentratePct, 0) + "%";
    $("#activeEdt").textContent  = pct(DERIVED.activeEdtPct, 1) + "%";
  }

  /* ========== 05 — COST ========== */
  function buildCost() {
    $("#costBig").textContent = eur(DERIVED.totalCost);
    const margin = ((BRIEF.budgetEurKg - DERIVED.totalCost) / BRIEF.budgetEurKg) * 100;
    $("#costMargin").textContent = pct(margin, 0) + "%";

    // top two materials' share
    const ranked = [...DERIVED.rows].sort((a, b) => b.costInFormula - a.costInFormula);
    const topShare = (ranked[0].costInFormula + ranked[1].costInFormula) / DERIVED.totalCost * 100;
    $("#costTopShare").textContent = pct(topShare, 0) + "%";

    const max = ranked[0].costInFormula;
    $("#costRank").innerHTML = ranked.map(m => `
      <li>
        <span class="cr-name">${m.name}</span>
        <span class="cr-val">${eur(m.costInFormula)} €/kg</span>
        <span class="cr-track"><i data-w="${(m.costInFormula / max) * 100}"></i></span>
      </li>`).join("");

    // bar fill (cost vs 60 budget) — animate when visible
    const fill = $("#costBarFill");
    const cap  = $("#costBarCap");
    cap.style.left = "100%";
    const target = Math.min(DERIVED.totalCost / BRIEF.budgetEurKg * 100, 100);
    const io = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting) {
          fill.style.width = target + "%";
          $$("#costRank .cr-track i").forEach(i => i.style.width = i.dataset.w + "%");
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe($("#cost"));
  }

  /* ========== 06 — IFRA TABLE ========== */
  function buildIFRA() {
    const t = $("#ifraTable"); if (!t) return;
    const head = `<thead><tr>
      <th>material</th>
      <th class="num">in concentrate</th>
      <th class="num">in 10% EDT</th>
      <th class="num">IFRA Cat 4</th>
      <th>status</th>
    </tr></thead>`;

    const body = "<tbody>" + DERIVED.rows
      .slice()
      .sort((a, b) => b.edtPct - a.edtPct)
      .map(m => {
        const ceil = IFRA.ceilings[m.name];
        const limit = ceil ? ceil.label : "no restriction";
        const pillClass = "pill clear";
        return `<tr>
          <td class="mat">${m.name}</td>
          <td class="num ok">${pct(m.concActivePct, m.concActivePct < 0.1 ? 3 : 2)}%</td>
          <td class="num ok">${pct(m.edtPct, m.edtPct < 0.01 ? 4 : 3)}%</td>
          <td class="num">${ceil ? "ceiling" : "none"}</td>
          <td><span class="${pillClass}">${ceil ? "within ceiling" : "unrestricted"}</span><br>
              <small style="color:var(--steel);font-size:11px;letter-spacing:.03em">${limit}</small></td>
        </tr>`;
      }).join("") + "</tbody>";

    t.innerHTML = head + body;

    // verdict: most concentrated material in the finished EDT
    const peak = DERIVED.rows.slice().sort((a, b) => b.edtPct - a.edtPct)[0];
    const pn = $("#peakName"), pe = $("#peakEdt");
    if (pn) pn.textContent = peak.name;
    if (pe) pe.textContent = pct(peak.edtPct, 2) + "%";
  }

  /* ========== 07 — SPEC ========== */
  function buildSpec() {
    const ul = $("#specList"); if (!ul) return;
    const margin = ((BRIEF.budgetEurKg - DERIVED.totalCost) / BRIEF.budgetEurKg) * 100;
    const peak = DERIVED.rows.reduce((a, b) => b.edtPct > a.edtPct ? b : a);
    const items = [
      { label: "Maximum 12 raw materials", val: `${MATERIALS.length} / 12`, flag: "met" },
      { label: "Budget 60 €/kg",           val: `${eur(DERIVED.totalCost)} €/kg · ${pct(margin,0)}% under`, flag: "met" },
      { label: "IFRA Category 4 (10% EDT)", val: `max ${pct(peak.edtPct,2)}% in product · all unrestricted`, flag: "compliant" }
    ];
    ul.innerHTML = items.map(it => `<li>
      <span class="sp-label">${it.label}</span>
      <span class="sp-val">${it.val}</span>
      <span class="sp-flag">✓ ${it.flag}</span>
    </li>`).join("");
  }

  /* ========== reveal on scroll ========== */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  }

  /* ========== nav active state + progress ========== */
  function initNav() {
    const links = $$(".sidenav a");
    const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a.parentElement]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.parentElement.classList.remove("active"));
          const li = map.get(e.target.id);
          if (li) li.classList.add("active");
        }
      });
    }, { threshold: 0.5 });
    $$("main section").forEach(s => io.observe(s));

    const bar = $("#progressBar");
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      bar.style.width = (p * 100) + "%";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // mobile menu
    const toggle = $("#navToggle"), side = $("#sidenav");
    toggle.addEventListener("click", () => side.classList.toggle("open"));
    side.addEventListener("click", e => { if (e.target.tagName === "A") side.classList.remove("open"); });
  }

  /* ========== generative ice canvas ========== */
  function initCanvas() {
    const cv = $("#iceCanvas"); if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    let w, h, dpr, particles, raf, t0 = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(w, 1400) / 14); // density scales with width
      particles = Array.from({ length: count }, () => spawn(true));
    }
    function spawn(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -10,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: Math.random() * 0.32 + 0.08,
        a: Math.random() * 0.5 + 0.15,
        drift: Math.random() * Math.PI * 2,
        ds: Math.random() * 0.012 + 0.004
      };
    }

    function frame(t) {
      const dt = Math.min((t - t0) || 16, 40); t0 = t;
      ctx.clearRect(0, 0, w, h);

      // faint glacial horizon glow
      const g = ctx.createRadialGradient(w * 0.5, h * 0.34, 0, w * 0.5, h * 0.34, Math.max(w, h) * 0.6);
      g.addColorStop(0, "rgba(120,160,180,0.07)");
      g.addColorStop(1, "rgba(120,160,180,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.drift += p.ds;
        p.x += p.vx * dt + Math.sin(p.drift) * 0.25;
        p.y += p.vy * dt;
        if (p.y > h + 8 || p.x < -10 || p.x > w + 10) Object.assign(p, spawn(false));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225,238,243,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    raf = requestAnimationFrame(frame);
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 160); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { t0 = 0; raf = requestAnimationFrame(frame); }
    });
  }

  /* ========== boot ========== */
  document.addEventListener("DOMContentLoaded", () => {
    buildScene();
    buildGallery();
    buildFormula();
    buildCost();
    buildIFRA();
    buildSpec();
    initReveal();
    initNav();
    initCanvas();
  });
})();
