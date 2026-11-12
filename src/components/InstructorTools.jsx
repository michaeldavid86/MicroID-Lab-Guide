import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, Upload, Download, Smartphone, CheckCircle2, XCircle, HelpCircle, MinusCircle } from "lucide-react";
import { useAppStore } from "../stores/useAppStore";
import { useSessionStore } from "../stores/useSessionStore";
import { organisms } from "../data/organisms";
import { gradeSnapshot, toCsv, normalizeCulture, STATUS_LABELS } from "../utils/grading";
import Card from "./shared/Card";

const sortedOrganisms = [...organisms].sort((a, b) => a.name.localeCompare(b.name));

const STATUS_STYLE = {
  correct: { Icon: CheckCircle2, cls: "text-green-600 dark:text-green-400" },
  incorrect: { Icon: XCircle, cls: "text-red-600 dark:text-red-400" },
  "no-id": { Icon: MinusCircle, cls: "text-slate-400 dark:text-slate-500" },
  "no-key": { Icon: HelpCircle, cls: "text-amber-600 dark:text-amber-400" },
};

// Keep only what grading needs from a backup — photos can be many megabytes.
function slimSnapshot(data) {
  const {
    sessionId, cadetName, labSection, cultureNumber, gramStain, testResults, proposedOrganismId,
    customOrganismName, identificationConfirmed, identificationConfidence, lastModifiedAt,
  } = data;
  return {
    sessionId, cadetName, labSection, cultureNumber, gramStain, testResults, proposedOrganismId,
    customOrganismName, identificationConfirmed, identificationConfidence, lastModifiedAt,
  };
}

// Same session id + cadet + culture = the same submission. A backup restored by
// a different cadet keeps the session id, so the id alone is not enough.
const submissionKey = (s) =>
  [s.sessionId, String(s.cadetName || "").trim().toLowerCase(), normalizeCulture(s.cultureNumber)].join("|");

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

export default function InstructorTools() {
  const navigate = useNavigate();
  const answerKey = useAppStore((s) => s.answerKey) || [];
  const setAnswerKey = useAppStore((s) => s.setAnswerKey);
  const getSnapshot = useSessionStore((s) => s.getSnapshot);

  const [culture, setCulture] = useState("");
  const [organismId, setOrganismId] = useState("");
  const [keyError, setKeyError] = useState(null);
  const [submissions, setSubmissions] = useState([]); // slim snapshots, this visit only
  const [loadMessage, setLoadMessage] = useState(null);
  const fileRef = useRef(null);

  const addKeyRow = () => {
    const c = culture.trim();
    if (!c || !organismId) {
      setKeyError("Enter a culture number and choose an organism.");
      return;
    }
    // One organism per culture number: replace an existing entry for it.
    const rest = answerKey.filter((k) => normalizeCulture(k.culture) !== normalizeCulture(c));
    setAnswerKey([...rest, { culture: c, organismId }]);
    setCulture("");
    setOrganismId("");
    setKeyError(null);
  };

  const removeKeyRow = (c) => setAnswerKey(answerKey.filter((k) => k.culture !== c));

  const addSubmissions = (snaps) =>
    setSubmissions((prev) => {
      // Re-loading a cadet's file replaces their earlier row (same session id).
      const byId = new Map(prev.map((s) => [submissionKey(s), s]));
      snaps.forEach((s) => byId.set(submissionKey(s), s));
      return [...byId.values()];
    });

  const handleFiles = async (e) => {
    const files = [...(e.target.files || [])];
    if (fileRef.current) fileRef.current.value = "";
    if (!files.length) return;
    const good = [];
    const bad = [];
    for (const file of files) {
      try {
        const data = JSON.parse(await readFile(file));
        if (!data || typeof data !== "object" || !data._microidBackup || !data.sessionId) throw new Error("not a backup");
        good.push(slimSnapshot(data));
      } catch {
        bad.push(file.name);
      }
    }
    if (good.length) addSubmissions(good);
    setLoadMessage({
      ok: bad.length === 0,
      text:
        `${good.length} file${good.length === 1 ? "" : "s"} loaded.` +
        (bad.length ? ` Skipped (not MicroID backup files): ${bad.join(", ")}` : ""),
    });
  };

  const addThisDevice = () => {
    addSubmissions([slimSnapshot(getSnapshot())]);
    setLoadMessage({ ok: true, text: "Added the investigation currently on this device." });
  };

  const rows = useMemo(
    () =>
      submissions
        .map((s) => ({ ...gradeSnapshot(s, answerKey), rowKey: submissionKey(s) }))
        .sort((a, b) => a.labSection.localeCompare(b.labSection) || a.cadetName.localeCompare(b.cadetName)),
    [submissions, answerKey]
  );
  const counts = useMemo(() => {
    const c = { correct: 0, incorrect: 0, "no-id": 0, "no-key": 0 };
    rows.forEach((r) => { c[r.status] += 1; });
    return c;
  }, [rows]);

  const downloadCsv = () => {
    // The BOM makes Excel read accented characters correctly.
    const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MicroID_Class_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const orgName = (id) => organisms.find((o) => o.id === id)?.name || "(unknown organism)";
  const inputCls =
    "rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-usafa-blue outline-none";

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-usafa-blue dark:text-blue-400 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Instructor Tools</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Check cadet identifications against your answer key and export a class summary.
        </p>
      </div>

      {/* Answer key */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Answer key</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Stored only on this device. It is not part of the app cadets download, class codes, or backup files.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={culture}
            onChange={(e) => { setCulture(e.target.value); setKeyError(null); }}
            placeholder="Culture #"
            aria-label="Culture number"
            className={`${inputCls} sm:w-28`}
          />
          <select
            value={organismId}
            onChange={(e) => { setOrganismId(e.target.value); setKeyError(null); }}
            aria-label="Organism"
            className={`${inputCls} flex-1 min-w-0`}
          >
            <option value="">Choose organism…</option>
            {sortedOrganisms.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addKeyRow}
            className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-usafa-blue text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {keyError && <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-2">{keyError}</p>}

        {answerKey.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">No entries yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
            {[...answerKey]
              .sort((a, b) => a.culture.localeCompare(b.culture, undefined, { numeric: true }))
              .map((k) => (
                <li key={k.culture} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-sm text-slate-800 dark:text-slate-200">
                    <span className="font-semibold">#{k.culture}</span> — <em>{orgName(k.organismId)}</em>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeKeyRow(k.culture)}
                    aria-label={`Remove key entry for culture ${k.culture}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </Card>

      {/* Load cadet work */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Cadet work</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Have each cadet send you their backup file (Dashboard → Save / Restore → Download Backup File),
          then load them all here. Files are read on this device only and are not kept after you leave this screen.
        </p>
        <input ref={fileRef} type="file" accept=".json,application/json" multiple className="hidden" onChange={handleFiles} />
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-usafa-blue hover:bg-usafa-blue-light text-white font-medium py-2.5 rounded-xl text-sm"
          >
            <Upload className="w-4 h-4" /> Load backup files
          </button>
          <button
            type="button"
            onClick={addThisDevice}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-xl text-sm"
          >
            <Smartphone className="w-4 h-4" /> Check this device
          </button>
        </div>
        {loadMessage && (
          <p className={`text-xs mt-2 ${loadMessage.ok ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-300"}`}>
            {loadMessage.text}
          </p>
        )}
      </Card>

      {/* Results */}
      {rows.length > 0 && (
        <Card>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Results ({rows.length})</h2>
            <button
              type="button"
              onClick={() => setSubmissions([])}
              className="text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              Clear list
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            {counts.correct} correct · {counts.incorrect} incorrect · {counts["no-id"]} no ID yet · {counts["no-key"]} without a key entry
          </p>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((r) => {
              const { Icon, cls } = STATUS_STYLE[r.status];
              return (
                <li key={r.rowKey} className="py-2.5 flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cls}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {r.cadetName || "(no name)"}
                      <span className="font-normal text-slate-500 dark:text-slate-400">
                        {r.labSection ? ` · ${r.labSection}` : ""} · Culture: {r.cultureNumber || "—"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Identified as: {r.identifiedAs ? <em>{r.identifiedAs}</em> : "—"}
                      {r.writeIn ? " (write-in)" : ""}
                      {r.identifiedAs && !r.confirmed ? " · not yet confirmed" : ""}
                      {r.confidence ? ` · ${r.confidence} confidence` : ""}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <span className={`font-semibold ${cls}`}>{STATUS_LABELS[r.status]}</span>
                      {r.keyOrganism ? <> · Key: <em>{r.keyOrganism}</em></> : ""}
                      {` · ${r.testsRecorded} tests`}
                      {r.gram ? ` · ${r.gram}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={downloadCsv}
            className="w-full flex items-center justify-center gap-2 mt-3 border-2 border-usafa-blue text-usafa-blue dark:text-blue-300 dark:border-blue-500 font-medium py-2.5 rounded-xl text-sm"
          >
            <Download className="w-4 h-4" /> Download class summary (CSV)
          </button>
        </Card>
      )}
    </div>
  );
}
