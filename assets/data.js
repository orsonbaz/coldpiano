/* ============================================================
   COLD PIANO — formula data
   An olfactive elegy for the Arctic.
   Formula column "2"; total 1000 parts.

   Cost convention (per the brief):
   Each material is priced at its sheet €/kg AS-IS, EXCEPT where
   Cold Piano dilutes it further than the reference sheet — then the
   price is scaled down by that extra dilution factor.
     · Calone .......... sheet 10% → used 1%   → ÷10  (125 → 12.5)
     · Aldehyde C12 MNA  sheet 1%  → used 0.1% → ÷10  (18  → 1.8)
     · Rose Oxide ...... sheet 1%  → used 0.1% → ÷10  (65  → 6.5)
   Cost in formula (€/kg) = parts × adjusted €/kg ÷ 1000.

   IFRA: concentrate active % = parts × dilution ÷ 1000 × 100.
         finished EDT % = concentrate active % × 0.10 (10% EDT).
   ============================================================ */

const BRIEF = {
  name: "Cold Piano",
  subtitle: "An olfactive study of the Arctic",
  maxMaterials: 12,
  budgetEurKg: 60,
  ifraCategory: 4,
  edtDosage: 0.10,
  reference: {
    title: 'Ludovico Einaudi, “Elegy for the Arctic”',
    detail: "Live for Greenpeace, performed on a floating platform before the Wahlenbergbreen glacier, Svalbard.",
    url: "https://www.youtube.com/watch?v=2DLnhdnSUVs"
  }
};

/* Each material:
   parts        — out of 1000 (the compounded blend)
   dilution     — fraction used in Cold Piano
   sheetDilution— reference dilution in the price sheet
   priceNeat    — €/kg from the sheet (at the sheet dilution basis)
   priceAdj     — €/kg actually used after dilution adjustment
   family / group / descriptor — from the working database
   role         — its job inside the scene
*/
const MATERIALS = [
  {
    name: "ISO E Super",
    group: "Ketone", family: "Woody",
    parts: 250, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 10, priceAdj: 10,
    descriptor: "Fresh, clean and woody. A transparent haze of cedar and violet.",
    role: "The woody backbone and most of the diffusion. Dry and transparent, it stands in for the body of the instrument."
  },
  {
    name: "Habanolide",
    group: "Ester", family: "Musk",
    parts: 220, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 32, priceAdj: 32,
    descriptor: "A light but dense musk, waxy with a faint edge of metal.",
    role: "A clean musk that carries the blend, with a slightly metallic sheen. The strings."
  },
  {
    name: "Hedione",
    group: "Ester", family: "Floral",
    parts: 175, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 11, priceAdj: 11,
    descriptor: "The trace left on the air after you walk past jasmine.",
    role: "Transparency and lift through the heart. The cold, bright air."
  },
  {
    name: "Cedarwood EO",
    group: "Essential oil", family: "Woody",
    parts: 75, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 40, priceAdj: 40,
    descriptor: "Dry, oily, earthy cedar.",
    role: "Dry woody depth. The timber of the soundboard."
  },
  {
    name: "Floralozone",
    group: "Aldehyde", family: "Marine",
    parts: 75, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 22, priceAdj: 22,
    descriptor: "A cleaner cousin of Calone. Anisic and ozonic, with a hint of citrus.",
    role: "The ozonic, marine top note. Cold air off the ice."
  },
  {
    name: "Cypriol EO",
    group: "Essential oil", family: "Woody / Earthy",
    parts: 25, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 400, priceAdj: 400,
    descriptor: "Rooty and dark, close to vetiver, with a worn leather edge.",
    role: "Smoky, rooty depth, close to vetiver. The dark, waterlogged grain of the wood."
  },
  {
    name: "Evernyl",
    group: "Ester", family: "Mossy / Woody",
    parts: 15, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 55, priceAdj: 55,
    descriptor: "Soft oakmoss, faintly old and damp.",
    role: "Damp wood. The humidity off the sea soaking into the case."
  },
  {
    name: "Ambroxan",
    group: "Ether", family: "Amber",
    parts: 15, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 500, priceAdj: 500,
    descriptor: "Grey amber. Musky, woody and long on the skin.",
    role: "Mineral amber that fixes and extends the blend. The salt warmth under the cold."
  },
  {
    name: "Calone",
    group: "Ketone", family: "Marine",
    parts: 40, dilution: 0.01, sheetDilution: 0.10,
    priceNeat: 125, priceAdj: 12.5,
    descriptor: "Marine and oceanic, cool like watermelon rind.",
    role: "The marine note, used in trace. Brine and spray off the ice."
  },
  {
    name: "Aldehyde C12 MNA",
    group: "Aldehyde", family: "Aldehydic",
    parts: 40, dilution: 0.001, sheetDilution: 0.01,
    priceNeat: 18, priceAdj: 1.8,
    descriptor: "Kumquat peel turned metallic and soapy, over a woody spine.",
    role: "A metallic, soapy aldehyde in trace. The glint on a string or wet ice."
  },
  {
    name: "Eucalyptol",
    group: "Ester", family: "Aromatic",
    parts: 30, dilution: 0.10, sheetDilution: 0.10,
    priceNeat: 25, priceAdj: 25,
    descriptor: "Camphor and cool wood, the feeling of a cleared airway.",
    role: "A camphor lift, used sparingly. The cold intake of breath."
  },
  {
    name: "Rose Oxide",
    group: "Ether", family: "Floral",
    parts: 40, dilution: 0.001, sheetDilution: 0.01,
    priceNeat: 65, priceAdj: 6.5,
    descriptor: "Black and green pepper over a metallic rose.",
    role: "A peppery, metallic floral in trace. The bite of frost."
  }
];

/* IFRA status, per the 51st Amendment.
   None of the twelve carry a binding Category-4 quantitative
   restriction. Two have published industry usage ceilings
   (in the concentrate); both are cleared by a wide margin. */
const IFRA = {
  category: 4,
  amendment: "51st",
  note: "No material in this formula is subject to a binding IFRA Category 4 quantitative restriction. The two with published usage ceilings are well within them.",
  ceilings: {
    "Eucalyptol": { ceilingConcentrate: 0.20, label: "≈20% in concentrate (industry usage rec.)" },
    "Aldehyde C12 MNA": { ceilingConcentrate: 0.02, label: "≈2% in concentrate (industry usage rec.)" }
  },
  library: "https://ifrafragrance.org/standards-library"
};

/* ---- derived helpers (kept here so the view layer stays clean) ---- */
const DERIVED = (() => {
  const totalParts = MATERIALS.reduce((s, m) => s + m.parts, 0);
  let totalCost = 0;
  let activeFraction = 0; // neat active in the concentrate
  const rows = MATERIALS.map(m => {
    const pctBlend = (m.parts / totalParts) * 100;          // % of compounded blend
    const costInFormula = (m.parts * m.priceAdj) / 1000;     // €/kg of concentrate
    const concActivePct = (m.parts * m.dilution / totalParts) * 100; // neat % in concentrate
    const edtPct = concActivePct * BRIEF.edtDosage;          // neat % in 10% EDT
    const adjusted = m.dilution < m.sheetDilution;
    totalCost += costInFormula;
    activeFraction += concActivePct;
    return { ...m, pctBlend, costInFormula, concActivePct, edtPct, adjusted };
  });
  return {
    totalParts,
    totalCost,
    activeConcentratePct: activeFraction,          // ~12%
    activeEdtPct: activeFraction * BRIEF.edtDosage, // ~1.2%
    rows
  };
})();
