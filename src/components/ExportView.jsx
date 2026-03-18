import { useRef } from "react";
import { useNavigate } from "react-router";
import { useSessionStore } from "../stores/useSessionStore";
import { organisms } from "../data/organisms";
import { tests } from "../data/tests";
import { Download, FileText, Shield, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import Card from "./shared/Card";
import Badge from "./shared/Badge";

// Simple print-based PDF export
function printDataSheet(data) {
  const win = window.open("", "_blank");
  const { cadet, incident, gram, morphology, biochemical, finalId, org, testPhotos } = data;

  const row = (label, value) => value
    ? `<tr><td style="color:#64748b;padding:4px 8px;border-bottom:1px solid #f1f5f9;width:180px;font-size:12px;">${label}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:500;">${String(value)}</td></tr>`
    : "";

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Bio 431 — Unknown Bacterial Identification Data Sheet</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }
    h1 { font-size: 18px; border-bottom: 3px solid #003087; padding-bottom: 8px; color: #003087; }
    h2 { font-size: 14px; color: #003087; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    td { vertical-align: top; }
    .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .header-field { background: #f8fafc; padding: 8px; border-radius: 4px; }
    .header-field label { font-size: 10px; color: #94a3b8; display: block; }
    .header-field value { font-size: 13px; font-weight: bold; }
    .incident { background: #fff7ed; border: 1px solid #fed7aa; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
    .final-id { background: #f0fdf4; border: 2px solid #86efac; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
    @media print { body { margin: 10px; } }
  </style>
</head>
<body>
  <h1>🔬 Bio 431: Unknown Bacterial Identification — Data Sheet</h1>
  <p style="font-size:11px;color:#94a3b8;margin-bottom:16px;">USAFA Department of Biology · Operational Microbiology</p>

  <div class="header-grid">
    <div class="header-field"><label>Cadet Name</label><div>${cadet.name || "—"}</div></div>
    <div class="header-field"><label>Lab Section</label><div>${cadet.section || "—"}</div></div>
    <div class="header-field"><label>Culture Number</label><div>${cadet.cultureNumber || "—"}</div></div>
    <div class="header-field"><label>Date</label><div>${new Date().toLocaleDateString()}</div></div>
  </div>

  ${incident.scenario ? `
  <div class="incident">
    <strong style="font-size:12px;color:#9a3412;">📋 Incident Report</strong>
    <p style="margin:6px 0 0;font-size:12px;">${incident.scenario}</p>
    ${incident.sampleSource ? `<p style="font-size:11px;color:#64748b;margin:4px 0 0;">Source: ${incident.sampleSource} | Location: ${incident.location || "N/A"} | Sample ID: ${incident.sampleId || "N/A"}</p>` : ""}
  </div>` : ""}

  ${org ? `
  <div class="final-id">
    <strong style="font-size:12px;color:#166534;">✓ Final Identification</strong>
    <p style="margin:6px 0 0;font-size:16px;font-style:italic;font-weight:bold;color:#003087;">${org.name}</p>
    <p style="font-size:11px;color:#64748b;margin:4px 0 0;">BSL-${org.bslLevel} | Confidence: ${finalId.confidence || "—"}</p>
  </div>` : ""}

  <h2>Morphological Characteristics</h2>
  <table>
    ${row("Gram Reaction", gram.reaction)}
    ${row("Cell Shape", gram.shape)}
    ${row("Arrangement", gram.arrangement)}
    ${row("Endospore", morphology.endospore)}
    ${row("Acid-Fast", morphology.acidFast)}
    ${row("Capsule", morphology.capsule)}
    ${row("Colony Pigment", morphology.colony?.pigment)}
    ${row("Colony Shape", morphology.colony?.shape)}
    ${row("Hemolysis", biochemical["hemolysis"]?.result)}
  </table>

  <h2>Biochemical / Physiological Characteristics</h2>
  <table>
    ${Object.entries(biochemical).map(([testId, entry]) => {
      const testDef = tests.find((t) => t.id === testId);
      const resultStr = typeof entry.result === "object"
        ? Object.entries(entry.result).map(([k, v]) => `${k}: ${v}`).join(", ")
        : entry.result;
      return row(testDef?.name || testId, resultStr);
    }).join("")}
  </table>

  ${testPhotos && Object.keys(testPhotos).length > 0 ? `
  <h2>Lab Photo Documentation</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
    ${Object.entries(testPhotos).map(([key, photo]) => `
    <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;page-break-inside:avoid;">
      <img src="${photo.dataUrl}" alt="${photo.caption || photo.testName}" style="width:100%;display:block;max-height:160px;object-fit:cover;" />
      <div style="padding:6px 8px;">
        <p style="font-size:11px;font-weight:bold;margin:0 0 2px;color:#1e293b;">${photo.testName}</p>
        ${photo.recordedResult ? `<p style="font-size:10px;color:#64748b;margin:0 0 2px;">Result: <strong>${photo.recordedResult}</strong></p>` : ""}
        ${photo.caption ? `<p style="font-size:10px;color:#64748b;margin:0;font-style:italic;">${photo.caption}</p>` : ""}
      </div>
    </div>`).join("")}
  </div>` : ""}

  <p style="font-size:10px;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:8px;">
    Generated by MicroID Field Guide · Bio 431 USAFA · ${new Date().toISOString()}
  </p>
</body>
</html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

function printMemo(data) {
  const { cadet, incident, org, finalId, testResults } = data;
  const win = window.open("", "_blank");

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Commander's Risk Assessment Memo</title>
  <style>
    body { font-family: "Times New Roman", serif; margin: 40px; color: #000; max-width: 700px; }
    h1 { font-size: 14px; text-align: center; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
    .subhead { text-align: center; font-size: 12px; margin-bottom: 20px; }
    .from-block { font-size: 12px; line-height: 1.8; margin-bottom: 16px; }
    .section { margin-bottom: 16px; }
    .section-label { font-weight: bold; font-size: 12px; text-decoration: underline; }
    .section-content { font-size: 12px; margin-top: 4px; line-height: 1.6; }
    .signature { margin-top: 40px; font-size: 12px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Department of the Air Force</h1>
  <div class="subhead">
    United States Air Force Academy<br>
    USAFA Department of Biology — Bio 431: Operational Microbiology
  </div>

  <div class="from-block">
    <strong>MEMORANDUM FOR RECORD</strong><br>
    <strong>FROM:</strong> ${cadet.name || "[Cadet Name]"}, Bio 431 Lab Section ${cadet.section || "___"}<br>
    <strong>DATE:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}<br>
    <strong>SUBJECT:</strong> Commander's Risk Assessment — Unknown Bacterial Identification, Culture ${cadet.cultureNumber || "___"}
  </div>

  <div class="section">
    <div class="section-label">1. INCIDENT CONTEXT</div>
    <div class="section-content">${incident.scenario || "[No incident scenario provided]"}<br>
    Sample Source: ${incident.sampleSource || "N/A"} | Location: ${incident.location || "N/A"} | Sample ID: ${incident.sampleId || "N/A"}</div>
  </div>

  <div class="section">
    <div class="section-label">2. ORGANISM IDENTIFIED</div>
    <div class="section-content">
      <em>${org ? org.name : "[Not yet confirmed]"}</em><br>
      BSL Level: ${org ? org.bslLevel : "N/A"}<br>
      Identification Confidence: ${finalId.confidence || "N/A"}<br>
      ${finalId.notes ? `Justification: ${finalId.notes}` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-label">3. IDENTIFICATION EVIDENCE SUMMARY</div>
    <div class="section-content">
      Key test results supporting this identification:<br>
      ${Object.entries(testResults).slice(0, 10).map(([testId, entry]) => {
        const testDef = tests.find((t) => t.id === testId);
        const result = typeof entry.result === "object"
          ? Object.entries(entry.result).map(([k, v]) => `${k}: ${v}`).join(", ")
          : entry.result;
        return `• ${testDef?.name || testId}: ${result}`;
      }).join("<br>")}
      ${Object.keys(testResults).length === 0 ? "• No biochemical tests recorded" : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-label">4. OPERATIONAL THREAT ASSESSMENT</div>
    <div class="section-content">
      ${org ? `<em>Known threat profile for ${org.name}:</em> ${org.operationalThreat}<br><br>` : ""}
      [Cadet assessment of operational risk in the context of this incident:]<br>
      <br>_______________________________________________<br>
      _______________________________________________<br>
      _______________________________________________
    </div>
  </div>

  <div class="section">
    <div class="section-label">5. RECOMMENDED COUNTERMEASURES</div>
    <div class="section-content">
      [Based on your knowledge of this organism's physiology, what controls would you recommend?]<br>
      <br>_______________________________________________<br>
      _______________________________________________<br>
      _______________________________________________
    </div>
  </div>

  <div class="section">
    <div class="section-label">6. SUPPORTING DOCUMENTATION</div>
    <div class="section-content">
      Identification data sheet attached. Total tests performed: ${Object.keys(testResults).length}.
    </div>
  </div>

  <div class="signature">
    <br><br>
    ________________________________<br>
    ${cadet.name || "[Cadet Name]"}<br>
    Bio 431, Lab Section ${cadet.section || "___"}<br>
    USAFA Department of Biology
  </div>
</body>
</html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

export default function ExportView() {
  const navigate = useNavigate();
  const cadetName = useSessionStore((s) => s.cadetName);
  const labSection = useSessionStore((s) => s.labSection);
  const cultureNumber = useSessionStore((s) => s.cultureNumber);
  const incident = useSessionStore((s) => s.incident);
  const gramStain = useSessionStore((s) => s.gramStain);
  const endosporeResult = useSessionStore((s) => s.endosporeResult);
  const acidFastResult = useSessionStore((s) => s.acidFastResult);
  const capsuleResult = useSessionStore((s) => s.capsuleResult);
  const colonyMorphology = useSessionStore((s) => s.colonyMorphology);
  const testResults = useSessionStore((s) => s.testResults);
  const proposedOrganismId = useSessionStore((s) => s.proposedOrganismId);
  const identificationConfirmed = useSessionStore((s) => s.identificationConfirmed);
  const identificationConfidence = useSessionStore((s) => s.identificationConfidence);
  const identificationNotes = useSessionStore((s) => s.identificationNotes);
  const testPhotos = useSessionStore((s) => s.testPhotos ?? {});
  const memo = useSessionStore((s) => s.memo);
  const setMemo = useSessionStore((s) => s.setMemo);

  const org = proposedOrganismId ? organisms.find((o) => o.id === proposedOrganismId) : null;

  // Empty state — no investigation started
  if (!cadetName && !incident?.scenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-usafa-blue/10 dark:bg-usafa-blue/20 flex items-center justify-center">
          <Download className="w-8 h-8 text-usafa-blue dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nothing to Export Yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Complete your bacterial identification to generate the data sheet and Commander's Risk Assessment memo.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 bg-usafa-blue hover:bg-usafa-blue-light text-white rounded-xl text-sm font-medium transition-colors"
        >
          Start New Investigation <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const exportData = {
    cadet: { name: cadetName, section: labSection, cultureNumber },
    incident,
    gram: gramStain,
    morphology: { endospore: endosporeResult, acidFast: acidFastResult, capsule: capsuleResult, colony: colonyMorphology },
    biochemical: testResults,
    finalId: { confidence: identificationConfidence, notes: identificationNotes, confirmed: identificationConfirmed },
    org,
    testResults,
    testPhotos,
  };

  const testsCount = Object.keys(testResults).length;
  const photosCount = Object.keys(testPhotos).length;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Download className="w-5 h-5 text-usafa-blue" />
        Export Investigation
      </h1>

      {/* Status summary */}
      <Card>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {gramStain.reaction
              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
              : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span className="text-sm text-slate-700 dark:text-slate-300">Gram stain: {gramStain.reaction || "not recorded"}</span>
          </div>
          <div className="flex items-center gap-2">
            {testsCount >= 3
              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
              : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span className="text-sm text-slate-700 dark:text-slate-300">{testsCount} biochemical tests recorded</span>
          </div>
          <div className="flex items-center gap-2">
            {org
              ? <CheckCircle2 className="w-4 h-4 text-green-500" />
              : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Identification: {org ? <em className="italic">{org.name}</em> : "not confirmed"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${photosCount > 0 ? "text-green-500" : "text-slate-300 dark:text-slate-600"}`} />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {photosCount} lab photo{photosCount !== 1 ? "s" : ""} attached
              {photosCount > 0 && <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">(included in export)</span>}
            </span>
          </div>
        </div>
      </Card>

      {/* Export buttons */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-usafa-blue" />
          Data Sheet Export
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Generates a printable data sheet with all recorded results.
        </p>
        <button
          onClick={() => printDataSheet(exportData)}
          className="w-full flex items-center justify-center gap-2 bg-usafa-blue hover:bg-usafa-blue-light text-white font-medium py-3 rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          Print / Save Data Sheet as PDF
        </button>
      </Card>

      {/* Risk assessment memo */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          Commander's Risk Assessment Memo
        </h2>

        {/* Cadet-written sections */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              4. Operational Threat Assessment
              <span className="ml-2 font-normal text-slate-400 text-xs">(required — cadet-authored)</span>
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
              What risk does this organism pose in the operational context described? Consider: transmission routes, infectivity, treatment options, impact on mission readiness.
            </p>
            <textarea
              value={memo.operationalThreatAssessment}
              onChange={(e) => setMemo({ operationalThreatAssessment: e.target.value })}
              placeholder="Based on the identification of [organism] in [location/platform], the operational threat is..."
              rows={4}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-usafa-blue outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              5. Recommended Countermeasures
              <span className="ml-2 font-normal text-slate-400 text-xs">(required — cadet-authored)</span>
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
              Based on your knowledge of this organism's physiology, what controls would you recommend?
            </p>
            <textarea
              value={memo.recommendedCountermeasures}
              onChange={(e) => setMemo({ recommendedCountermeasures: e.target.value })}
              placeholder="Recommended countermeasures include..."
              rows={4}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-usafa-blue outline-none resize-none"
            />
          </div>
        </div>

        {/* Organism threat info */}
        {org && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-medium text-slate-800 dark:text-slate-200">Auto-filled from database:</p>
            <p><strong>BSL Level:</strong> {org.bslLevel}</p>
            <p><strong>Clinical Significance:</strong> {org.clinicalSignificance}</p>
            <p><strong>Operational Context:</strong> {org.operationalThreat}</p>
          </div>
        )}

        <button
          onClick={() => printMemo({ ...exportData, memo })}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          Print / Save Risk Assessment Memo
        </button>
      </Card>
    </div>
  );
}
