// MicroID Lab Guide — Flowchart path resolution
// Pure helpers that walk a flowchart section's routing steps using the
// results recorded so far, so the UI can highlight the path taken.

import { resultMatches } from "./decisionEngine";

/**
 * What has the student observed for a routing step's test?
 * Returns a string result, or null if nothing is recorded yet.
 * state: { testResults, endosporeResult, acidFastResult, gramStain }
 */
export function observedForStep(step, state) {
  const { testResults = {}, endosporeResult = null, acidFastResult = null, gramStain = {} } = state;
  const recorded = (id) => {
    const r = testResults[id]?.result;
    return r === undefined || r === null || typeof r === "object" ? null : String(r);
  };

  if (!step.test) {
    // Morphology step (regular vs pleomorphic rods) — read it from the
    // arrangement recorded with the Gram stain.
    if (!gramStain.arrangement) return null;
    return gramStain.arrangement === "palisades" || gramStain.arrangement === "irregular" ? "pleomorphic" : "regular";
  }
  if (step.test === "endosporeStain") return endosporeResult || recorded("endosporeStain");
  if (step.test === "acidFastStain") return acidFastResult || recorded("acidFastStain");
  if (step.test === "glucoseFermentation") {
    const direct = recorded("glucoseFermentation");
    if (direct) return direct;
    const butt = testResults.kia?.result?.butt; // KIA butt reports glucose
    if (butt) return butt === "acid" ? "acid" : "negative";
    return null;
  }
  if (step.test === "h2s") return recorded("h2s") || testResults.kia?.result?.h2s || null;
  return recorded(step.test);
}

/** Which branch of a step does an observed result select? (index or -1) */
export function matchBranch(step, observed) {
  if (observed === null || observed === undefined) return -1;
  const exact = step.branches.findIndex((b) => String(b.result).toLowerCase() === String(observed).toLowerCase());
  if (exact >= 0) return exact;
  return step.branches.findIndex((b) => resultMatches(b.result, observed));
}

/**
 * Build a nested tree for a section, annotated with the student's path.
 * node: { step, observed, chosen, onPath, branches: [{ branch, taken, child }] }
 *   onPath  — every earlier step on the way here has a recorded result
 *   chosen  — index of the branch the recorded result selects (-1 = not yet)
 */
export function buildFlowTree(section, state) {
  if (!section?.routingSteps?.length) return null;
  const byId = Object.fromEntries(section.routingSteps.filter((s) => s.id).map((s) => [s.id, s]));
  const visit = (step, onPath, seen) => {
    const observed = observedForStep(step, state);
    const chosen = onPath ? matchBranch(step, observed) : -1;
    return {
      step,
      observed: onPath ? observed : null,
      chosen,
      onPath,
      branches: step.branches.map((branch, i) => {
        const next = branch.next && !seen.has(branch.next) ? byId[branch.next] : null;
        return {
          branch,
          taken: chosen === i,
          child: next ? visit(next, onPath && chosen === i, new Set([...seen, branch.next])) : null,
        };
      }),
    };
  };
  return visit(section.routingSteps[0], true, new Set());
}

/**
 * Summarize where the student currently is in the tree.
 * Returns { steps: [{ step, observed, branch }], nextStep, endBranch }
 *   nextStep  — the first step on the path with no result yet (or null)
 *   endBranch — the terminal branch reached (lists candidate genera), or null
 */
export function summarizePath(tree) {
  const steps = [];
  let node = tree;
  while (node) {
    if (node.chosen < 0) return { steps, nextStep: node.step, endBranch: null };
    const picked = node.branches[node.chosen];
    steps.push({ step: node.step, observed: node.observed, branch: picked.branch });
    if (!picked.child) return { steps, nextStep: null, endBranch: picked.branch };
    node = picked.child;
  }
  return { steps, nextStep: null, endBranch: null };
}
