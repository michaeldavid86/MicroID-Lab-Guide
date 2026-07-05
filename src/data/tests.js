// MicroID Lab Guide — Test Definitions
// Bio 431: Operational Microbiology | USAFA
// All biochemical tests, stains, and physiological tests

export const tests = [
  // ═══════════════════════════════════════════════════════════════
  // STAINING — Phase 1
  // ═══════════════════════════════════════════════════════════════
  {
    id: "gramStain",
    name: "Gram Stain",
    category: "staining",
    phase: 1,
    possibleResults: [
      { subTest: "reaction", options: ["positive", "negative"] },
      { subTest: "shape", options: ["coccus", "rod", "coccobacillus"] },
      {
        subTest: "arrangement",
        options: [
          "singles",
          "pairs",
          "chains",
          "clusters",
          "tetrads",
          "palisades",
          "irregular",
        ],
      },
    ],
    resultDescriptions: {
      positive: "Purple/violet cells — retain crystal violet-iodine complex after decolorization",
      negative: "Pink/red cells — lose crystal violet during decolorization, take up safranin counterstain",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "The Gram stain differentiates bacteria based on cell wall structure. Gram-positive bacteria have a thick peptidoglycan layer that retains the crystal violet-iodine complex. Gram-negative bacteria have a thin peptidoglycan layer and an outer membrane — the decolorizer dissolves the outer membrane and washes out the CV-I complex, leaving cells colorless until counterstained with safranin.",
    applicableSections: [1, 2, 3],
    prerequisiteTests: [],
    photoPositive: "/images/tests/gram-stain-positive.jpg",
    photoNegative: "/images/tests/gram-stain-negative.jpg",
    quickRef: "Crystal violet → Iodine → Decolorizer → Safranin. Purple = Gram+, Pink = Gram−.",
  },
  {
    id: "endosporeStain",
    name: "Endospore Stain (Schaeffer-Fulton)",
    category: "staining",
    phase: 1,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Green endospores visible inside or outside of pink/red vegetative cells",
      negative: "No green bodies observed — all cells are pink/red",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Endospores are highly resistant dormant structures produced by Bacillus and Clostridium. The Schaeffer-Fulton method uses malachite green forced into spores by steam heat. Vegetative cells are decolorized with water and counterstained with safranin (pink). Spores retain the green dye.",
    applicableSections: [1, 2],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/endospore-positive.jpg",
    photoNegative: "/images/tests/endospore-negative.jpg",
    quickRef: "Malachite green + steam heat → water wash → safranin. Green spores inside pink cells = positive.",
  },
  {
    id: "acidFastStain",
    name: "Acid-Fast Stain (Ziehl-Neelsen)",
    category: "staining",
    phase: 1,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Bright red/pink acid-fast bacilli against blue background",
      negative: "All cells blue — no acid-fast organisms present",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Mycobacteria have cell walls rich in mycolic acids (waxy lipids) that resist standard staining. Carbolfuchsin is forced into the cell with heat. Acid-alcohol decolorization cannot remove the dye from mycolic acid-containing cells. Non-acid-fast cells lose the dye and take up the methylene blue counterstain.",
    applicableSections: [1],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/acid-fast-positive.jpg",
    photoNegative: "/images/tests/acid-fast-negative.jpg",
    quickRef: "Carbolfuchsin + heat → acid-alcohol → methylene blue. Red bacilli = acid-fast positive.",
  },
  {
    id: "capsuleStain",
    name: "Capsule Stain (Negative Stain)",
    category: "staining",
    phase: 1,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Clear halo (capsule) visible around dark-stained cell against dark background",
      negative: "No clear halo — cell appears directly against stained background",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Capsules are polysaccharide or polypeptide layers outside the cell wall that repel most stains. India ink or nigrosin creates a dark background. The capsule appears as a clear halo because it excludes the stain particles. Capsules are major virulence factors — they prevent phagocytosis.",
    applicableSections: [1, 2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/capsule-positive.jpg",
    photoNegative: "/images/tests/capsule-negative.jpg",
    quickRef: "India ink negative stain. Clear halo around cell = capsule present.",
  },

  // ═══════════════════════════════════════════════════════════════
  // ENZYMATIC TESTS — Phase 3
  // ═══════════════════════════════════════════════════════════════
  {
    id: "catalase",
    name: "Catalase Test",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Vigorous bubbling when 3% H₂O₂ is applied to colony",
      negative: "No bubbling or very weak reaction",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Catalase (2H₂O₂ → 2H₂O + O₂) decomposes hydrogen peroxide, a toxic byproduct of aerobic metabolism. Organisms that use cytochrome-based electron transport chains produce catalase to protect against oxidative damage. Key differentiator: Staphylococcus (catalase+) vs. Streptococcus (catalase−).",
    applicableSections: [1, 2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/catalase-positive.jpg",
    photoNegative: "/images/tests/catalase-negative.jpg",
    quickRef: "Drop 3% H₂O₂ on colony. Bubbles = positive. CAUTION: Don't pick from blood agar (RBCs contain catalase → false positive).",
  },
  {
    id: "oxidase",
    name: "Oxidase Test",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Kovac's reagent turns dark blue/purple within 10-15 seconds",
      negative: "No color change or color develops after 15 seconds",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Oxidase detects cytochrome c oxidase, the terminal enzyme in the electron transport chain that transfers electrons to molecular O₂. Pseudomonas and Neisseria are oxidase-positive. Most Enterobacteriaceae are oxidase-negative — a critical early differentiator for Gram-negative rods.",
    applicableSections: [1, 2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/oxidase-positive.jpg",
    photoNegative: "/images/tests/oxidase-negative.jpg",
    quickRef: "Rub colony on oxidase reagent strip. Purple within 10s = positive. Use wooden stick or loop (not nichrome — false positive).",
  },
  {
    id: "coagulase",
    name: "Coagulase Test (Tube Method)",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Plasma forms a visible clot (any degree of clotting is positive)",
      negative: "Plasma remains liquid after 4–24 hours",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Coagulase converts fibrinogen → fibrin, forming a clot around the bacterium. This creates a fibrin shield that protects S. aureus from phagocytosis and immune recognition. Coagulase is the gold-standard test for identifying S. aureus among staphylococci.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase"],
    photoPositive: "/images/tests/coagulase-positive.jpg",
    photoNegative: "/images/tests/coagulase-negative.jpg",
    quickRef: "Emulsify colony in rabbit plasma tube. Incubate 4h (check at 1h, 4h, 24h). Any clot = positive = S. aureus.",
  },
  {
    id: "dnase",
    name: "DNase Test",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Clear zone around colonies after flooding with 1N HCl (DNA precipitate dissolves)",
      negative: "No clear zone — opaque DNA precipitate remains around colonies",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "DNase is an extracellular enzyme that hydrolyzes DNA into nucleotides. S. aureus and Serratia marcescens are notable DNase producers. The test uses DNase agar flooded with HCl — HCl precipitates intact DNA (opaque), but hydrolyzed DNA remains clear.",
    applicableSections: [2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/dnase-positive.jpg",
    photoNegative: "/images/tests/dnase-negative.jpg",
    quickRef: "Streak DNase agar. Incubate. Flood with 1N HCl. Clear zone = positive.",
  },
  {
    id: "gelatinase",
    name: "Gelatinase (Gelatin Hydrolysis)",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Gelatin remains liquid after refrigeration (gelatin has been hydrolyzed)",
      negative: "Gelatin solidifies after refrigeration (gelatin intact)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Gelatinase is an extracellular protease (exoenzyme) that hydrolyzes gelatin into amino acids. Organisms producing gelatinase can break down connective tissue collagen, contributing to tissue invasion and spread.",
    applicableSections: [1, 2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/gelatinase-positive.jpg",
    photoNegative: "/images/tests/gelatinase-negative.jpg",
    quickRef: "Stab nutrient gelatin deep. Incubate. Refrigerate 30 min. Liquid = positive (gelatin hydrolyzed).",
  },
  {
    id: "amylase",
    name: "Amylase (Starch Hydrolysis)",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Clear zone around colonies after flooding with iodine (starch hydrolyzed)",
      negative: "Blue-black color around colonies (intact starch reacts with iodine)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Amylase is an exoenzyme that hydrolyzes starch into maltose and glucose. Starch agar flooded with Gram's iodine turns blue-black where starch is intact. Clear zones indicate starch was hydrolyzed by amylase-producing organisms.",
    applicableSections: [1, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/amylase-positive.jpg",
    photoNegative: "/images/tests/amylase-negative.jpg",
    quickRef: "Streak starch agar. Incubate. Flood with iodine. Clear zone = positive.",
  },
  {
    id: "lipase",
    name: "Lipase (Tributyrin Hydrolysis)",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Clear zone around colonies on tributyrin agar (triglycerides hydrolyzed)",
      negative: "No clear zone (opaque medium unchanged)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Lipase hydrolyzes triglycerides (fats) into glycerol and fatty acids. Tributyrin agar is opaque due to emulsified tributyrin fat. Lipase-producing organisms create clear zones where fat has been broken down.",
    applicableSections: [1],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/lipase-positive.jpg",
    photoNegative: "/images/tests/lipase-negative.jpg",
    quickRef: "Streak tributyrin agar. Incubate. Clear zone = positive.",
  },
  {
    id: "urease",
    name: "Urease Test",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Bright pink/magenta color (alkaline pH from ammonia production)",
      negative: "Remains peach/yellow (no pH change)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Urease hydrolyzes urea → CO₂ + 2NH₃. The ammonia raises the pH, turning the phenol red indicator from peach/yellow to bright pink. Proteus species are rapid urease producers. Klebsiella and some Staphylococcus are also urease-positive.",
    applicableSections: [1, 2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/urease-positive.jpg",
    photoNegative: "/images/tests/urease-negative.jpg",
    quickRef: "Inoculate urea broth. Incubate 24h. Pink = positive (urease produces ammonia → alkaline pH).",
  },

  // ═══════════════════════════════════════════════════════════════
  // METABOLIC TESTS — Phase 3
  // ═══════════════════════════════════════════════════════════════
  {
    id: "indole",
    name: "Indole Test",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Red/cherry ring at surface after adding Kovac's reagent",
      negative: "Yellow/amber ring (no red color)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Tryptophanase degrades the amino acid tryptophan → indole + pyruvic acid + NH₃. Kovac's reagent (p-dimethylaminobenzaldehyde) reacts with indole to form a red-colored rosindole dye. E. coli is a classic indole-positive organism.",
    applicableSections: [1, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/indole-positive.jpg",
    photoNegative: "/images/tests/indole-negative.jpg",
    quickRef: "Inoculate SIM or tryptone broth. Incubate 24-48h. Add Kovac's reagent. Red ring = positive.",
  },
  {
    id: "methylRed",
    name: "Methyl Red (MR) Test",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Red color after adding methyl red indicator (pH < 4.4)",
      negative: "Yellow/orange color (pH > 6.0)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "MR tests for stable mixed-acid fermentation. Mixed-acid fermenters produce large amounts of organic acids (lactic, acetic, formic, succinic) that maintain a low pH even after prolonged incubation. Butanediol fermenters convert acids to neutral products, raising pH. MR and VP are complementary — usually MR+/VP− or MR−/VP+.",
    applicableSections: [3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/methyl-red-positive.jpg",
    photoNegative: "/images/tests/methyl-red-negative.jpg",
    quickRef: "Inoculate MR-VP broth. Incubate 48-72h (minimum!). Add methyl red drops. Red = positive, Yellow = negative.",
  },
  {
    id: "vogesProskauer",
    name: "Voges-Proskauer (VP) Test",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Red/pink color after adding Barritt's reagents A and B (may take 15-20 min)",
      negative: "No color change or copper/brown color",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "VP detects acetoin (acetylmethylcarbinol), an intermediate in the 2,3-butanediol fermentation pathway. Barritt's reagent A (α-naphthol) and B (KOH) oxidize acetoin to diacetyl, which reacts with guanidine residues in peptone to form a red complex. VP-positive organisms: Klebsiella, Enterobacter, Serratia.",
    applicableSections: [1, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/vp-positive.jpg",
    photoNegative: "/images/tests/vp-negative.jpg",
    quickRef: "From MR-VP broth: add Barritt's A (α-naphthol), then B (KOH). Shake. Wait 15-20 min. Red/pink = positive.",
  },
  {
    id: "citrate",
    name: "Citrate Utilization (Simmons Citrate)",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Blue color (alkaline pH) and/or visible growth on slant",
      negative: "Remains green — no growth, no color change",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Tests whether an organism can use citrate as its sole carbon and energy source. Citrate is metabolized via the TCA cycle. Ammonium dihydrogen phosphate is the sole nitrogen source — when metabolized, it releases NH₃ which raises pH, turning bromothymol blue indicator from green to blue.",
    applicableSections: [3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/citrate-positive.jpg",
    photoNegative: "/images/tests/citrate-negative.jpg",
    quickRef: "Streak Simmons citrate slant. Incubate 24-48h. Blue = positive (citrate utilized). Green = negative.",
  },
  {
    id: "nitrateReduction",
    name: "Nitrate Reduction Test",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Red color after adding reagents A and B (nitrite present), OR no red + zinc confirms gas = nitrate reduced beyond nitrite",
      negative: "No red after reagents, turns red AFTER adding zinc (unreduced nitrate confirmed)",
    },
    interpretationQuestion: {
      prompt: "Interpret your nitrate reduction test results step by step:",
      steps: [
        {
          field: "initialColor",
          question: "After adding reagents A and B (sulfanilic acid + α-naphthylamine), what color appeared?",
          options: [
            { value: "red", label: "Red color appeared", correct: null },
            { value: "none", label: "No color change", correct: null },
          ],
        },
        {
          field: "zincTest",
          question: "If no color appeared, what happened after adding zinc dust?",
          options: [
            { value: "red", label: "Red color appeared (zinc reduced remaining nitrate → nitrite)", correct: null },
            { value: "none", label: "No color change (no nitrate left — organism reduced it completely)", correct: null },
            { value: "na", label: "N/A — red color appeared in step 1", correct: null },
          ],
        },
      ],
    },
    firstPrinciple:
      "Nitrate reductase reduces NO₃⁻ → NO₂⁻ (and sometimes further to N₂ gas). Reagents detect nitrite. If negative: add zinc to reduce any remaining nitrate to nitrite. If zinc causes red → nitrate was NOT reduced (true negative). If zinc causes no color → organism reduced nitrate completely past nitrite (strong positive).",
    applicableSections: [1, 2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/nitrate-positive.jpg",
    photoNegative: "/images/tests/nitrate-negative.jpg",
    quickRef: "Incubate in nitrate broth. Add reagents A+B. Red = positive. No red → add zinc: red = negative, no red = strong positive.",
  },
  {
    id: "h2s",
    name: "H₂S Production",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Black precipitate (ferrous sulfide) in SIM medium or KIA",
      negative: "No blackening",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "H₂S is produced by the enzymatic degradation of sulfur-containing amino acids (cysteine) by cysteine desulfurase, or by reduction of thiosulfate. H₂S reacts with ferrous iron (Fe²⁺) in the medium to form black ferrous sulfide (FeS) precipitate. Salmonella and Proteus are classic H₂S producers.",
    applicableSections: [3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/h2s-positive.jpg",
    photoNegative: "/images/tests/h2s-negative.jpg",
    quickRef: "Read SIM medium or KIA. Black precipitate = H₂S positive.",
  },
  {
    id: "motility",
    name: "Motility Test",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Diffuse, spreading growth radiating from the stab line (hazy/turbid medium)",
      negative: "Growth only along the stab line — medium remains clear",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Motile bacteria use flagella to swim through semisolid (0.4% agar) medium, creating turbidity away from the stab line. Non-motile organisms grow only along the stab line. Motility is key in differentiating enterics: E. coli (motile) vs. Klebsiella (nonmotile), Proteus (swarming motility).",
    applicableSections: [1, 2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/motility-positive.jpg",
    photoNegative: "/images/tests/motility-negative.jpg",
    quickRef: "Stab SIM medium. Incubate. Spreading growth = motile. Growth only along stab = nonmotile.",
  },
  {
    id: "phenylalanine",
    name: "Phenylalanine Deaminase Test",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Green color when ferric chloride reagent is added to slant",
      negative: "No green color (remains yellow/amber)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Phenylalanine deaminase converts phenylalanine → phenylpyruvic acid + NH₃. Ferric chloride reacts with phenylpyruvic acid to form a green-colored complex. Positive for Proteus, Providencia, and Morganella — the \"PPM\" group.",
    applicableSections: [3],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/phenylalanine-positive.jpg",
    photoNegative: "/images/tests/phenylalanine-negative.jpg",
    quickRef: "Streak phenylalanine agar slant. Incubate 24h. Add ferric chloride. Green = positive (Proteus/Providencia/Morganella).",
  },

  // ═══════════════════════════════════════════════════════════════
  // CARBOHYDRATE FERMENTATION — Phase 3
  // ═══════════════════════════════════════════════════════════════
  ...["glucose", "lactose", "sucrose", "mannitol", "maltose", "arabinose", "ribose", "raffinose", "galactose", "xylose"].map(
    (sugar) => ({
      id: `${sugar}Fermentation`,
      name: `${sugar.charAt(0).toUpperCase() + sugar.slice(1)} Fermentation`,
      category: "metabolic",
      phase: 3,
      possibleResults: ["acid", "acid and gas", "negative"],
      resultDescriptions: {
        acid: "Yellow color (acid production) — no gas in Durham tube",
        "acid and gas": "Yellow color (acid) + gas bubble in inverted Durham tube",
        negative: "Red/orange color — no fermentation (medium unchanged)",
      },
      interpretationQuestion: {
        prompt: `Read your ${sugar} fermentation tube:`,
        steps: [
          {
            field: "acid",
            question: "Has the medium changed from red/orange to yellow?",
            options: [
              { value: "yes", label: "Yes — yellow (acid produced)", correct: null },
              { value: "no", label: "No — still red/orange (no fermentation)", correct: null },
            ],
          },
          {
            field: "gas",
            question: "Is there a bubble trapped in the inverted Durham tube?",
            options: [
              { value: "yes", label: "Yes — gas produced", correct: null },
              { value: "no", label: "No — no gas", correct: null },
            ],
          },
        ],
      },
      firstPrinciple: `Fermentation tests detect an organism's ability to catabolize ${sugar} anaerobically, producing organic acids (detected by phenol red pH indicator turning yellow) and/or gas (CO₂ and H₂ captured in the Durham tube). Different organisms have different enzymatic machinery for catabolizing different sugars.`,
      applicableSections: [1, 2, 3],
      prerequisiteTests: ["gramStain"],
      photoPositive: `/images/tests/${sugar}-ferm-positive.jpg`,
      photoNegative: `/images/tests/${sugar}-ferm-negative.jpg`,
      quickRef: `Inoculate ${sugar} broth with Durham tube. Incubate 24-48h. Yellow = acid. Bubble in Durham tube = gas.`,
    })
  ),

  // ═══════════════════════════════════════════════════════════════
  // DECARBOXYLASE TESTS — Phase 3
  // ═══════════════════════════════════════════════════════════════
  ...["arginine", "lysine", "ornithine"].map((amino) => ({
    id: amino,
    name: `${amino.charAt(0).toUpperCase() + amino.slice(1)} Decarboxylase`,
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Purple/violet color (alkaline — amine production raises pH)",
      negative: "Yellow color (acid from glucose fermentation, no decarboxylation)",
    },
    interpretationQuestion: null,
    firstPrinciple: `Decarboxylases remove the carboxyl group (–COOH) from amino acids, producing alkaline amines. ${amino.charAt(0).toUpperCase() + amino.slice(1)} decarboxylase converts ${amino} → ${amino === "arginine" ? "agmatine" : amino === "lysine" ? "cadaverine" : "putrescine"}. The alkaline amine raises pH, turning the bromocresol purple indicator from yellow back to purple. The amine products (cadaverine, putrescine) are named for their foul odor in decomposing tissue.`,
    applicableSections: [2, 3],
    prerequisiteTests: ["gramStain"],
    photoPositive: `/images/tests/${amino}-positive.jpg`,
    photoNegative: `/images/tests/${amino}-negative.jpg`,
    quickRef: `Inoculate ${amino} decarboxylase broth (with mineral oil overlay). Incubate 24-96h. Purple = positive, Yellow = negative.`,
  })),

  // ═══════════════════════════════════════════════════════════════
  // DIFFERENTIAL MEDIA — Phase 3
  // ═══════════════════════════════════════════════════════════════
  {
    id: "kia",
    name: "Kligler's Iron Agar (KIA)",
    category: "differential-media",
    phase: 3,
    possibleResults: [
      { subTest: "slant", options: ["acid", "alkaline"] },
      { subTest: "butt", options: ["acid", "alkaline"] },
      { subTest: "gas", options: ["positive", "negative"] },
      { subTest: "h2s", options: ["positive", "negative"] },
    ],
    resultDescriptions: {
      "alkaline/acid": "Red slant / Yellow butt — glucose fermentation only (glucose used up, slant reverts to alkaline from peptone catabolism)",
      "acid/acid": "Yellow slant / Yellow butt — both glucose AND lactose fermented",
      "alkaline/alkaline": "Red slant / Red butt — no fermentation (peptone catabolism only)",
    },
    interpretationQuestion: {
      prompt: "Read your KIA tube carefully (read at 18-24 hours!):",
      steps: [
        {
          field: "slant",
          question: "What color is the SLANT (angled surface)?",
          options: [
            { value: "acid", label: "Yellow (acid)", correct: null },
            { value: "alkaline", label: "Red/Pink (alkaline)", correct: null },
          ],
        },
        {
          field: "butt",
          question: "What color is the BUTT (bottom)?",
          options: [
            { value: "acid", label: "Yellow (acid)", correct: null },
            { value: "alkaline", label: "Red/Pink (alkaline)", correct: null },
          ],
        },
        {
          field: "gas",
          question: "Do you see bubbles, cracks, or agar pushed up from the bottom?",
          options: [
            { value: "positive", label: "Yes — gas production", correct: null },
            { value: "negative", label: "No — no gas", correct: null },
          ],
        },
        {
          field: "h2s",
          question: "Is there any black precipitate in the medium?",
          options: [
            { value: "positive", label: "Yes — H₂S production (black FeS)", correct: null },
            { value: "negative", label: "No — no H₂S", correct: null },
          ],
        },
      ],
    },
    firstPrinciple:
      "KIA contains two sugars: glucose (0.1%) and lactose (1.0%). All enterics ferment glucose → acid → yellow butt. Only lactose fermenters produce enough acid to also turn the slant yellow (10× more lactose). Non-lactose-fermenters: slant reverts to alkaline (red) as peptone catabolism on the aerobic surface produces NH₃. H₂S = black precipitate (thiosulfate + ferrous sulfide). Gas = bubbles/cracks. CRITICAL: Read at 18-24h — longer incubation causes acid reversion (false alkaline).",
    applicableSections: [3],
    prerequisiteTests: ["gramStain", "oxidase"],
    photoPositive: "/images/tests/kia-acid-acid.jpg",
    photoNegative: "/images/tests/kia-alk-acid.jpg",
    quickRef: "Stab butt, streak slant. Incubate 18-24h ONLY. Read slant/butt color, gas, H₂S.",
  },
  {
    id: "mannitolSalt",
    name: "Mannitol Salt Agar (MSA)",
    category: "selective-media",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Yellow halo around colonies (mannitol fermented → acid → phenol red turns yellow)",
      negative: "Red/pink medium around colonies (mannitol NOT fermented, no pH change)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "MSA is both selective (7.5% NaCl inhibits most non-staphylococci) and differential (mannitol fermentation). S. aureus ferments mannitol → yellow halo. S. epidermidis grows (salt tolerant) but does NOT ferment mannitol → colonies surrounded by red/pink medium.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase"],
    photoPositive: "/images/tests/msa-positive.jpg",
    photoNegative: "/images/tests/msa-negative.jpg",
    quickRef: "Streak MSA plate. Incubate 24-48h. Yellow halo = mannitol fermenter (S. aureus). Red = non-fermenter.",
  },
  {
    id: "bileEsculin",
    name: "Bile Esculin Agar",
    category: "selective-media",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Dark brown to black color (more than half the slant darkened)",
      negative: "No darkening or less than half the slant affected",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Bile esculin tests two abilities: (1) growth in 40% bile (selects for enterococci and Group D strep) and (2) hydrolysis of esculin → esculetin + glucose. Esculetin reacts with ferric citrate in the medium to form a dark brown-black complex. Key test for Enterococcus identification.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase"],
    photoPositive: "/images/tests/bile-esculin-positive.jpg",
    photoNegative: "/images/tests/bile-esculin-negative.jpg",
    quickRef: "Streak bile esculin slant. Incubate 24-48h. Dark brown/black (>50% slant) = positive. Used for enterococci and Group D strep.",
  },
  {
    id: "hemolysis",
    name: "Hemolysis (Blood Agar)",
    category: "differential-media",
    phase: 3,
    possibleResults: ["alpha", "beta", "gamma"],
    resultDescriptions: {
      alpha: "Greenish discoloration around colonies (partial RBC lysis — methemoglobin formation)",
      beta: "Complete clearing around colonies (total RBC lysis — transparent zone)",
      gamma: "No change in medium around colonies (no hemolysis)",
    },
    interpretationQuestion: {
      prompt: "Examine the blood agar plate carefully around your colonies:",
      steps: [
        {
          field: "hemolysisType",
          question: "What do you observe around the colonies?",
          options: [
            { value: "alpha", label: "Greenish discoloration (partial clearing)", correct: null },
            { value: "beta", label: "Complete clear zone (transparent)", correct: null },
            { value: "gamma", label: "No change (medium unchanged)", correct: null },
          ],
        },
      ],
    },
    firstPrinciple:
      "Hemolysins are exotoxins that lyse red blood cells. Alpha-hemolysis: partial lysis produces methemoglobin (green). Beta-hemolysis: complete lysis creates a clear zone (streptolysin O and S in S. pyogenes). Gamma: no hemolysis. Hemolysis patterns are critical for Streptococcus classification.",
    applicableSections: [1, 2],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/hemolysis-beta.jpg",
    photoNegative: "/images/tests/hemolysis-gamma.jpg",
    quickRef: "Streak blood agar. Incubate 24h (preferably CO₂/candle jar). Alpha = green, Beta = clear, Gamma = no change.",
  },

  // ═══════════════════════════════════════════════════════════════
  // ANTIBIOTIC SENSITIVITY — Phase 3
  // ═══════════════════════════════════════════════════════════════
  {
    id: "bacitracin",
    name: "Bacitracin Sensitivity",
    category: "antibiotic-sensitivity",
    phase: 3,
    possibleResults: ["sensitive", "resistant"],
    resultDescriptions: {
      sensitive: "Zone of inhibition around the bacitracin disk (any zone = sensitive)",
      resistant: "Growth up to the disk (no zone of inhibition)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Bacitracin inhibits cell wall synthesis by interfering with bactoprenol recycling. Group A Streptococcus (S. pyogenes) is characteristically sensitive to bacitracin. This is a presumptive test — used alongside hemolysis pattern and PYR for Group A Strep identification.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase", "hemolysis"],
    photoPositive: "/images/tests/bacitracin-sensitive.jpg",
    photoNegative: "/images/tests/bacitracin-resistant.jpg",
    quickRef: "Streak beta-hemolytic strep on blood agar. Place bacitracin (A) disk. Any zone = sensitive = presumptive Group A.",
  },
  {
    id: "optochin",
    name: "Optochin Sensitivity",
    category: "antibiotic-sensitivity",
    phase: 3,
    possibleResults: ["sensitive", "resistant"],
    resultDescriptions: {
      sensitive: "Zone of inhibition ≥14 mm around the optochin (P) disk",
      resistant: "Zone <14 mm or no zone of inhibition",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Optochin (ethylhydrocupreine) disrupts the cell membrane of S. pneumoniae. A zone ≥14 mm identifies S. pneumoniae (alpha-hemolytic, optochin-sensitive). Other alpha-hemolytic streptococci (viridans group) are optochin-resistant.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase", "hemolysis"],
    photoPositive: "/images/tests/optochin-sensitive.jpg",
    photoNegative: "/images/tests/optochin-resistant.jpg",
    quickRef: "Streak alpha-hemolytic strep on blood agar. Place optochin (P) disk. Zone ≥14mm = S. pneumoniae.",
  },
  {
    id: "novobiocin",
    name: "Novobiocin Sensitivity",
    category: "antibiotic-sensitivity",
    phase: 3,
    possibleResults: ["sensitive", "resistant"],
    resultDescriptions: {
      sensitive: "Zone of inhibition ≥16 mm around novobiocin disk",
      resistant: "Zone <16 mm or no zone",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Novobiocin inhibits DNA gyrase. Coagulase-negative staphylococci are differentiated by novobiocin sensitivity: S. epidermidis is sensitive (zone ≥16mm), while S. saprophyticus is resistant. This is clinically relevant since S. saprophyticus is a common UTI pathogen.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase", "coagulase"],
    photoPositive: "/images/tests/novobiocin-sensitive.jpg",
    photoNegative: "/images/tests/novobiocin-resistant.jpg",
    quickRef: "For coagulase-negative Staph. Place novobiocin disk. Zone ≥16mm = S. epidermidis. Resistant = S. saprophyticus.",
  },
  {
    id: "camp",
    name: "CAMP Test",
    category: "antibiotic-sensitivity",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Arrowhead-shaped zone of enhanced hemolysis where test streak meets S. aureus streak",
      negative: "No enhanced hemolysis at junction",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "CAMP factor (Christie, Atkins, Munch-Petersen) is a protein produced by Group B Streptococcus (S. agalactiae) that synergistically enhances the beta-hemolysin (sphingomyelinase C) of S. aureus. The result is an arrowhead-shaped zone of complete hemolysis at the junction of the two streaks.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase", "hemolysis"],
    photoPositive: "/images/tests/camp-positive.jpg",
    photoNegative: "/images/tests/camp-negative.jpg",
    quickRef: "Streak S. aureus down center of blood agar. Streak unknown perpendicular (don't touch). Arrowhead hemolysis = Group B Strep.",
  },
  {
    id: "pyr",
    name: "PYR Test (Pyrrolidonyl Arylamidase)",
    category: "enzymatic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Bright red/cherry color after adding PYR reagent",
      negative: "No color change or orange/yellow",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "PYR detects pyrrolidonyl arylamidase (pyrrolidonyl peptidase), which hydrolyzes L-pyrrolidonyl-β-naphthylamide. The released β-naphthylamine reacts with the PYR reagent (cinnamaldehyde) to form a red Schiff base. Positive for Group A Streptococcus and Enterococcus — together with bacitracin, it helps differentiate beta-hemolytic strep.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase"],
    photoPositive: "/images/tests/pyr-positive.jpg",
    photoNegative: "/images/tests/pyr-negative.jpg",
    quickRef: "Rub colony on PYR disk/strip. Add PYR reagent. Red = positive (Group A Strep or Enterococcus).",
  },

  // ═══════════════════════════════════════════════════════════════
  // GROWTH CONDITIONS — Phase 3
  // ═══════════════════════════════════════════════════════════════
  {
    id: "growthIn65NaCl",
    name: "Growth in 6.5% NaCl Broth",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Visible turbidity (growth) in 6.5% NaCl broth",
      negative: "Broth remains clear (no growth — organism cannot tolerate high salt)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "Tests salt tolerance. Enterococci grow in 6.5% NaCl; most other streptococci cannot. This is a key differentiator between Enterococcus (salt-tolerant) and Streptococcus (salt-sensitive). Combined with bile esculin, it confirms Enterococcus.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain", "catalase"],
    photoPositive: "/images/tests/nacl-growth-positive.jpg",
    photoNegative: "/images/tests/nacl-growth-negative.jpg",
    quickRef: "Inoculate 6.5% NaCl broth. Incubate 24-72h. Turbidity = growth = positive (Enterococcus).",
  },
  {
    id: "growthIn75NaCl",
    name: "Growth in 7.5% NaCl (MSA Selection)",
    category: "metabolic",
    phase: 3,
    possibleResults: ["positive", "negative"],
    resultDescriptions: {
      positive: "Growth on MSA or in 7.5% NaCl broth (organism is salt tolerant)",
      negative: "No growth (organism inhibited by high salt)",
    },
    interpretationQuestion: null,
    firstPrinciple:
      "7.5% NaCl selects for Staphylococcus species while inhibiting most other bacteria. The high osmotic pressure is lethal to organisms without compatible solute uptake mechanisms. Staphylococci and a few halotolerant organisms survive.",
    applicableSections: [2],
    prerequisiteTests: ["gramStain"],
    photoPositive: "/images/tests/75-nacl-positive.jpg",
    photoNegative: "/images/tests/75-nacl-negative.jpg",
    quickRef: "Selective feature of MSA (7.5% NaCl). Growth = Staphylococcus species.",
  },
];

// Helper functions
export const getTestById = (id) => tests.find((t) => t.id === id);

export const getTestsByPhase = (phase) => tests.filter((t) => t.phase === phase);

export const getTestsByCategory = (category) =>
  tests.filter((t) => t.category === category);

export const getTestsForSection = (section) =>
  tests.filter((t) => t.applicableSections.includes(section));

// Flowchart-ordered test sequences for each identification path
export const flowchartTestOrder = {
  gramPositiveRod: [
    "endosporeStain",
    "acidFastStain",
    "catalase",
    "motility",
    "hemolysis",
    "gelatinase",
    "amylase",
    "lipase",
    "vogesProskauer",
    "citrate",
    "glucoseFermentation",
    "lactoseFermentation",
    "maltoseFermentation",
    "arabinoseFermentation",
    "xyloseFermentation",
    "riboseFermentation",
    "raffinoseFermentation",
    "nitrateReduction",
    "urease",
    "indole",
  ],
  gramPositiveCoccus: [
    "catalase",
    "oxidase",
    "glucoseFermentation",
    "coagulase",
    "mannitolSalt",
    "hemolysis",
    "dnase",
    "novobiocin",
    "bacitracin",
    "optochin",
    "camp",
    "pyr",
    "bileEsculin",
    "growthIn65NaCl",
    "growthIn75NaCl",
    "urease",
    "vogesProskauer",
    "maltoseFermentation",
    "mannitolFermentation",
    "lactoseFermentation",
    "arabinoseFermentation",
    "raffinoseFermentation",
    "arginine",
    "nitrateReduction",
  ],
  gramNegativeRod: [
    "oxidase",
    "glucoseFermentation",
    "kia",
    "indole",
    "methylRed",
    "vogesProskauer",
    "citrate",
    "urease",
    "h2s",
    "motility",
    "phenylalanine",
    "lactoseFermentation",
    "sucroseFermentation",
    "mannitolFermentation",
    "nitrateReduction",
    "dnase",
    "gelatinase",
    "lipase",
    "lysine",
    "ornithine",
    "arginine",
    "capsuleStain",
  ],
  gramNegativeCoccus: [
    "oxidase",
    "catalase",
    "dnase",
    "glucoseFermentation",
    "maltoseFermentation",
    "sucroseFermentation",
    "lactoseFermentation",
    "nitrateReduction",
  ],
};
