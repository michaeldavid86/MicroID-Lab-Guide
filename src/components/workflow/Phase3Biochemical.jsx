import { useState, useRef } from "react";
import { useSessionStore } from "../../stores/useSessionStore";
import { organisms as allOrganisms } from "../../data/organisms";
import { tests, flowchartTestOrder } from "../../data/tests";
import { compressImage } from "../../utils/photoUtils";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import InterpretationModal from "./InterpretationModal";
import {
  FlaskConical, ChevronRight, ChevronDown, CheckCircle2,
  XCircle, Info, Lightbulb, BookOpen, Camera, Trash2, Loader2
} from "lucide-react";

// Discrimination badge
function DiscBadge({ label }) {
  if (!label) return null;
  const cfg = {
    high: { variant: "high", icon: "⬆", text: "High discrimination" },
    medium: { variant: "medium", icon: "→", text: "Medium discrimination" },
    low: { variant: "low", icon: "↓", text: "Low discrimination" },
  };
  const c = cfg[label] || cfg.low;
  return <Badge variant={c.variant}>{c.icon} {c.text}</Badge>;
}

// Result button row
function ResultSelector({ options, value, onChange }) {
  // Options can be string[] or [{value, label}]
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <div className="flex flex-wrap gap-2">
      {normalized.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value === value ? null : opt.value)}
          className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
            value === opt.value
              ? opt.value === "positive" || opt.value === "acid" || opt.value === "acid and gas" || opt.value === "sensitive"
                ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-500 dark:text-green-200"
                : opt.value === "negative" || opt.value === "resistant"
                ? "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-500 dark:text-red-200"
                : "bg-usafa-blue border-usafa-blue text-white"
              : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-usafa-blue"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// KIA compound result entry
function KIAEntry({ value, onChange }) {
  const current = value && typeof value === "object" ? value : {};
  const update = (field, val) => onChange({ ...current, [field]: val });

  return (
    <div className="space-y-3 border-l-2 border-usafa-blue pl-3">
      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Slant color</p>
        <ResultSelector
          options={["acid", "alkaline"]}
          value={current.slant}
          onChange={(v) => update("slant", v)}
        />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Butt color</p>
        <ResultSelector
          options={["acid", "alkaline"]}
          value={current.butt}
          onChange={(v) => update("butt", v)}
        />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Gas production</p>
        <ResultSelector
          options={["positive", "negative"]}
          value={current.gas}
          onChange={(v) => update("gas", v)}
        />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">H₂S production</p>
        <ResultSelector
          options={["positive", "negative"]}
          value={current.h2s}
          onChange={(v) => update("h2s", v)}
        />
      </div>
    </div>
  );
}

// ─── Photo upload sub-component ───────────────────────────────────────────────
function TestPhotoUpload({ testId, testName, recordedResult }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const photo = useSessionStore((s) => s.testPhotos?.[testId]);
  const uploadTestPhoto = useSessionStore((s) => s.uploadTestPhoto);
  const removeTestPhoto = useSessionStore((s) => s.removeTestPhoto);
  const updatePhotoCaption = useSessionStore((s) => s.updatePhotoCaption);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(photo?.caption ?? "");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const defaultCaption = `${testName}${recordedResult ? ` — ${recordedResult}` : ""}`;
      uploadTestPhoto(testId, dataUrl, defaultCaption, testName, recordedResult);
      setCaptionDraft(defaultCaption);
    } catch (err) {
      useSessionStore.setState({ photoError: err?.message || "That photo could not be processed. Try a JPG/PNG or take a new photo." });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!photo) {
    return (
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-usafa-blue hover:text-usafa-blue dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {uploading ? "Uploading…" : "Add bench photo"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700">
        <img src={photo.dataUrl} alt={photo.caption} className="w-full object-cover max-h-52" />
        <button
          type="button"
          onClick={() => removeTestPhoto(testId)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-red-600 text-white transition-colors"
          title="Remove photo"
          aria-label="Remove photo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Caption */}
      {editingCaption ? (
        <div className="flex gap-1.5">
          <input
            type="text"
            value={captionDraft}
            onChange={(e) => setCaptionDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { updatePhotoCaption(testId, captionDraft); setEditingCaption(false); } if (e.key === "Escape") setEditingCaption(false); }}
            className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 focus:ring-2 focus:ring-usafa-blue outline-none"
            autoFocus
          />
          <button type="button" onClick={() => { updatePhotoCaption(testId, captionDraft); setEditingCaption(false); }} className="text-xs px-2 py-1 bg-usafa-blue text-white rounded-lg">Save</button>
        </div>
      ) : (
        <button type="button" onClick={() => { setCaptionDraft(photo.caption); setEditingCaption(true); }} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 italic text-left w-full truncate transition-colors">
          📷 {photo.caption || "Tap to add caption"}
        </button>
      )}
    </div>
  );
}

// Single test card
function TestCard({ test, recorded, ranking, onRecord, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [interpOpen, setInterpOpen] = useState(false);
  // Manual override state (shown after guided interpretation, or for tests without interp)
  const [manualResult, setManualResult] = useState(recorded?.result ?? null);
  const [notes, setNotes] = useState(recorded?.notes ?? "");
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const hasInterpretation = !!test.interpretationQuestion;
  const isCompound = test.id === "kia";
  const hasResult = recorded !== undefined;

  // Called by InterpretationModal when cadet finishes the guided flow
  const handleInterpRecord = (derivedResult) => {
    onRecord(test.id, derivedResult, "");
    setInterpOpen(false);
    setShowManualOverride(false);
  };

  // Called by manual override save button
  const handleManualSave = () => {
    if (manualResult === null) return;
    onRecord(test.id, manualResult, notes);
    setShowManualOverride(false);
  };

  return (
    <div className={`rounded-xl border-2 transition-colors ${hasResult
      ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/30"
      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"}`}>

      {/* Header row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-shrink-0">
          {hasResult
            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
            : <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{test.name}</span>
            {ranking && <DiscBadge label={ranking.label} />}
            {hasInterpretation && !hasResult && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                <BookOpen className="w-3 h-3" /> Guided
              </span>
            )}
          </div>
          {hasResult && (
            <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
              Result:{" "}
              <span className="font-medium capitalize">
                {typeof recorded.result === "object"
                  ? Object.entries(recorded.result).map(([k, v]) => `${k}: ${v}`).join(", ")
                  : recorded.result}
              </span>
              {recorded.recordedAt && (
                <span className="ml-2 text-slate-400">
                  {new Date(recorded.recordedAt).toLocaleDateString()}
                </span>
              )}
            </p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
          {/* Quick ref */}
          <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-2 py-1.5">
            🔬 {test.quickRef}
          </p>

          {/* ── TESTS WITH GUIDED INTERPRETATION ─────────────────────── */}
          {hasInterpretation && !hasResult && !showManualOverride && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This test requires guided interpretation — walk through your observations step by step.
              </p>
              <button
                type="button"
                onClick={() => setInterpOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-usafa-blue hover:bg-usafa-blue-light text-white rounded-lg text-sm font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Interpret & Record
              </button>
              <button
                type="button"
                onClick={() => setShowManualOverride(true)}
                className="w-full py-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
              >
                Skip guided mode → enter result manually
              </button>
            </div>
          )}

          {/* ── RECORDED RESULT + ACTIONS ─────────────────────────────── */}
          {hasResult && !showManualOverride && (
            <div className="space-y-2">
              {/* Photo upload */}
              <TestPhotoUpload
                testId={test.id}
                testName={test.name}
                recordedResult={typeof recorded?.result === "object"
                  ? Object.entries(recorded.result).map(([k, v]) => `${k}: ${v}`).join(", ")
                  : recorded?.result}
              />

              {/* First principle */}
              {test.firstPrinciple && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">{test.firstPrinciple}</p>
                </div>
              )}
              <div className="flex gap-2">
                {hasInterpretation && (
                  <button
                    type="button"
                    onClick={() => setInterpOpen(true)}
                    className="flex-1 py-2 text-xs font-medium border-2 border-usafa-blue text-usafa-blue dark:text-blue-400 dark:border-blue-600 rounded-lg hover:bg-usafa-blue/5 transition-colors"
                  >
                    Re-interpret
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setManualResult(recorded?.result ?? null);
                    setNotes(recorded?.notes ?? "");
                    setShowManualOverride(true);
                  }}
                  className="flex-1 py-2 text-xs font-medium border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg hover:border-slate-400 transition-colors"
                >
                  Manual Override
                </button>
              </div>
              {/* Remove test result */}
              {!confirmRemove ? (
                <button
                  type="button"
                  onClick={() => setConfirmRemove(true)}
                  className="w-full py-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Remove this test
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="flex-1 text-xs text-red-700 dark:text-red-300">Remove this result? Candidates will be recalculated.</p>
                  <button type="button" onClick={() => setConfirmRemove(false)} className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400">Cancel</button>
                  <button type="button" onClick={() => { onRemove(test.id); setConfirmRemove(false); setManualResult(null); setNotes(""); setExpanded(false); }} className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg">Remove</button>
                </div>
              )}
            </div>
          )}

          {/* ── MANUAL RESULT ENTRY (no interp & not yet recorded, or override) ── */}
          {((!hasInterpretation && !hasResult) || showManualOverride) && (
            <div className="space-y-3">
              {showManualOverride && (
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1.5">
                  ⚠ Manual override — use only if re-running the test or correcting a recording error.
                </p>
              )}

              {/* Result entry */}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Record Result</p>
                {isCompound
                  ? <KIAEntry value={manualResult} onChange={setManualResult} />
                  : <ResultSelector
                      options={Array.isArray(test.possibleResults) ? test.possibleResults : ["positive", "negative"]}
                      value={manualResult}
                      onChange={setManualResult}
                    />
                }
              </div>

              {/* Notes */}
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional observation notes..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs focus:ring-2 focus:ring-usafa-blue outline-none"
              />

              {/* First principle (only if not in guided flow) */}
              {hasResult && test.firstPrinciple && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">{test.firstPrinciple}</p>
                </div>
              )}

              <div className="flex gap-2">
                {showManualOverride && (
                  <button
                    type="button"
                    onClick={() => setShowManualOverride(false)}
                    className="px-3 py-2 text-xs border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg hover:border-slate-400 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleManualSave}
                  disabled={manualResult === null}
                  className="flex-1 py-2 bg-usafa-blue hover:bg-usafa-blue-light disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 rounded-lg text-sm font-medium transition-colors"
                >
                  {hasResult ? "Update Result" : "Record Result"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interpretation modal (rendered inside card but portal-like via fixed positioning) */}
      <InterpretationModal
        test={test}
        isOpen={interpOpen}
        onClose={() => setInterpOpen(false)}
        onRecord={handleInterpRecord}
      />
    </div>
  );
}

// Ruled out panel
function RuledOutPanel({ eliminatedEntries }) {
  const [expanded, setExpanded] = useState(false);
  if (eliminatedEntries.length === 0) return null;
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-950/30 text-left"
      >
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-red-800 dark:text-red-200">
            Ruled Out ({eliminatedEntries.length})
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-red-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="divide-y divide-red-100 dark:divide-red-900">
          {eliminatedEntries.map((e) => (
            <div key={`${e.organismId}-${e.eliminatedBy}`} className="px-4 py-2.5 bg-white dark:bg-slate-800">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">{e.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Eliminated by <span className="font-medium">{e.eliminatedBy}</span>
                {" "}(expected: {String(e.expected)}, observed: {String(e.observed)})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Phase3Biochemical({ onNext }) {
  const testResults = useSessionStore((s) => s.testResults);
  const candidateIds = useSessionStore((s) => s.candidateIds);
  const eliminatedEntries = useSessionStore((s) => s.eliminatedEntries);
  const testRankings = useSessionStore((s) => s.testRankings);
  const flowchartSectionId = useSessionStore((s) => s.flowchartSectionId);
  const recordTestResult = useSessionStore((s) => s.recordTestResult);
  const removeTestResult = useSessionStore((s) => s.removeTestResult);
  const setCurrentPhase = useSessionStore((s) => s.setCurrentPhase);

  const applicable = flowchartSectionId ? (flowchartTestOrder[flowchartSectionId] || []) : [];
  const applicableTests = applicable.map((id) => tests.find((t) => t.id === id)).filter(Boolean);

  const rankingMap = Object.fromEntries(testRankings.map((r) => [r.testId, r]));
  const candidateOrgs = allOrganisms.filter((o) => candidateIds.includes(o.id));

  const completedTests = Object.keys(testResults).length;

  const canProceedToFinalID = candidateIds.length <= 3 && completedTests >= 3;

  return (
    <div className="space-y-4">
      {/* Status header */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-usafa-blue" />
              Biochemical Testing
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {completedTests} tests completed · {candidateIds.length} candidates remaining
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={candidateIds.length <= 1 ? "positive" : candidateIds.length <= 3 ? "variable" : "info"}>
              {candidateIds.length === 1 ? "1 candidate — ready for final ID!" : `${candidateIds.length} candidates`}
            </Badge>
          </div>
        </div>

        {/* Remaining candidates */}
        {candidateOrgs.length > 0 && candidateOrgs.length <= 8 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Remaining Candidates</p>
            <div className="flex flex-wrap gap-1.5">
              {candidateOrgs.map((org) => (
                <span
                  key={org.id}
                  className={`text-xs rounded-full px-2 py-0.5 font-medium border ${
                    org.isAssignableUnknown
                      ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-200"
                      : "bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                  }`}
                >
                  {org.isAssignableUnknown && "⭐ "}{org.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">⭐ = potential assigned unknown</p>
          </div>
        )}
      </Card>

      {/* Ruled out */}
      <RuledOutPanel eliminatedEntries={eliminatedEntries} />

      {/* Tests */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 px-1">
          Available Tests — select and enter results
        </p>
        <div className="space-y-2">
          {applicableTests.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No tests configured for this flowchart section.</p>
          )}
          {applicableTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              recorded={testResults[test.id]}
              ranking={rankingMap[test.id]}
              onRecord={(id, result, notes) => recordTestResult(id, result, notes)}
              onRemove={(id) => removeTestResult(id)}
            />
          ))}
        </div>
      </div>

      {/* Proceed to final ID */}
      {completedTests >= 2 && (
        <div className="pb-4">
          {candidateIds.length > 3 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl mb-3 text-sm text-amber-800 dark:text-amber-200">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {candidateIds.length} candidates remain. Consider running additional high-discrimination tests before proceeding to final ID.
              </span>
            </div>
          )}
          <button
            onClick={() => {
              useSessionStore.setState((s) => ({
                phaseCompleted: { ...s.phaseCompleted, 3: true },
                currentPhase: 4,
                lastModifiedAt: new Date().toISOString(),
              }));
            }}
            className={`w-full flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-colors ${
              candidateIds.length <= 3
                ? "bg-usafa-blue hover:bg-usafa-blue-light text-white"
                : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
            }`}
          >
            Proceed to Final Identification
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
