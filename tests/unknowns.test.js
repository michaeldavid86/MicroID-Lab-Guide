// Regression test: every unknown assigned in the course must be uniquely
// identifiable by the decision engine when a student records the correct
// result for each test in that organism's flowchart section.
import { describe, it, expect } from "vitest";
import { organisms } from "../src/data/organisms.js";
import { flowchartTestOrder, tests } from "../src/data/tests.js";
import { getFlowchartId } from "../src/data/flowcharts.js";
import { runElimination, runSanityCheck, rankTests } from "../src/utils/decisionEngine.js";
import { encodeClassCode, decodeClassCode, findUnresolvablePairs, CONFIGURABLE_TESTS, DEFAULT_POOL_IDS } from "../src/utils/courseConfig.js";
import { flowchartSections } from "../src/data/flowcharts.js";
import { buildFlowTree, summarizePath } from "../src/utils/flowPath.js";
import { gradeSnapshot, normalizeCulture, toCsv } from "../src/utils/grading.js";
import { pdfSafe } from "../src/utils/pdfExport.js";

const ASSIGNED_UNKNOWNS = [
  "bacillus-subtilis",
  "serratia-marcescens",
  "staphylococcus-epidermidis",
  "enterobacter-cloacae",
  "klebsiella-aerogenes",
  "micrococcus-luteus",
  "alcaligenes-faecalis",
  "listeria-innocua",
];

const byId = Object.fromEntries(organisms.map((o) => [o.id, o]));
const isAcid = (v) => v === "acid" || v === "acid and gas" || v === "positive";

function simulate(org) {
  const section = getFlowchartId(org.gramReaction, org.shape);
  const testResults = {};
  for (const testId of flowchartTestOrder[section] || []) {
    const c = org.characteristics;
    if (testId === "kia") {
      if (c.glucoseFermentation === undefined && c.lactoseFermentation === undefined) continue;
      testResults.kia = {
        result: {
          slant: isAcid(c.lactoseFermentation) ? "acid" : "alkaline",
          butt: isAcid(c.glucoseFermentation) ? "acid" : "alkaline",
          gas: c.glucoseFermentation === "acid and gas" ? "positive" : "negative",
          h2s: c.h2s === "positive" ? "positive" : "negative",
        },
      };
      continue;
    }
    if (testId === "mannitolSalt") {
      const m = c.mannitolFermentation;
      if (m === undefined || m === "variable") continue;
      testResults.mannitolSalt = { result: isAcid(m) ? "positive" : "negative" };
      continue;
    }
    const val = c[testId];
    if (val === undefined || val === null || val === "variable") continue;
    testResults[testId] = { result: val };
  }
  const observations = {
    endospore: org.endosporeForming ? "positive" : "negative",
    acidFast: org.acidFast ? "positive" : "negative",
    capsule: null,
  };
  return { section, testResults, observations };
}

describe("organism database", () => {
  it("has unique ids and names", () => {
    expect(new Set(organisms.map((o) => o.id)).size).toBe(organisms.length);
    expect(new Set(organisms.map((o) => o.name)).size).toBe(organisms.length);
  });

  it("routes every organism to a flowchart section with a test order", () => {
    for (const org of organisms) {
      const section = getFlowchartId(org.gramReaction, org.shape);
      expect(section, org.name).toBeTruthy();
      expect(flowchartTestOrder[section], `${org.name} → ${section}`).toBeTruthy();
    }
  });

  it("only lists tests that exist in each flowchart test order", () => {
    const ids = new Set(tests.map((t) => t.id));
    for (const [section, order] of Object.entries(flowchartTestOrder)) {
      for (const id of order) expect(ids.has(id), `${section}: ${id}`).toBe(true);
    }
  });
});

describe("data integrity", () => {
  it("only uses characteristic values the matching test can actually produce", () => {
    const fermentish = new Set(["positive", "negative", "acid", "acid and gas"]);
    for (const org of organisms) {
      for (const [key, val] of Object.entries(org.characteristics)) {
        const def = tests.find((t) => t.id === key);
        if (!def || val === null || val === "variable") continue;
        const allowed = (def.possibleResults || []).filter((r) => typeof r === "string");
        if (!allowed.length) continue;
        const ok = allowed.includes(val) || (fermentish.has(val) && allowed.some((r) => fermentish.has(r)));
        expect(ok, `${org.name}: ${key}=${val} not in [${allowed.join(", ")}]`).toBe(true);
      }
    }
  });

  it("uses a stain recorded as a Phase 3 test when Phase 1 left it blank", () => {
    const { candidateIds } = runElimination("positive", "rod", { endosporeStain: { result: "negative" }, acidFastStain: { result: "negative" } }, {});
    expect(candidateIds).not.toContain("bacillus-subtilis");
    expect(candidateIds).not.toContain("mycobacterium-smegmatis");
    expect(candidateIds).toContain("listeria-innocua");
  });

  it("keeps Moraxella when it is read as a coccobacillus", () => {
    expect(runElimination("negative", "coccobacillus", {}, {}).candidateIds).toContain("moraxella-catarrhalis");
    expect(runElimination("negative", "coccus", {}, {}).candidateIds).toContain("moraxella-catarrhalis");
  });
});

describe("assigned unknowns", () => {
  it.each(ASSIGNED_UNKNOWNS)("%s is uniquely identified", (id) => {
    const org = byId[id];
    expect(org, `${id} missing from organisms.js`).toBeTruthy();
    const { testResults, observations } = simulate(org);
    const { candidateIds } = runElimination(org.gramReaction, org.shape, testResults, observations);
    expect(candidateIds).toEqual([id]);
    const sanity = runSanityCheck(id, org.gramReaction, org.shape, testResults, observations);
    expect(sanity.conflicts).toHaveLength(0);
    expect(sanity.score).toBe(100);
  });

  it("never eliminates an organism given its own correct results", () => {
    for (const org of organisms) {
      const { testResults, observations } = simulate(org);
      const { candidateIds } = runElimination(org.gramReaction, org.shape, testResults, observations);
      expect(candidateIds, org.name).toContain(org.id);
    }
  });
});

describe("course setup", () => {
  it("round-trips class codes (tests + pool)", () => {
    for (const ids of [[], ["camp"], ["camp", "pyr", "kia", "growthIn75NaCl"], CONFIGURABLE_TESTS.map((t) => t.id)]) {
      const d = decodeClassCode(encodeClassCode(ids));
      expect(d.disabledTests.sort()).toEqual([...ids].sort());
      expect(d.poolOverride).toBeNull();
    }
    const withPool = decodeClassCode(encodeClassCode(["camp"], ASSIGNED_UNKNOWNS));
    expect(withPool.disabledTests).toEqual(["camp"]);
    expect(withPool.poolOverride.sort()).toEqual([...ASSIGNED_UNKNOWNS].sort());
    expect(decodeClassCode(encodeClassCode([], [])).poolOverride).toEqual([]);
    expect(encodeClassCode([], DEFAULT_POOL_IDS)).toBe(encodeClassCode([]));
    expect(decodeClassCode("nonsense!")).toBeNull();
    expect(decodeClassCode("MID-ZZZZZZZZZZZZ")).toBeNull();
    expect(decodeClassCode("MID-0-ZZZZZZZZZZZZ")).toBeNull();
  });

  it("can separate every pair of assigned unknowns with all tests on", () => {
    expect(findUnresolvablePairs([], ASSIGNED_UNKNOWNS)).toEqual([]);
  });

  it("flags pairs that depend on a test that is switched off", () => {
    const pairs = findUnresolvablePairs(["novobiocin", "urease", "nitrateReduction", "mannitolSalt", "mannitolFermentation", "lactoseFermentation", "maltoseFermentation"], "all");
    const names = pairs.map(({ a, b }) => `${a.id}|${b.id}`);
    expect(names).toContain("staphylococcus-epidermidis|staphylococcus-saprophyticus");
  });

  it("never recommends an unavailable test", () => {
    const ids = organisms.filter((o) => o.gramReaction === "negative" && o.shape === "rod").map((o) => o.id);
    const ranked = rankTests(ids, [], "gramNegativeRod", ["indole", "kia"]);
    expect(ranked.map((r) => r.testId)).not.toContain("indole");
    expect(ranked.map((r) => r.testId)).not.toContain("kia");
    expect(ranked.length).toBeGreaterThan(0);
  });
});

describe("flowchart path", () => {
  const section = (id) => flowchartSections.find((s) => s.id === id);

  it("every `next` link points at a real step and every step is reachable", () => {
    for (const s of flowchartSections) {
      const ids = new Set(s.routingSteps.map((st) => st.id).filter(Boolean));
      const linked = new Set();
      for (const st of s.routingSteps) for (const b of st.branches) if (b.next) { expect(ids.has(b.next), `${s.id}: ${b.next}`).toBe(true); linked.add(b.next); }
      s.routingSteps.slice(1).forEach((st) => expect(linked.has(st.id), `${s.id}: step ${st.id} unreachable`).toBe(true));
    }
  });

  it("follows recorded results down the Gram-negative rod tree", () => {
    const state = { testResults: { oxidase: { result: "negative" }, motility: { result: "positive" } }, gramStain: {} };
    const sum = summarizePath(buildFlowTree(section("gramNegativeRod"), state));
    expect(sum.steps.map((s) => s.step.test)).toEqual(["oxidase", "motility"]);
    expect(sum.nextStep.test).toBe("citrate");
    state.testResults.citrate = { result: "positive" };
    const done = summarizePath(buildFlowTree(section("gramNegativeRod"), state));
    expect(done.nextStep).toBeNull();
    expect(done.endBranch.genera).toContain("Klebsiella aerogenes");
  });

  it("reads stains and KIA when walking the tree", () => {
    const rod = summarizePath(buildFlowTree(section("gramPositiveRod"), { testResults: { catalase: { result: "positive" } }, endosporeResult: "positive", gramStain: {} }));
    expect(rod.endBranch.genera).toEqual(["Bacillus"]);
    const cocci = summarizePath(buildFlowTree(section("gramPositiveCoccus"), { testResults: { catalase: { result: "positive" }, kia: { result: { butt: "alkaline" } } }, gramStain: {} }));
    expect(cocci.endBranch.genera).toContain("Micrococcus");
  });

  it("leads each assigned unknown to a branch that names it (or its genus)", () => {
    for (const id of ASSIGNED_UNKNOWNS) {
      const org = byId[id];
      const { section: sid, testResults, observations } = simulate(org);
      // the simulation only records tests in the section order; add the routing tests it skipped
      for (const st of section(sid).routingSteps) {
        if (st.test && !testResults[st.test] && org.characteristics[st.test] !== undefined && org.characteristics[st.test] !== null) {
          testResults[st.test] = { result: org.characteristics[st.test] };
        }
      }
      const sum = summarizePath(buildFlowTree(section(sid), {
        testResults, endosporeResult: observations.endospore, acidFastResult: observations.acidFast,
        gramStain: { arrangement: org.arrangement },
      }));
      expect(sum.endBranch, `${org.name} did not reach a terminal branch (stuck at ${sum.nextStep?.test || sum.nextStep?.id})`).toBeTruthy();
      const genus = org.name.split(" ")[0];
      expect(sum.endBranch.genera.some((g) => g === org.name || g === genus), `${org.name} → ${sum.endBranch.label}`).toBe(true);
    }
  });
});

describe("instructor grading", () => {
  const key = [{ culture: "4", organismId: "serratia-marcescens" }, { culture: "5", organismId: "klebsiella-aerogenes" }];

  it("matches culture numbers however cadets type them", () => {
    for (const v of ["4", " 04", "#4", "Unknown #4", "culture 4"]) expect(normalizeCulture(v)).toBe("4");
  });

  it("grades correct, incorrect, write-in, missing-ID and missing-key cases", () => {
    const g = (snap) => gradeSnapshot({ sessionId: "X", ...snap }, key).status;
    expect(g({ cultureNumber: "#4", proposedOrganismId: "serratia-marcescens" })).toBe("correct");
    expect(g({ cultureNumber: "4", proposedOrganismId: "escherichia-coli" })).toBe("incorrect");
    expect(g({ cultureNumber: "5", proposedOrganismId: "enterobacter-aerogenes" })).toBe("correct"); // legacy id
    expect(g({ cultureNumber: "5", customOrganismName: "klebsiella  aerogenes" })).toBe("correct");
    expect(g({ cultureNumber: "5", customOrganismName: "Enterobacter aerogenes" })).toBe("correct");
    expect(g({ cultureNumber: "5", customOrganismName: "Something else" })).toBe("incorrect");
    expect(g({ cultureNumber: "4" })).toBe("no-id");
    expect(g({ cultureNumber: "9", proposedOrganismId: "escherichia-coli" })).toBe("no-key");
  });

  it("writes a safe CSV", () => {
    const rows = [gradeSnapshot({ sessionId: "A", cadetName: '=HYPERLINK("x")', labSection: "T1, M2", cultureNumber: "4", proposedOrganismId: "serratia-marcescens" }, key)];
    const csv = toCsv(rows);
    const [header, line] = csv.split("\r\n");
    expect(header.split(",")).toHaveLength(12);
    expect(line.startsWith(`"'=HYPERLINK(""x"")"`)).toBe(true);
    expect(line).toContain('"T1, M2"');
    expect(line).toContain("Correct");
  });
});

describe("pdf text", () => {
  it("maps symbols the built-in PDF fonts cannot draw", () => {
    expect(pdfSafe("H₂S − positive → “ok” ≥ 3 🔬")).toBe('H2S - positive -> "ok" >= 3 ');
    expect(pdfSafe("café\nline")).toBe("café\nline");
    expect(pdfSafe("β-hemolysis ✓ 100×")).toBe("beta-hemolysis yes 100x");
  });
});
