// MicroID Lab Guide — Instructor grading helpers (pure functions)

import { organisms } from "../data/organisms";

const ORGANISM_ALIASES = { "enterobacter-aerogenes": "klebsiella-aerogenes" };
const byId = Object.fromEntries(organisms.map((o) => [o.id, o]));
const normName = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
const byName = Object.fromEntries(organisms.map((o) => [normName(o.name), o]));
// Former names a cadet might still write in.
const NAME_ALIASES = { [normName("Enterobacter aerogenes")]: "klebsiella-aerogenes" };

/** "Unknown #4", " 04 ", "culture 4" → "4" so cadet entries match the key. */
export function normalizeCulture(value) {
  const s = String(value ?? "").toLowerCase().replace(/unknown|culture|sample|number|no\.?|#/g, "").replace(/[^a-z0-9]/g, "");
  return s.replace(/^0+(?=.)/, "");
}

/** Resolve what a cadet identified: a database organism and/or a written-in name. */
export function resolveIdentification(snapshot) {
  const rawId = snapshot?.proposedOrganismId;
  const id = rawId ? ORGANISM_ALIASES[rawId] || rawId : null;
  if (id && byId[id]) return { organismId: id, name: byId[id].name, writeIn: false };
  const custom = String(snapshot?.customOrganismName || "").trim();
  if (custom) {
    const key = normName(custom);
    const match = byName[key] || byId[NAME_ALIASES[key]]; // a write-in naming a database organism (or its former name) still counts
    return { organismId: match ? match.id : null, name: custom, writeIn: true };
  }
  return { organismId: null, name: "", writeIn: false };
}

/**
 * Grade one cadet session (a backup snapshot) against the answer key.
 * answerKey: [{ culture, organismId }]
 * status: "correct" | "incorrect" | "no-id" | "no-key"
 */
export function gradeSnapshot(snapshot, answerKey = []) {
  const culture = String(snapshot?.cultureNumber ?? "").trim();
  const keyRow = answerKey.find((k) => normalizeCulture(k.culture) !== "" && normalizeCulture(k.culture) === normalizeCulture(culture));
  const keyOrg = keyRow ? byId[keyRow.organismId] : null;
  const ident = resolveIdentification(snapshot);
  const confirmed = !!snapshot?.identificationConfirmed;

  let status;
  if (!ident.name) status = "no-id";
  else if (!keyOrg) status = "no-key";
  else status = ident.organismId === keyOrg.id ? "correct" : "incorrect";

  const g = snapshot?.gramStain || {};
  return {
    sessionId: String(snapshot?.sessionId ?? ""),
    cadetName: String(snapshot?.cadetName ?? ""),
    labSection: String(snapshot?.labSection ?? ""),
    cultureNumber: culture,
    identifiedAs: ident.name,
    writeIn: ident.writeIn,
    confirmed,
    confidence: String(snapshot?.identificationConfidence ?? ""),
    keyOrganism: keyOrg ? keyOrg.name : "",
    status,
    testsRecorded: Object.keys(snapshot?.testResults || {}).length,
    gram: [g.reaction ? `Gram-${g.reaction}` : "", g.shape || "", g.arrangement || ""].filter(Boolean).join(" "),
    lastModifiedAt: String(snapshot?.lastModifiedAt ?? ""),
  };
}

export const STATUS_LABELS = {
  correct: "Correct",
  incorrect: "Incorrect",
  "no-id": "No ID yet",
  "no-key": "No key entry",
};

// Spreadsheet apps run cells starting with = + - @ as formulas; neutralize them.
function csvCell(value) {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build the class summary CSV from graded rows. */
export function toCsv(rows) {
  const header = ["Cadet", "Section", "Culture #", "Identified as", "Write-in", "Confirmed", "Confidence", "Answer key", "Result", "Tests recorded", "Gram stain", "Last modified"];
  const lines = rows.map((r) =>
    [
      r.cadetName, r.labSection, r.cultureNumber, r.identifiedAs, r.writeIn ? "yes" : "no",
      r.confirmed ? "yes" : "no", r.confidence, r.keyOrganism, STATUS_LABELS[r.status] || r.status,
      r.testsRecorded, r.gram, r.lastModifiedAt,
    ].map(csvCell).join(",")
  );
  return [header.map(csvCell).join(","), ...lines].join("\r\n");
}
