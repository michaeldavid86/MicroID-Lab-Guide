// MicroID Field Guide — Culture Media Reference Library
// Bio 431: Operational Microbiology | USAFA

export const media = [
  // ═══════════════════════════════════════════════════════════════
  // GENERAL PURPOSE
  // ═══════════════════════════════════════════════════════════════
  {
    id: "nutrient-agar",
    name: "Nutrient Agar",
    abbreviation: "NA",
    type: "general-purpose",
    components: "Beef extract, peptone, agar",
    selectsFor: null,
    differentiates: null,
    howToRead: "Growth = viable organism. No differential indicators. Observe colony morphology: size, shape, margin, elevation, pigmentation, surface texture.",
    commonPitfalls: "Does not select for or against any organism — cannot be used alone for identification. Check incubation temperature (25°C vs 37°C preference).",
    relatedExercises: ["Ex 5", "Ex 40"],
    photo: "/images/media/nutrient-agar.jpg",
  },
  {
    id: "tsa",
    name: "Tryptic Soy Agar",
    abbreviation: "TSA",
    type: "general-purpose",
    components: "Tryptone, soy peptone, NaCl, agar",
    selectsFor: null,
    differentiates: null,
    howToRead: "Rich general-purpose medium. Growth = viable organism. Observe colony morphology. Supports growth of most non-fastidious organisms.",
    commonPitfalls: "Too rich to reveal any differential characteristics. Use specialized media for definitive identification.",
    relatedExercises: ["Ex 5", "Ex 40"],
    photo: "/images/media/tsa.jpg",
  },

  // ═══════════════════════════════════════════════════════════════
  // SELECTIVE + DIFFERENTIAL MEDIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "blood-agar",
    name: "Blood Agar (Tryptic Soy Blood Agar)",
    abbreviation: "BAP",
    type: "differential",
    components: "TSA base + 5% sheep blood",
    selectsFor: null,
    differentiates: "Hemolysis patterns: alpha, beta, gamma",
    howToRead:
      "Alpha hemolysis: green-gray partial lysis zone around colonies (methemoglobin). Beta hemolysis: complete clear zone (full RBC lysis). Gamma: no change. Observe after 24–48h incubation; examine against light source from below.",
    commonPitfalls: "Beta hemolysis can be enhanced in CO₂/candle jar (especially Group B Strep). Some Staph beta-hemolysis only visible subsurface — stab colonies. Read within 48h; extended incubation may cause alpha → gamma reversal.",
    relatedExercises: ["Ex 36", "Ex 37", "Ex 40"],
    photo: "/images/media/blood-agar.jpg",
  },
  {
    id: "macconkey",
    name: "MacConkey Agar",
    abbreviation: "MAC",
    type: "selective-differential",
    components: "Lactose, bile salts, crystal violet, neutral red pH indicator, peptone, agar",
    selectsFor: "Gram-negative organisms (bile salts + crystal violet inhibit Gram-positive)",
    differentiates: "Lactose fermenters (pink/red) vs. non-fermenters (colorless/translucent)",
    howToRead:
      "Pink/red colonies with bile salt precipitate = lactose fermenters (E. coli — metallic sheen; Klebsiella — mucoid pink). Colorless/translucent colonies = non-fermenters (Salmonella, Shigella, Proteus). Gram-positive organisms fail to grow.",
    commonPitfalls: "Proteus swarming is inhibited on MAC. Some late lactose fermenters (e.g., Citrobacter) may appear colorless at 24h. Compare to 48h reading.",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/macconkey.jpg",
  },
  {
    id: "msa",
    name: "Mannitol Salt Agar",
    abbreviation: "MSA",
    type: "selective-differential",
    components: "7.5% NaCl, mannitol, phenol red pH indicator, peptone, agar",
    selectsFor: "Staphylococcus species (7.5% NaCl inhibits most other bacteria)",
    differentiates: "Mannitol fermenters (yellow halo) vs. non-fermenters (red medium unchanged)",
    howToRead:
      "Yellow halo around colonies = mannitol fermented = S. aureus (presumptive). Colonies with unchanged red medium = mannitol non-fermenters (S. epidermidis, S. saprophyticus). No growth = non-staphylococci.",
    commonPitfalls: "Pink/dark red halos can occur with non-specific pH changes. True positive requires distinctly yellow color. Read at 24–48h.",
    relatedExercises: ["Ex 36", "Ex 40"],
    photo: "/images/media/msa.jpg",
  },
  {
    id: "endo-agar",
    name: "Endo Agar",
    abbreviation: null,
    type: "selective-differential",
    components: "Lactose, basic fuchsin sulfite (inhibits GP), sodium sulfite, agar",
    selectsFor: "Gram-negative bacteria (basic fuchsin sulfite inhibits Gram-positive)",
    differentiates: "Lactose fermenters produce metallic green sheen (E. coli); others form pink or colorless colonies",
    howToRead:
      "Metallic green sheen = E. coli (confirmed coliform). Pink colonies = other coliforms (late/partial fermenters). Colorless = non-coliforms. Primary medium for membrane filtration coliform counts in water testing.",
    commonPitfalls: "Expose plates to light briefly — metallic sheen develops on exposure. Store plates in dark until ready to read. Medium deteriorates rapidly — use within 2 weeks of preparation.",
    relatedExercises: ["Ex 43", "Ex 44", "Ex 40"],
    photo: "/images/media/endo-agar.jpg",
  },
  {
    id: "bile-esculin-agar",
    name: "Bile Esculin Agar",
    abbreviation: "BE",
    type: "selective-differential",
    components: "Bile (40%), esculin, ferric citrate, peptone, agar",
    selectsFor: "Organisms that grow in 40% bile (enterococci, Group D strep)",
    differentiates: "Esculin hydrolyzers (dark brown/black) vs. non-hydrolyzers",
    howToRead:
      "Greater than 50% of the slant turned dark brown or black = positive. Esculetin + ferric citrate → dark complex. Used to identify enterococci and Group D streptococci.",
    commonPitfalls: "Read at 48h. Some organisms cause partial darkening — requires >50% blackening for positive. Listeria monocytogenes is also BE-positive.",
    relatedExercises: ["Ex 37", "Ex 40"],
    photo: "/images/media/bile-esculin.jpg",
  },

  // ═══════════════════════════════════════════════════════════════
  // BIOCHEMICAL TEST MEDIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "kia",
    name: "Kligler's Iron Agar",
    abbreviation: "KIA",
    type: "biochemical",
    components: "Glucose (0.1%), lactose (1.0%), ferrous sulfate (H₂S indicator), thiosulfate, phenol red, peptone, agar",
    selectsFor: null,
    differentiates: "Glucose vs lactose fermentation, H₂S production, gas production",
    howToRead:
      "Stab butt/streak slant. Read at 18–24h ONLY: Slant color (red=alkaline, yellow=acid) + butt color + gas (bubbles/cracks) + H₂S (black precipitate). A/A = both sugars; K/A = glucose only; K/K = no fermentation; K/A + black = H₂S producer.",
    commonPitfalls: "CRITICAL: Read at exactly 18–24h. After 48h, acid reversion causes yellow slant to turn red (false alkaline reading). H₂S may obscure acid color in butt.",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/kia.jpg",
  },
  {
    id: "sim",
    name: "SIM Medium",
    abbreviation: "SIM",
    type: "biochemical",
    components: "Peptone (tryptophan source for indole), ferrous sulfate + sodium thiosulfate (H₂S), soft agar 0.4% (motility)",
    selectsFor: null,
    differentiates: "Sulfide (H₂S), Indole, Motility — three tests in one tube",
    howToRead:
      "H₂S: black precipitate along stab line. Indole: add Kovac's reagent after incubation — red ring at surface = positive. Motility: turbidity/spreading growth away from stab line = motile.",
    commonPitfalls: "Add Kovac's reagent last (destroys tube for H₂S reading). Incubate in upright position. Motility haze can be subtle — examine against light source.",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/sim.jpg",
  },
  {
    id: "urea-broth",
    name: "Urea Broth (Christensen's)",
    abbreviation: null,
    type: "biochemical",
    components: "Urea (2%), yeast extract, glucose, phenol red indicator, phosphate buffer",
    selectsFor: null,
    differentiates: "Urease-positive (alkaline = pink) vs. urease-negative (no change or acidification = yellow)",
    howToRead:
      "Bright pink/magenta = urease positive (strong producers: Proteus — may be positive within 1–4h). Peach/salmon = negative. Some organisms are weak urease producers — read at 24h and 48h.",
    commonPitfalls: "Proteus is a rapid urease producer (can turn pink within 4h). Don't confuse rapid positives with negative medium color change from glucose fermentation (which turns yellow first).",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/urea-broth.jpg",
  },
  {
    id: "mr-vp-broth",
    name: "MR-VP Broth",
    abbreviation: "MRVP",
    type: "biochemical",
    components: "Glucose, buffered peptone",
    selectsFor: null,
    differentiates: "Mixed-acid fermentation (MR+) vs. 2,3-butanediol fermentation (VP+)",
    howToRead:
      "Split inoculated broth into two tubes at 48h. MR tube: add methyl red drops — red = positive (pH < 4.4). VP tube: add Barritt's A (α-naphthol) then B (KOH) — red/pink color after 15–20 min = positive (acetoin).",
    commonPitfalls: "Must incubate minimum 48h (preferably 72h) for valid MR result — short incubation gives false positives. VP: wait full 20 min before reading. Copper color in VP = negative (not pink).",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/mr-vp-broth.jpg",
  },
  {
    id: "simmons-citrate",
    name: "Simmons Citrate Agar",
    abbreviation: null,
    type: "biochemical",
    components: "Sodium citrate (sole carbon source), ammonium dihydrogen phosphate (sole nitrogen source), bromothymol blue indicator, agar",
    selectsFor: null,
    differentiates: "Citrate-utilizing organisms (blue) vs. non-utilizing (green/no growth)",
    howToRead:
      "Blue color + visible growth = positive (citrate utilized, alkaline shift from NH₃ turns BTB blue). Green slant with no growth = negative. Positive for Enterobacter, Klebsiella, Citrobacter, Salmonella (most serovars).",
    commonPitfalls: "Inoculate lightly (from saline suspension or from non-enriched medium). Carryover of organic material from rich medium can give false positives. Incubate up to 4 days before calling negative.",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/simmons-citrate.jpg",
  },
  {
    id: "nitrate-broth",
    name: "Nitrate Broth",
    abbreviation: null,
    type: "biochemical",
    components: "Potassium nitrate, peptone",
    selectsFor: null,
    differentiates: "Nitrate reducers: nitrate → nitrite → gas (N₂)",
    howToRead:
      "Add reagent A (sulfanilic acid) then B (α-naphthylamine): Red = nitrite present = nitrate reduced. No color: add zinc dust. Red after zinc = unreduced nitrate remains = negative. No red after zinc = nitrate reduced completely past nitrite = strong positive.",
    commonPitfalls: "The two-step zinc confirmation is mandatory when reagents give no color. Do not skip the zinc control.",
    relatedExercises: ["Ex 40"],
    photo: "/images/media/nitrate-broth.jpg",
  },
  {
    id: "phenol-red-broth",
    name: "Phenol Red Carbohydrate Broth",
    abbreviation: null,
    type: "biochemical",
    components: "Peptone, phenol red pH indicator, specific carbohydrate, Durham tube (inverted)",
    selectsFor: null,
    differentiates: "Acid production (yellow) and/or gas production (bubble in Durham tube) from specific carbohydrate",
    howToRead:
      "Red/orange = no fermentation. Yellow = acid produced. Yellow + bubble in Durham tube = acid + gas. Available as individual sugar broths for glucose, lactose, sucrose, mannitol, maltose, arabinose, ribose, raffinose, galactose, xylose.",
    commonPitfalls: "Read Durham tube carefully — small bubbles count. Incubate full 24–48h for late fermenters. Over-incubation may cause reversion.",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/phenol-red-broth.jpg",
  },
  {
    id: "gelatin",
    name: "Nutrient Gelatin",
    abbreviation: null,
    type: "biochemical",
    components: "Nutrient broth + 12% gelatin (solidifies below ~20°C)",
    selectsFor: null,
    differentiates: "Gelatinase-producing organisms liquefy the gelatin",
    howToRead:
      "After incubation, refrigerate 30 min to re-solidify. If medium remains liquid = gelatinase positive (protein hydrolyzed). If medium re-solidifies around growth = negative.",
    commonPitfalls: "Must refrigerate before reading — medium is liquid at incubation temperature regardless. Stab inoculation only (not streaked).",
    relatedExercises: ["Ex 40"],
    photo: "/images/media/gelatin.jpg",
  },
  {
    id: "starch-agar",
    name: "Starch Agar",
    abbreviation: null,
    type: "biochemical",
    components: "Soluble starch, nutrient agar base",
    selectsFor: null,
    differentiates: "Amylase (starch hydrolysis) producers",
    howToRead:
      "After incubation, flood plate with Gram's iodine. Blue-black color = intact starch (no hydrolysis). Clear/colorless zones around colonies = amylase positive (starch hydrolyzed).",
    commonPitfalls: "Add iodine only when ready to read — color fades rapidly. Wide clearing zones may extend beyond visible colony.",
    relatedExercises: ["Ex 40"],
    photo: "/images/media/starch-agar.jpg",
  },
  {
    id: "tributyrin-agar",
    name: "Tributyrin Agar",
    abbreviation: null,
    type: "biochemical",
    components: "Tributyrin (emulsified), agar — forms opaque medium",
    selectsFor: null,
    differentiates: "Lipase producers",
    howToRead:
      "Clear zones around colonies = lipase positive (tributyrin hydrolyzed). Opaque medium around colonies = negative.",
    commonPitfalls: "Ensure medium is uniformly opaque before use — incomplete emulsification gives patchy results.",
    relatedExercises: ["Ex 40"],
    photo: "/images/media/tributyrin.jpg",
  },
  {
    id: "dnase-agar",
    name: "DNase Agar",
    abbreviation: null,
    type: "biochemical",
    components: "DNA, nutrient agar base",
    selectsFor: null,
    differentiates: "DNase producers (S. aureus, Serratia)",
    howToRead:
      "After incubation, flood with 1N HCl. HCl precipitates intact DNA (opaque/white). Clear zones around colonies = DNA hydrolyzed = DNase positive.",
    commonPitfalls: "Flood evenly. Read within 5–10 min (precipitation reaction is time-sensitive). Some media use methyl green indicator instead of HCl.",
    relatedExercises: ["Ex 36", "Ex 40"],
    photo: "/images/media/dnase-agar.jpg",
  },
  {
    id: "phenylalanine-agar",
    name: "Phenylalanine Agar",
    abbreviation: "PAD",
    type: "biochemical",
    components: "L-phenylalanine, yeast extract, NaCl, agar",
    selectsFor: null,
    differentiates: "Phenylalanine deaminase producers (Proteus, Providencia, Morganella)",
    howToRead:
      "After incubation, add 4–5 drops of 10% ferric chloride to slant surface. Green color = positive (phenylpyruvic acid present). No green = negative.",
    commonPitfalls: "Read immediately after adding ferric chloride — green color fades within minutes. Inoculate from fresh 24h culture.",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/phenylalanine-agar.jpg",
  },
  {
    id: "decarboxylase-broth",
    name: "Decarboxylase Broth (Møller's)",
    abbreviation: null,
    type: "biochemical",
    components: "Specific amino acid (arginine, lysine, or ornithine), glucose, bromocresol purple indicator, cresol red indicator, pyridoxal phosphate (cofactor), mineral oil overlay",
    selectsFor: null,
    differentiates: "Amino acid decarboxylase activity",
    howToRead:
      "Yellow → Purple = positive (glucose fermented → acid first, then decarboxylase produces alkaline amine → purple). Remains yellow = negative (glucose fermented but no decarboxylation). Include base control (no amino acid) — should remain yellow.",
    commonPitfalls: "Mineral oil overlay is essential (anaerobic conditions required). Include amino acid-free control tube. Incubate 4 days before calling negative.",
    relatedExercises: ["Ex 38", "Ex 40"],
    photo: "/images/media/decarboxylase-broth.jpg",
  },

  // ═══════════════════════════════════════════════════════════════
  // WATER QUALITY MEDIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ltb",
    name: "Lauryl Tryptose Broth (LTB)",
    abbreviation: "LTB",
    type: "selective",
    components: "Lactose, tryptose, lauryl sulfate (inhibits non-coliforms), Durham tube",
    selectsFor: "Total coliforms (gas production in Durham tube = presumptive positive)",
    differentiates: null,
    howToRead:
      "Gas bubble in inverted Durham tube after 24–48h = presumptive positive for coliforms. Proceed to confirmed test (BGB) for all presumptive positives. Part of the Most Probable Number (MPN) procedure.",
    commonPitfalls: "Read at 24h and 48h. Small bubbles count. Multiple tube MPN method requires 3 dilutions in triplicate.",
    relatedExercises: ["Ex 43", "Ex 44"],
    photo: "/images/media/ltb.jpg",
  },
  {
    id: "bgb",
    name: "Brilliant Green Bile (BGB) Broth",
    abbreviation: "BGB",
    type: "selective",
    components: "Lactose, brilliant green dye, oxgall bile (2%), Durham tube",
    selectsFor: "Confirmed coliforms (more selective than LTB)",
    differentiates: null,
    howToRead:
      "Gas in Durham tube at 35°C after 24–48h = confirmed coliform. Inoculate from positive LTB tubes. Record confirmed positives, use MPN table.",
    commonPitfalls: "Must be incubated at exactly 35°C (not 37°C). False positives rare but possible with non-coliform gas producers.",
    relatedExercises: ["Ex 43", "Ex 44"],
    photo: "/images/media/bgb.jpg",
  },
  {
    id: "ec-broth",
    name: "EC Broth",
    abbreviation: "EC",
    type: "selective",
    components: "Lactose, bile salts mixture, tryptose, potassium phosphate, NaCl, Durham tube",
    selectsFor: "Fecal coliforms (E. coli group) when incubated at 44.5°C",
    differentiates: null,
    howToRead:
      "Gas in Durham tube after 24h at 44.5°C = confirmed fecal coliform. Temperature is critical — heat water bath to exactly 44.5 ± 0.2°C. Inoculate from positive BGB tubes.",
    commonPitfalls: "Temperature accuracy is everything. Use calibrated water bath. EC broth positive = fecal coliform; proceed to completed test if E. coli confirmation needed (subculture to EMB/Endo + gram stain).",
    relatedExercises: ["Ex 43", "Ex 44"],
    photo: "/images/media/ec-broth.jpg",
  },
];

// Helper functions
export const getMediaById = (id) => media.find((m) => m.id === id);

export const getMediaByType = (type) => media.filter((m) => m.type === type);
