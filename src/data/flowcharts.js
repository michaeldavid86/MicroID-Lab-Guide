// MicroID Lab Guide — Flowchart Routing Logic
// Bio 431: Operational Microbiology | USAFA

// Flowchart sections map gram reaction + shape to identification path
export const flowchartSections = [
  {
    id: "gramPositiveRod",
    label: "Gram-Positive Rods",
    gramReaction: "positive",
    shapes: ["rod"],
    section: 1,
    figures: null,
    description: "Includes Bacillus, Clostridium, Mycobacterium, Listeria, Lactobacillus, Corynebacterium, Kurthia",
    routingSteps: [
      {
        step: 1,
        test: "endosporeStain",
        branches: [
          { result: "positive", label: "Endospore former → Bacillus or Clostridium", next: "endosporeAerobic" },
          { result: "negative", label: "Non-endospore former → other GP rods", next: "nonEndospore" },
        ],
      },
      {
        step: 2,
        id: "endosporeAerobic",
        test: "catalase",
        branches: [
          { result: "positive", label: "Catalase+ → Bacillus", genera: ["Bacillus"] },
          { result: "negative", label: "Catalase− → Clostridium", genera: ["Clostridium"] },
        ],
      },
      {
        step: 2,
        id: "nonEndospore",
        test: "acidFastStain",
        branches: [
          { result: "positive", label: "Acid-fast → Mycobacterium", genera: ["Mycobacterium"] },
          { result: "negative", label: "Non-acid-fast → regular or pleomorphic?", next: "nonAF" },
        ],
      },
      {
        step: 3,
        id: "nonAF",
        description: "Observe cell morphology",
        branches: [
          { result: "regular", label: "Regular rods → Kurthia / Listeria / Lactobacillus", genera: ["Kurthia zopfii", "Listeria monocytogenes", "Listeria innocua", "Lactobacillus acidophilus"] },
          { result: "pleomorphic", label: "Pleomorphic / palisade / club-shaped → Corynebacterium", genera: ["Corynebacterium"] },
        ],
      },
    ],
  },
  {
    id: "gramPositiveCoccus",
    label: "Gram-Positive Cocci",
    gramReaction: "positive",
    shapes: ["coccus"],
    section: 2,
    figures: null,
    description: "Includes Staphylococcus, Micrococcus, Kocuria, Streptococcus, Enterococcus, Lactococcus",
    routingSteps: [
      {
        step: 1,
        test: "catalase",
        branches: [
          { result: "positive", label: "Catalase+ → Staphylococcus or Micrococcus", next: "catPos" },
          { result: "negative", label: "Catalase− → Streptococcus / Enterococcus / Lactococcus", next: "catNeg" },
        ],
      },
      {
        step: 2,
        id: "catPos",
        test: "glucoseFermentation",
        branches: [
          { result: "acid", label: "Glucose fermenter → Staphylococcus", genera: ["Staphylococcus"] },
          { result: "acid and gas", label: "Glucose fermenter + gas → Staphylococcus", genera: ["Staphylococcus"] },
          { result: "negative", label: "Glucose non-fermenter → Micrococcus / Kocuria", genera: ["Micrococcus", "Kocuria"] },
        ],
      },
      {
        step: 2,
        id: "catNeg",
        test: "hemolysis",
        branches: [
          { result: "beta", label: "Beta-hemolytic → Streptococcus pyogenes or S. agalactiae", next: "betaHem" },
          { result: "alpha", label: "Alpha-hemolytic → S. pneumoniae or viridans Strep", next: "alphaHem" },
          { result: "gamma", label: "Gamma (no hemolysis) → Enterococcus / Lactococcus", next: "gammaHem" },
        ],
      },
      {
        step: 3,
        id: "betaHem",
        test: "bacitracin",
        branches: [
          { result: "sensitive", label: "Bacitracin-sensitive → S. pyogenes (Group A)", genera: ["Streptococcus pyogenes"] },
          { result: "resistant", label: "Bacitracin-resistant → likely S. agalactiae (Group B) — confirm with CAMP", next: "campTest" },
        ],
      },
      {
        step: 4,
        id: "campTest",
        test: "camp",
        branches: [
          { result: "positive", label: "CAMP+ → S. agalactiae (Group B)", genera: ["Streptococcus agalactiae"] },
          { result: "negative", label: "CAMP− → other beta-hemolytic Strep", genera: ["Streptococcus pyogenes"] },
        ],
      },
      {
        step: 3,
        id: "alphaHem",
        test: "optochin",
        branches: [
          { result: "sensitive", label: "Optochin-sensitive → S. pneumoniae", genera: ["Streptococcus pneumoniae"] },
          { result: "resistant", label: "Optochin-resistant → viridans Streptococcus", genera: ["Streptococcus mutans"] },
        ],
      },
      {
        step: 3,
        id: "gammaHem",
        test: "growthIn65NaCl",
        branches: [
          { result: "positive", label: "6.5% NaCl+ → Enterococcus", genera: ["Enterococcus faecalis", "Enterococcus faecium"] },
          { result: "negative", label: "6.5% NaCl− → Lactococcus", genera: ["Lactococcus lactis"] },
        ],
      },
    ],
  },
  {
    id: "gramNegativeRod",
    label: "Gram-Negative Rods",
    gramReaction: "negative",
    shapes: ["rod", "coccobacillus"],
    section: 3,
    figures: null,
    description: "Includes Pseudomonas, Alcaligenes, Enterobacteriaceae (E. coli, Klebsiella, Salmonella, etc.)",
    routingSteps: [
      {
        step: 1,
        test: "oxidase",
        branches: [
          { result: "positive", label: "Oxidase+ → Non-fermenters (Pseudomonas, Alcaligenes)", genera: ["Pseudomonas aeruginosa", "Alcaligenes faecalis"] },
          { result: "negative", label: "Oxidase− → Enterobacteriaceae and related", next: "oxidaseNeg" },
        ],
      },
      {
        step: 2,
        id: "oxidaseNeg",
        test: "motility",
        branches: [
          { result: "positive", label: "Motile → Citrate test next", next: "motileGNR" },
          { result: "negative", label: "Nonmotile → Klebsiella / Shigella", genera: ["Klebsiella pneumoniae", "Klebsiella aerogenes", "Shigella dysenteriae"] },
        ],
      },
      {
        step: 3,
        id: "motileGNR",
        test: "citrate",
        branches: [
          { result: "positive", label: "Citrate+ → Citrobacter / Enterobacter / Salmonella / Serratia", genera: ["Citrobacter freundii", "Enterobacter aerogenes", "Enterobacter cloacae", "Salmonella enterica", "Serratia marcescens"] },
          { result: "negative", label: "Citrate− → E. coli / Proteus / Morganella", genera: ["Escherichia coli", "Proteus vulgaris", "Proteus mirabilis", "Morganella morganii"] },
        ],
      },
    ],
  },
  {
    id: "gramNegativeCoccus",
    label: "Gram-Negative Cocci",
    gramReaction: "negative",
    shapes: ["coccus"],
    section: 3,
    figures: null,
    description: "Includes Neisseria, Moraxella",
    routingSteps: [
      {
        step: 1,
        test: "oxidase",
        branches: [
          { result: "positive", label: "Oxidase+ → Neisseria / Moraxella", genera: ["Neisseria sicca", "Moraxella catarrhalis"] },
          { result: "negative", label: "Oxidase− → rare; check morphology/reclassify", genera: [] },
        ],
      },
      {
        step: 2,
        test: "dnase",
        branches: [
          { result: "positive", label: "DNase+ → Moraxella catarrhalis", genera: ["Moraxella catarrhalis"] },
          { result: "negative", label: "DNase− → Neisseria species", genera: ["Neisseria sicca"] },
        ],
      },
    ],
  },
];

// Get the correct flowchart path based on gram reaction and shape
export const getFlowchartSection = (gramReaction, shape) => {
  return flowchartSections.find(
    (s) =>
      s.gramReaction === gramReaction &&
      s.shapes.includes(shape)
  );
};

// Get flowchart section by ID
export const getFlowchartById = (id) =>
  flowchartSections.find((s) => s.id === id);

// Map gram reaction + shape to a flowchart section ID
export const getFlowchartId = (gramReaction, shape) => {
  if (gramReaction === "positive" && shape === "rod") return "gramPositiveRod";
  if (gramReaction === "positive" && shape === "coccus") return "gramPositiveCoccus";
  if (gramReaction === "negative" && (shape === "rod" || shape === "coccobacillus")) return "gramNegativeRod";
  if (gramReaction === "negative" && shape === "coccus") return "gramNegativeCoccus";
  return null;
};

export default flowchartSections;
