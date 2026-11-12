// MicroID Lab Guide — Direct PDF export (data sheet + risk assessment memo)
// jsPDF is loaded on demand so it never slows down the app's first load.

import { tests } from "../data/tests";

const PAGE = { w: 612, h: 792, margin: 48 }; // US Letter, points
const CONTENT_W = PAGE.w - PAGE.margin * 2;

// jsPDF's built-in fonts only cover Latin-1. Map the symbols the app uses to
// plain equivalents and drop anything else that can't be drawn.
export function pdfSafe(value) {
  return String(value ?? "")
    .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080))
    .replace(/[⁰¹²³⁴-⁹]/g, (c) => ({ "⁰": "0", "¹": "1", "²": "2", "³": "3" }[c] ?? String(c.charCodeAt(0) - 0x2070)))
    .replace(/[−–—]/g, "-")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/[•·]/g, "-")
    .replace(/ /g, " ")
    .replace(/\t/g, "  ")
    .replace(/[αβγδΔλΩ]/g, (c) => ({ "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "Δ": "delta", "λ": "lambda", "Ω": "ohm" }[c]))
    .replace(/μ/g, "µ")
    .replace(/[✓✔]/g, "yes")
    .replace(/[✗✘]/g, "no")
    .replace(/×/g, "x")
    // fold accented letters Latin-1 can't hold (ń → n); Latin-1 ones (é) are kept
    .replace(/[\u0100-\u024f]/g, (c) => c.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""))
    .replace(/[^\n\r\x20-\x7e\xa1-\xff]/g, "");
}

const slug = (s) => (String(s || "unknown").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") || "unknown");

export function formatResult(result) {
  return result && typeof result === "object"
    ? Object.entries(result).map(([k, v]) => `${k}: ${v}`).join(", ")
    : String(result ?? "");
}

// Small layout helper around a jsPDF document: tracks the cursor and adds
// pages as needed.
function createWriter(doc, font) {
  let y = PAGE.margin;
  const ensure = (needed) => {
    if (y + needed > PAGE.h - PAGE.margin) {
      doc.addPage();
      y = PAGE.margin;
    }
  };
  const w = {
    get y() { return y; },
    set y(v) { y = v; },
    ensure,
    space: (pts) => { y += pts; },
    text(str, { size = 10, style = "normal", color = [30, 41, 59], indent = 0, align = "left", lineGap = 1.35, width } = {}) {
      doc.setFont(font, style);
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const maxW = width ?? CONTENT_W - indent;
      const lines = doc.splitTextToSize(pdfSafe(str), maxW);
      const lh = size * lineGap;
      for (const line of lines) {
        ensure(lh);
        const x = align === "center" ? PAGE.w / 2 : PAGE.margin + indent;
        doc.text(line, x, y + size * 0.85, { align });
        y += lh;
      }
    },
    heading(str) {
      y += 10;
      ensure(30);
      w.text(str, { size: 12, style: "bold", color: [0, 48, 135] });
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.6);
      doc.line(PAGE.margin, y + 1, PAGE.w - PAGE.margin, y + 1);
      y += 7;
    },
    // Two-column label / value row with wrapping in the value column.
    row(label, value) {
      if (value === undefined || value === null || String(value).trim() === "") return;
      const labelW = 170;
      const size = 9.5;
      const lh = size * 1.35;
      doc.setFont(font, "normal");
      doc.setFontSize(size);
      const labelLines = doc.splitTextToSize(pdfSafe(label), labelW - 8);
      doc.setFont(font, "bold"); // measure the value in the weight it is drawn with
      const valueLines = doc.splitTextToSize(pdfSafe(value), CONTENT_W - labelW);
      const rows = Math.max(labelLines.length, valueLines.length);
      for (let i = 0; i < rows; i++) {
        ensure(lh);
        if (labelLines[i]) {
          doc.setFont(font, "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(labelLines[i], PAGE.margin, y + size * 0.85);
        }
        if (valueLines[i]) {
          doc.setFont(font, "bold");
          doc.setTextColor(30, 41, 59);
          doc.text(valueLines[i], PAGE.margin + labelW, y + size * 0.85);
        }
        y += lh;
      }
      y += 2;
    },
  };
  return w;
}

function addPageNumbers(doc, font, footer) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont(font, "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(pdfSafe(footer), PAGE.margin, PAGE.h - 24);
    doc.text(`Page ${i} of ${n}`, PAGE.w - PAGE.margin, PAGE.h - 24, { align: "right" });
  }
}

async function newDoc() {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ unit: "pt", format: "letter" });
}

// ─── Data sheet ──────────────────────────────────────────────────
export async function buildDataSheetPdf(data) {
  const { cadet, incident, gram, morphology, biochemical, finalId, org, customOrgName, testPhotos } = data;
  const doc = await newDoc();
  const font = "helvetica";
  const w = createWriter(doc, font);

  w.text("Bio 431: Unknown Bacterial Identification - Data Sheet", { size: 15, style: "bold", color: [0, 48, 135] });
  doc.setDrawColor(0, 48, 135);
  doc.setLineWidth(1.5);
  doc.line(PAGE.margin, w.y + 2, PAGE.w - PAGE.margin, w.y + 2);
  w.space(8);
  w.text("USAFA Department of Biology - Operational Microbiology", { size: 9, color: [100, 116, 139] });
  w.space(8);

  w.row("Cadet Name", cadet.name || "-");
  w.row("Lab Section", cadet.section || "-");
  w.row("Culture Number", cadet.cultureNumber || "-");
  w.row("Date", new Date().toLocaleDateString());

  if (incident?.scenario) {
    w.heading("Incident Report");
    w.text(incident.scenario, { size: 9.5 });
    w.space(3);
    w.row("Sample Source", incident.sampleSource);
    w.row("Location", incident.location);
    w.row("Sample ID", incident.sampleId);
    w.row("Date Reported", incident.dateReported);
    w.row("Notes", incident.notes);
  }

  if (org || customOrgName) {
    w.heading("Final Identification");
    w.text(org ? org.name : customOrgName, { size: 13, style: "bolditalic", color: [0, 48, 135] });
    w.space(2);
    w.row("Biosafety Level", org ? `BSL-${org.bslLevel}` : customOrgName ? "Write-in ID (not in database)" : "");
    w.row("Confidence", finalId?.confidence);
    w.row("Status", finalId?.confirmed ? "Confirmed by cadet" : "Proposed (not yet confirmed)");
    w.row("Justification", finalId?.notes);
  }

  w.heading("Morphological Characteristics");
  w.row("Gram Reaction", gram?.reaction);
  w.row("Cell Shape", gram?.shape);
  w.row("Arrangement", gram?.arrangement);
  w.row("Endospore", morphology?.endospore);
  w.row("Acid-Fast", morphology?.acidFast);
  w.row("Capsule", morphology?.capsule);
  w.row("Gram Stain Notes", gram?.notes);

  const colony = morphology?.colony || {};
  const colonyRows = [
    ["Colony Size", colony.size], ["Colony Shape", colony.shape], ["Margin", colony.margin],
    ["Elevation", colony.elevation], ["Pigment", colony.pigment], ["Opacity", colony.opacity],
    ["Surface Texture", colony.surfaceTexture], ["Growth Medium", colony.growthMedium],
    ["Growth Temperature", colony.growthTemp], ["Colony Notes", colony.notes],
  ].filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");
  if (colonyRows.length) {
    w.heading("Cultural Characteristics");
    colonyRows.forEach(([l, v]) => w.row(l, v));
  }

  w.heading("Biochemical / Physiological Characteristics");
  const entries = Object.entries(biochemical || {});
  if (entries.length === 0) w.text("No biochemical tests recorded.", { size: 9.5, color: [100, 116, 139] });
  for (const [testId, entry] of entries) {
    const testDef = tests.find((t) => t.id === testId);
    const notes = entry.notes ? ` (${entry.notes})` : "";
    const date = entry.recordedAt ? ` [${new Date(entry.recordedAt).toLocaleDateString()}]` : "";
    w.row(testDef?.name || testId, formatResult(entry.result) + notes + date);
  }

  const photos = Object.values(testPhotos || {}).filter((p) => typeof p?.dataUrl === "string" && p.dataUrl.startsWith("data:image/"));
  if (photos.length) {
    w.heading("Lab Photo Documentation");
    const cols = 2;
    const gap = 14;
    const cellW = (CONTENT_W - gap * (cols - 1)) / cols;
    const imgH = 150;
    const cellH = imgH + 46;
    photos.forEach((photo, i) => {
      const col = i % cols;
      if (col === 0) w.ensure(cellH);
      const x = PAGE.margin + col * (cellW + gap);
      const top = w.y;
      try {
        const props = doc.getImageProperties(photo.dataUrl);
        const scale = Math.min(cellW / props.width, imgH / props.height);
        const dw = props.width * scale;
        const dh = props.height * scale;
        doc.addImage(photo.dataUrl, props.fileType || "JPEG", x + (cellW - dw) / 2, top + (imgH - dh) / 2, dw, dh);
      } catch {
        doc.setFont(font, "italic");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("(photo could not be embedded)", x, top + 12);
      }
      doc.setFont(font, "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(doc.splitTextToSize(pdfSafe(photo.testName || "Photo"), cellW)[0] || "", x, top + imgH + 12);
      doc.setFont(font, "normal");
      doc.setTextColor(100, 116, 139);
      const sub = [photo.recordedResult ? `Result: ${photo.recordedResult}` : "", photo.caption || ""].filter(Boolean).join(" - ");
      if (sub) doc.text(doc.splitTextToSize(pdfSafe(sub), cellW).slice(0, 2), x, top + imgH + 23);
      if (col === cols - 1 || i === photos.length - 1) w.y = top + cellH;
    });
  }

  addPageNumbers(doc, font, `Generated by MicroID Lab Guide - Bio 431 USAFA - ${new Date().toLocaleString()}`);
  return { doc, filename: `MicroID_DataSheet_${slug(cadet.name)}_${new Date().toISOString().slice(0, 10)}.pdf` };
}

// ─── Commander's Risk Assessment Memo ────────────────────────────
export async function buildMemoPdf(data) {
  const { cadet, incident, org, customOrgName, finalId, testResults, memo } = data;
  const doc = await newDoc();
  const font = "times";
  const w = createWriter(doc, font);
  const black = [0, 0, 0];
  const body = (str, opts = {}) => w.text(str, { size: 11.5, color: black, ...opts });
  const section = (label) => {
    w.space(10);
    w.ensure(40);
    body(label, { style: "bold" });
    w.space(2);
  };

  body("DEPARTMENT OF THE AIR FORCE", { style: "bold", align: "center", size: 13 });
  body("United States Air Force Academy", { align: "center" });
  body("USAFA Department of Biology - Bio 431: Operational Microbiology", { align: "center" });
  w.space(16);

  body("MEMORANDUM FOR RECORD", { style: "bold" });
  w.space(4);
  body(`FROM: ${cadet.name || "[Cadet Name]"}, Bio 431 Lab Section ${cadet.section || "___"}`);
  body(`DATE: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  body(`SUBJECT: Commander's Risk Assessment - Unknown Bacterial Identification, Culture ${cadet.cultureNumber || "___"}`);

  section("1. INCIDENT CONTEXT");
  body(incident?.scenario || "[No incident scenario provided]");
  body(`Sample Source: ${incident?.sampleSource || "N/A"} | Location: ${incident?.location || "N/A"} | Sample ID: ${incident?.sampleId || "N/A"}`);

  section("2. ORGANISM IDENTIFIED");
  body(org ? org.name : customOrgName || "[Not yet confirmed]", { style: "italic" });
  body(`BSL Level: ${org ? org.bslLevel : "N/A"}`);
  body(`Identification Confidence: ${finalId?.confidence || "N/A"}`);
  if (finalId?.notes) body(`Justification: ${finalId.notes}`);

  section("3. IDENTIFICATION EVIDENCE SUMMARY");
  const results = Object.entries(testResults || {});
  if (results.length === 0) body("- No biochemical tests recorded");
  else {
    body("Key test results supporting this identification:");
    for (const [testId, entry] of results) {
      const testDef = tests.find((t) => t.id === testId);
      body(`- ${testDef?.name || testId}: ${formatResult(entry.result)}`, { indent: 12 });
    }
  }

  section("4. OPERATIONAL THREAT ASSESSMENT");
  if (org) {
    body(`Known threat profile for ${org.name}: ${org.operationalThreat}`, { style: "italic" });
    w.space(6);
  } else if (customOrgName) {
    body(`Identified organism: ${customOrgName}`, { style: "italic" });
    w.space(6);
  }
  body(memo?.operationalThreatAssessment?.trim() || "[Cadet assessment of operational risk in the context of this incident - not yet written]");

  section("5. RECOMMENDED COUNTERMEASURES");
  body(memo?.recommendedCountermeasures?.trim() || "[Recommended controls - not yet written]");

  section("6. SUPPORTING DOCUMENTATION");
  body(`Identification data sheet attached. Total tests performed: ${results.length}.`);

  w.ensure(130); // keep the signature block together on one page
  w.space(44);
  body("________________________________");
  body(cadet.name || "[Cadet Name]");
  body(`Bio 431, Lab Section ${cadet.section || "___"}`);
  body("USAFA Department of Biology");

  addPageNumbers(doc, font, "MicroID Lab Guide - Commander's Risk Assessment Memo");
  return { doc, filename: `MicroID_RiskMemo_${slug(cadet.name)}_${new Date().toISOString().slice(0, 10)}.pdf` };
}

/**
 * Hand the finished PDF to the user. On phones/tablets the share sheet is the
 * reliable route (Save to Files, AirDrop, Mail) — plain downloads are flaky
 * inside an installed home-screen app. Elsewhere it downloads directly.
 * Returns "shared" | "downloaded" | "cancelled".
 */
export async function deliverPdf({ doc, filename }) {
  const blob = doc.output("blob");
  const touch = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
  if (touch && typeof File !== "undefined" && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return "shared";
      }
    } catch (err) {
      if (err?.name === "AbortError") return "cancelled";
      // fall through to a normal download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return "downloaded";
}
