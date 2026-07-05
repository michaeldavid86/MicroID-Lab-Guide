// MicroID Lab Guide — Decision Engine
// Bio 431: Operational Microbiology | USAFA
// Pure functions for organism elimination and test discrimination value

import { organisms } from "../data/organisms";
import { tests, flowchartTestOrder } from "../data/tests";
import { getFlowchartId } from "../data/flowcharts";

// ─────────────────────────────────────────────────────────────────
// RESULT COMPARISON
// ─────────────────────────────────────────────────────────────────

/**
 * Compare a known organism characteristic to a recorded test result.
 * Returns true if they are compatible (organism should NOT be eliminated).
 */
export function resultMatches(known, observed) {
  if (known === undefined || known === null) return true; // No data → keep
  if (known === "variable") return true; // Variable → always keep

  // Normalize to lowercase strings for comparison
  const k = String(known).toLowerCase().trim();
  const o = String(observed).toLowerCase().trim();

  if (k === o) return true;

  // Handle acid/fermentation aliases
  if ((k === "positive" || k === "acid" || k === "acid and gas") &&
      (o === "positive" || o === "acid" || o === "acid and gas")) return true;

  return false;
}

/**
 * Are an observed Gram-stain shape and an organism's stored shape compatible?
 * "rod" and "coccobacillus" are treated as mutually compatible (a coccobacillus
 * is a very short rod), in BOTH directions.
 */
export function shapesCompatible(observedShape, orgShape) {
  if (!observedShape) return true;
  if (orgShape === observedShape) return true;
  if (observedShape === "rod" && orgShape === "coccobacillus") return true;
  if (observedShape === "coccobacillus" && orgShape === "rod") return true;
  return false;
}

/**
 * Some recorded tests are composite (KIA) or selective-differential (MSA) and
 * have no 1:1 organism characteristic. Decompose an observed result into
 * [{ char, observed }] pairs the engine can compare against organism data.
 */
export function decomposeObservation(testId, observed) {
  // Mannitol Salt Agar → mannitol fermentation (yellow halo = acid)
  if (testId === "mannitolSalt") {
    const val = String(observed).toLowerCase() === "positive" ? "acid" : "negative";
    return [{ char: "mannitolFermentation", observed: val }];
  }
  // Kligler's Iron Agar → glucose (butt), lactose (slant), and H₂S
  if (testId === "kia" && observed && typeof observed === "object") {
    const pairs = [];
    if (observed.butt) pairs.push({ char: "glucoseFermentation", observed: observed.butt === "acid" ? "acid" : "negative" });
    if (observed.slant) pairs.push({ char: "lactoseFermentation", observed: observed.slant === "acid" ? "acid" : "negative" });
    if (observed.h2s) pairs.push({ char: "h2s", observed: observed.h2s });
    return pairs;
  }
  return [{ char: testId, observed }];
}

/**
 * Representative characteristic key used to rank a (possibly composite) test's
 * discrimination value.
 */
function rankingChar(testId) {
  if (testId === "mannitolSalt") return "mannitolFermentation";
  if (testId === "kia") return "lactoseFermentation"; // main KIA discriminator among enterics
  return testId;
}

// ─────────────────────────────────────────────────────────────────
// PHASE 1: GRAM STAIN FILTER
// ─────────────────────────────────────────────────────────────────

/**
 * Filter organisms by Gram stain result and morphology.
 * Returns array of organism IDs that match.
 */
export function filterByGramStain(gramReaction, shape) {
  return organisms.filter((org) => {
    if (gramReaction && org.gramReaction !== gramReaction) return false;
    if (!shapesCompatible(shape, org.shape)) return false;
    return true;
  }).map((o) => o.id);
}

// ─────────────────────────────────────────────────────────────────
// PHASE 3: BIOCHEMICAL TEST ELIMINATION
// ─────────────────────────────────────────────────────────────────

/**
 * Compare a boolean organism property (e.g. endosporeForming) to an observed
 * positive/negative result. Returns true if compatible (do NOT eliminate).
 */
function stainMatches(knownBool, observed) {
  if (knownBool === undefined || knownBool === null) return true; // no data → keep
  const expected = knownBool ? "positive" : "negative";
  return String(observed).toLowerCase().trim() === expected;
}

/**
 * Main elimination function.
 * Given gram stain data, all recorded biochemical results, and the Phase 1
 * stain observations (endospore, acid-fast, capsule), returns
 * { candidateIds, eliminatedEntries }.
 *
 * observations: { endospore, acidFast, capsule } — each "positive" | "negative" | null
 * eliminatedEntries: [{ organismId, name, eliminatedBy, expected, observed }]
 */
export function runElimination(gramReaction, gramShape, testResults, observations = {}) {
  const passedIds = new Set(filterByGramStain(gramReaction, gramShape));
  const eliminatedEntries = [];

  // For each recorded biochemical test, try to eliminate organisms.
  // Composite tests (KIA, MSA) are decomposed into their underlying characteristics.
  for (const [testId, entry] of Object.entries(testResults || {})) {
    const observed = entry.result;
    if (observed === null || observed === undefined) continue;
    const pairs = decomposeObservation(testId, observed);

    for (const org of organisms) {
      if (!passedIds.has(org.id)) continue; // Already eliminated

      for (const { char, observed: obsVal } of pairs) {
        if (obsVal === null || obsVal === undefined) continue;
        const known = org.characteristics?.[char];
        if (!resultMatches(known, obsVal)) {
          eliminatedEntries.push({
            organismId: org.id,
            name: org.name,
            eliminatedBy: testId,
            expected: known ?? "no data",
            observed: typeof observed === "object" ? obsVal : observed,
          });
          passedIds.delete(org.id);
          break; // one elimination per test per organism
        }
      }
    }
  }

  // Phase 1 stain observations — endospore and acid-fast map to top-level
  // organism booleans; capsule maps to a characteristics field.
  const boolStains = [
    { observed: observations.endospore, prop: "endosporeForming", label: "endospore stain" },
    { observed: observations.acidFast, prop: "acidFast", label: "acid-fast stain" },
  ];
  for (const { observed, prop, label } of boolStains) {
    if (observed !== "positive" && observed !== "negative") continue;
    for (const org of organisms) {
      if (!passedIds.has(org.id)) continue;
      const known = org[prop];
      if (!stainMatches(known, observed)) {
        eliminatedEntries.push({
          organismId: org.id,
          name: org.name,
          eliminatedBy: label,
          expected: known ? "positive" : "negative",
          observed,
        });
        passedIds.delete(org.id);
      }
    }
  }

  // Capsule stain — only eliminates organisms with an explicit capsuleStain value
  if (observations.capsule === "positive" || observations.capsule === "negative") {
    for (const org of organisms) {
      if (!passedIds.has(org.id)) continue;
      const known = org.characteristics?.capsuleStain;
      if (!resultMatches(known, observations.capsule)) {
        eliminatedEntries.push({
          organismId: org.id,
          name: org.name,
          eliminatedBy: "capsule stain",
          expected: known ?? "no data",
          observed: observations.capsule,
        });
        passedIds.delete(org.id);
      }
    }
  }

  return {
    candidateIds: [...passedIds],
    eliminatedEntries,
  };
}

// ─────────────────────────────────────────────────────────────────
// INFORMATION GAIN / DISCRIMINATION VALUE
// ─────────────────────────────────────────────────────────────────

/**
 * Shannon entropy for N equally-likely outcomes.
 */
function entropy(n) {
  if (n <= 1) return 0;
  return Math.log2(n);
}

/**
 * Calculate information gain for a single test given remaining candidates.
 * Returns a number 0–1 (normalized information gain / current entropy).
 */
export function calcDiscriminationValue(testId, remainingIds) {
  const n = remainingIds.length;
  if (n <= 1) return 0;

  const currentEntropy = entropy(n);
  if (currentEntropy === 0) return 0;

  // Get candidate organisms
  const candidates = organisms.filter((o) => remainingIds.includes(o.id));

  // Group by known result for this test (composite tests rank by their
  // representative characteristic, e.g. mannitolSalt → mannitolFermentation)
  const char = rankingChar(testId);
  const groups = {}; // result string → count
  let variableCount = 0;

  for (const org of candidates) {
    const known = org.characteristics?.[char];
    if (known === undefined || known === null || known === "variable") {
      variableCount++;
    } else {
      const key = String(known).toLowerCase();
      groups[key] = (groups[key] || 0) + 1;
    }
  }

  const groupKeys = Object.keys(groups);
  if (groupKeys.length <= 1 && variableCount === 0) return 0;
  if (groupKeys.length === 0) return 0;

  // Distribute variable organisms proportionally across groups
  const definiteTotal = n - variableCount;
  let weightedPostEntropy = 0;

  for (const key of groupKeys) {
    const definiteInGroup = groups[key];
    const proportionalVariable = definiteTotal > 0
      ? variableCount * (definiteInGroup / definiteTotal)
      : variableCount / groupKeys.length;
    const effectiveSize = definiteInGroup + proportionalVariable;
    const weight = effectiveSize / n;
    weightedPostEntropy += weight * entropy(effectiveSize);
  }

  const gain = currentEntropy - weightedPostEntropy;
  return Math.max(0, gain / currentEntropy); // Normalize to 0–1
}

/**
 * Rank all applicable untested tests by discrimination value.
 * Returns array sorted descending: [{ testId, testName, discriminationValue, label }]
 */
export function rankTests(remainingIds, testedIds, flowchartSectionId) {
  const n = remainingIds.length;
  if (n <= 1) return [];

  const applicable = flowchartTestOrder[flowchartSectionId] || [];
  const untested = applicable.filter((id) => !testedIds.includes(id));

  const ranked = untested.map((testId) => {
    const testDef = tests.find((t) => t.id === testId);
    const dv = calcDiscriminationValue(testId, remainingIds);
    return {
      testId,
      testName: testDef?.name || testId,
      discriminationValue: Math.round(dv * 100), // 0–100
      label: dv > 0.6 ? "high" : dv > 0.3 ? "medium" : "low",
    };
  });

  return ranked.sort((a, b) => b.discriminationValue - a.discriminationValue);
}

// ─────────────────────────────────────────────────────────────────
// SANITY CHECK
// ─────────────────────────────────────────────────────────────────

/**
 * Cross-validate all recorded results against a proposed organism.
 * Returns { passed, score, conflicts }
 *
 * conflicts: [{ test, testName, expected, observed, severity }]
 * severity: "critical" | "warning" | "info"
 */
export function runSanityCheck(proposedOrganismId, gramReaction, gramShape, testResults, observations = {}) {
  const org = organisms.find((o) => o.id === proposedOrganismId);
  if (!org) return { passed: false, score: 0, conflicts: [{ test: "organism", testName: "Organism Lookup", expected: "valid ID", observed: "not found", severity: "critical" }] };

  const conflicts = [];

  // Check gram reaction
  if (gramReaction && org.gramReaction !== gramReaction) {
    conflicts.push({
      test: "gramReaction",
      testName: "Gram Reaction",
      expected: org.gramReaction,
      observed: gramReaction,
      severity: "critical",
    });
  }

  // Check cell shape (rod/coccobacillus compatible in both directions)
  if (gramShape && !shapesCompatible(gramShape, org.shape)) {
    conflicts.push({
      test: "gramShape",
      testName: "Cell Shape",
      expected: org.shape,
      observed: gramShape,
      severity: "critical",
    });
  }

  // Check Phase 1 stain observations against the proposed organism
  const stainChecks = [
    { observed: observations.endospore, prop: "endosporeForming", testName: "Endospore Stain" },
    { observed: observations.acidFast, prop: "acidFast", testName: "Acid-Fast Stain" },
  ];
  for (const { observed, prop, testName } of stainChecks) {
    if (observed !== "positive" && observed !== "negative") continue;
    const known = org[prop];
    if (known === undefined || known === null) continue;
    if ((known ? "positive" : "negative") !== observed) {
      conflicts.push({
        test: prop,
        testName,
        expected: known ? "positive" : "negative",
        observed,
        severity: "warning",
      });
    }
  }

  // Check each biochemical test result (composite tests decomposed)
  for (const [testId, entry] of Object.entries(testResults || {})) {
    const observed = entry.result;
    if (observed === null || observed === undefined) continue;
    const testName = tests.find((t) => t.id === testId)?.name || testId;

    for (const { char, observed: obsVal } of decomposeObservation(testId, observed)) {
      if (obsVal === null || obsVal === undefined) continue;
      const known = org.characteristics?.[char];
      if (known === undefined || known === null) continue;

      if (known === "variable") {
        conflicts.push({ test: char, testName, expected: "variable (strain-dependent)", observed: obsVal, severity: "info" });
        continue;
      }
      if (!resultMatches(known, obsVal)) {
        conflicts.push({ test: char, testName, expected: known, observed: obsVal, severity: "warning" });
      }
    }
  }

  const critical = conflicts.filter((c) => c.severity === "critical").length;
  const warnings = conflicts.filter((c) => c.severity === "warning").length;
  const infos = conflicts.filter((c) => c.severity === "info").length;

  // Absolute penalties so that adding conflicts always lowers the score
  // (dividing by a growing denominator previously let the score rise).
  const score = Math.max(0, 100 - (critical * 40 + warnings * 12 + infos * 3));

  return {
    passed: critical === 0 && warnings === 0,
    score,
    conflicts,
    criticalCount: critical,
    warningCount: warnings,
    infoCount: infos,
    summary:
      critical > 0
        ? `${critical} critical conflict${critical > 1 ? "s" : ""} — Gram stain or morphology does not match ${org.name}.`
        : warnings > 0
        ? `${warnings} biochemical mismatch${warnings > 1 ? "es" : ""} found. ~10% of strains deviate from typical results — rerun suspect tests before concluding.`
        : "All recorded results are consistent with the proposed identification.",
  };
}

/**
 * Get full organism objects for an array of IDs.
 */
export function getOrganismsByIds(ids) {
  return organisms.filter((o) => ids.includes(o.id));
}
