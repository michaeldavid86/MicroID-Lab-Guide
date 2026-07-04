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
    if (shape && org.shape !== shape && !(shape === "rod" && org.shape === "coccobacillus")) return false;
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

  // For each recorded biochemical test, try to eliminate organisms
  for (const [testId, entry] of Object.entries(testResults || {})) {
    const observed = entry.result;
    if (observed === null || observed === undefined) continue;

    for (const org of organisms) {
      if (!passedIds.has(org.id)) continue; // Already eliminated

      const known = org.characteristics?.[testId];
      if (!resultMatches(known, observed)) {
        eliminatedEntries.push({
          organismId: org.id,
          name: org.name,
          eliminatedBy: testId,
          expected: known ?? "no data",
          observed,
        });
        passedIds.delete(org.id);
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

  // Group by known result for this test
  const groups = {}; // result string → count
  let variableCount = 0;

  for (const org of candidates) {
    const known = org.characteristics?.[testId];
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

  // Check cell shape
  if (gramShape && org.shape !== gramShape && !(gramShape === "rod" && org.shape === "coccobacillus")) {
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

  // Check each biochemical test result
  for (const [testId, entry] of Object.entries(testResults || {})) {
    const observed = entry.result;
    if (observed === null || observed === undefined) continue;

    const known = org.characteristics?.[testId];
    if (known === undefined || known === null) continue;

    if (known === "variable") {
      conflicts.push({
        test: testId,
        testName: tests.find((t) => t.id === testId)?.name || testId,
        expected: "variable (strain-dependent)",
        observed,
        severity: "info",
      });
      continue;
    }

    if (!resultMatches(known, observed)) {
      conflicts.push({
        test: testId,
        testName: tests.find((t) => t.id === testId)?.name || testId,
        expected: known,
        observed,
        severity: "warning",
      });
    }
  }

  const critical = conflicts.filter((c) => c.severity === "critical").length;
  const warnings = conflicts.filter((c) => c.severity === "warning").length;
  const infos = conflicts.filter((c) => c.severity === "info").length;

  const totalChecks = 2 + Object.keys(testResults || {}).length;
  const penaltyScore = critical * 30 + warnings * 10 + infos * 2;
  const score = Math.max(0, Math.round(100 - (penaltyScore / totalChecks)));

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
