// MicroID Lab Guide — Course configuration (tests stocked + unknown pool)
// Pure helpers: no React, no store access.

import { tests, flowchartTestOrder } from "../data/tests";
import { organisms } from "../data/organisms";
import { getFlowchartId } from "../data/flowcharts";
import { resultMatches } from "./decisionEngine";

// The Gram stain drives all routing and can never be switched off.
export const REQUIRED_TEST_IDS = ["gramStain"];

// Tests an instructor can switch on/off. The ORDER of this list (and of
// organisms.js) defines the class-code bit positions — only ever append new
// entries to the END of tests.js / organisms.js, or previously shared class
// codes will decode incorrectly.
export const CONFIGURABLE_TESTS = tests.filter((t) => !REQUIRED_TEST_IDS.includes(t.id));

// ─── Unknown pool ────────────────────────────────────────────────
export const DEFAULT_POOL_IDS = organisms.filter((o) => o.isAssignableUnknown).map((o) => o.id);

/** Keep only ids that are real organisms. */
export function sanitizePool(ids) {
  const valid = new Set(organisms.map((o) => o.id));
  return [...new Set((Array.isArray(ids) ? ids : []).filter((id) => valid.has(id)))];
}

/** Resolve the active pool: the instructor's override, or the built-in default. */
export function getPoolIds(poolOverride) {
  return Array.isArray(poolOverride) ? sanitizePool(poolOverride) : DEFAULT_POOL_IDS;
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// ─── Class codes ─────────────────────────────────────────────────
const toMask = (list, ids) => {
  let mask = 0n;
  list.forEach((item, i) => {
    if (ids.includes(item.id)) mask |= 1n << BigInt(i);
  });
  return mask;
};
const fromMask = (list, mask) => list.filter((_, i) => (mask >> BigInt(i)) & 1n).map((x) => x.id);
const parse36 = (str) => {
  let n = 0n;
  for (const ch of str) n = n * 36n + BigInt(parseInt(ch, 36));
  return n;
};

/**
 * Encode the course setup as a short class code.
 *   "MID-<tests>"          tests switched off, default pool
 *   "MID-<tests>-<pool>"   plus a custom unknown pool
 */
export function encodeClassCode(disabledIds, poolOverride = null) {
  let code = `MID-${toMask(CONFIGURABLE_TESTS, disabledIds || []).toString(36).toUpperCase()}`;
  if (Array.isArray(poolOverride) && !sameSet(sanitizePool(poolOverride), DEFAULT_POOL_IDS)) {
    code += `-${toMask(organisms, poolOverride).toString(36).toUpperCase()}`;
  }
  return code;
}

/**
 * Decode a class code → { disabledTests, poolOverride } (poolOverride is null
 * when the code carries no custom pool), or null if the code is invalid.
 */
export function decodeClassCode(code) {
  const m = String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .match(/^MID-?([0-9A-Z]{1,12})(?:-([0-9A-Z]{1,12}))?$/);
  if (!m) return null;
  const testMask = parse36(m[1]);
  if (testMask >> BigInt(CONFIGURABLE_TESTS.length) !== 0n) return null; // bits beyond known tests
  let poolOverride = null;
  if (m[2] !== undefined) {
    const poolMask = parse36(m[2]);
    if (poolMask >> BigInt(organisms.length) !== 0n) return null;
    poolOverride = fromMask(organisms, poolMask);
  }
  return { disabledTests: fromMask(CONFIGURABLE_TESTS, testMask), poolOverride };
}

/** Keep only ids that are real, configurable tests. */
export function sanitizeDisabled(ids) {
  const valid = new Set(CONFIGURABLE_TESTS.map((t) => t.id));
  return [...new Set((Array.isArray(ids) ? ids : []).filter((id) => valid.has(id)))];
}

// ─── Identifiability check ───────────────────────────────────────
// Characteristics a recorded test tells the engine about (mirrors
// decomposeObservation in decisionEngine.js).
function charsForTest(testId) {
  if (testId === "kia") return ["glucoseFermentation", "lactoseFermentation", "h2s"];
  if (testId === "mannitolSalt") return ["mannitolFermentation"];
  return [testId];
}

const definite = (v) => v !== undefined && v !== null && v !== "variable";

/**
 * Can two organisms in the same flowchart section be told apart with the tests
 * that are still available? Returns the id of one separating test, or null.
 */
function separatingTest(a, b, sectionId, disabled) {
  const stainChecks = [
    ["endosporeStain", a.endosporeForming !== b.endosporeForming],
    ["acidFastStain", a.acidFast !== b.acidFast],
    [
      "capsuleStain",
      definite(a.characteristics.capsuleStain) &&
        definite(b.characteristics.capsuleStain) &&
        a.characteristics.capsuleStain !== b.characteristics.capsuleStain,
    ],
  ];
  for (const [id, differs] of stainChecks) {
    if (differs && !disabled.has(id)) return id;
  }
  for (const testId of flowchartTestOrder[sectionId] || []) {
    if (disabled.has(testId)) continue;
    for (const char of charsForTest(testId)) {
      const va = a.characteristics[char];
      const vb = b.characteristics[char];
      if (definite(va) && definite(vb) && !resultMatches(va, vb)) return testId;
    }
  }
  return null;
}

/**
 * For a given set of unavailable tests, list the organism pairs that can no
 * longer be separated. `pool` is an array of organism ids to check, or "all"
 * for the whole database. Returns [{ a, b, sectionId }] (organism objects).
 */
export function findUnresolvablePairs(disabledIds, pool = DEFAULT_POOL_IDS) {
  const disabled = new Set(disabledIds);
  const list = pool === "all" ? organisms : organisms.filter((o) => pool.includes(o.id));
  const pairs = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (a.gramReaction !== b.gramReaction) continue;
      const sa = getFlowchartId(a.gramReaction, a.shape);
      const sb = getFlowchartId(b.gramReaction, b.shape);
      if (sa !== sb) continue;
      if (!separatingTest(a, b, sa, disabled)) pairs.push({ a, b, sectionId: sa });
    }
  }
  return pairs;
}
