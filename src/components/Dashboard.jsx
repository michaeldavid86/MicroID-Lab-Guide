import { useNavigate } from "react-router";
import { useRef, useState } from "react";
import {
  FlaskConical, FileText, ClipboardList, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, Shield,
  Save, Upload, CloudOff, WifiOff
} from "lucide-react";
import { useSessionStore } from "../stores/useSessionStore";
import { useAppStore } from "../stores/useAppStore";
import { organisms } from "../data/organisms";
import Card from "./shared/Card";
import Badge from "./shared/Badge";
import IncidentForm from "./incident/IncidentForm";

function relativeTime(isoString) {
  if (!isoString) return null;
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoString).toLocaleDateString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const incident = useSessionStore((s) => s.incident);
  const currentPhase = useSessionStore((s) => s.currentPhase);
  const candidateIds = useSessionStore((s) => s.candidateIds);
  const testResults = useSessionStore((s) => s.testResults);
  const gramStain = useSessionStore((s) => s.gramStain);
  const isComplete = useSessionStore((s) => s.isComplete);
  const proposedOrganismId = useSessionStore((s) => s.proposedOrganismId);
  const identificationConfirmed = useSessionStore((s) => s.identificationConfirmed);
  const resetSession = useSessionStore((s) => s.resetSession);
  const cadetName = useSessionStore((s) => s.cadetName);
  const cultureNumber = useSessionStore((s) => s.cultureNumber);

  const lastModifiedAt = useSessionStore((s) => s.lastModifiedAt);
  const saveBackupFile = useSessionStore((s) => s.saveBackupFile);
  const loadSession = useSessionStore((s) => s.loadSession);

  const restoreRef = useRef(null);
  const [restoreError, setRestoreError] = useState(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [tick, setTick] = useState(0);

  // Refresh the relative timestamp every 30s
  useState(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  });

  const handleRestoreFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data._microidBackup || !data.sessionId) throw new Error("Not a MicroID backup file.");
        loadSession(data);
        setRestoreSuccess(true);
        navigate("/workflow");
      } catch (err) {
        setRestoreError(err.message || "Could not read backup file. Make sure it's a MicroID .json backup.");
      } finally {
        if (restoreRef.current) restoreRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const hasIncident = incident.scenario.trim().length > 0;
  const testsCompleted = Object.keys(testResults).length;
  const proposedOrg = proposedOrganismId ? organisms.find((o) => o.id === proposedOrganismId) : null;

  const phaseLabels = {
    1: "Initial Observations",
    2: "Flowchart Routing",
    3: "Biochemical Testing",
    4: "Final ID",
  };

  const handleReset = () => {
    if (confirm("Reset this investigation? All data will be cleared.")) {
      resetSession();
    }
  };

  if (!hasIncident) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Begin New Investigation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter the incident report to start your unknown bacterial identification.
          </p>
        </div>
        <IncidentForm onComplete={() => navigate("/workflow")} />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {/* Investigation header */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Shield className="w-4 h-4 text-usafa-blue flex-shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Active Investigation</span>
              {isComplete && <Badge variant="positive">Complete</Badge>}
            </div>
            {cadetName && <p className="text-xs text-slate-500 dark:text-slate-400">{cadetName} {cultureNumber ? `· Culture ${cultureNumber}` : ""}</p>}
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 line-clamp-3">{incident.scenario}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {incident.sampleSource && <Badge variant="info">{incident.sampleSource}</Badge>}
              {incident.location && <Badge variant="default">{incident.location}</Badge>}
              {incident.sampleId && <Badge variant="default">#{incident.sampleId}</Badge>}
            </div>
            {/* Auto-save indicator */}
            <div className="flex items-center gap-1.5 mt-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Auto-saved to this device · {relativeTime(lastModifiedAt)}
              </span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors flex-shrink-0"
            title="Reset investigation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-usafa-blue" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Phase</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Phase {currentPhase}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{phaseLabels[currentPhase]}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-4 h-4 text-usafa-blue" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Candidates</span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{candidateIds.length} remaining</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{testsCompleted} tests recorded</p>
        </Card>

        {gramStain.reaction && (
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Gram Stain</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm capitalize">
              {gramStain.reaction === "positive" ? "Gram+ " : "Gram− "}
              {gramStain.shape}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{gramStain.arrangement}</p>
          </Card>
        )}

        {proposedOrg && (
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Proposed ID</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm italic">{proposedOrg.name}</p>
            <Badge variant={`bsl${proposedOrg.bslLevel}`} className="mt-1">BSL-{proposedOrg.bslLevel}</Badge>
          </Card>
        )}
      </div>

      {/* Quick actions */}
      <Card>
        <h2 className="font-medium text-slate-900 dark:text-slate-100 mb-3 text-sm">Quick Navigation</h2>
        <div className="space-y-2">
          {[
            { to: "/workflow", icon: FlaskConical, label: "Resume Identification Workflow", desc: `Currently: Phase ${currentPhase} — ${phaseLabels[currentPhase]}` },
            { to: "/datasheet", icon: ClipboardList, label: "View Data Sheet", desc: `${testsCompleted} results recorded` },
            { to: "/reference", icon: FileText, label: "Reference Library", desc: "Tests, media, and protocols" },
          ].map(({ to, icon: Icon, label, desc }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors text-left"
            >
              <Icon className="w-5 h-5 text-usafa-blue flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Save / Restore backup */}
      <details>
        <summary className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 px-1 flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5 inline" /> Backup &amp; Restore
        </summary>
        <div className="mt-3">
          <Card>
            {/* What's auto-saved */}
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl mb-4">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-green-800 dark:text-green-200">
                <p className="font-semibold mb-0.5">Your progress is automatically saved to this device.</p>
                <p className="text-green-700 dark:text-green-300">
                  Every result, photo, and note is stored locally. Closing and reopening the app won't lose anything — as long as you're on the same phone/browser.
                </p>
              </div>
            </div>

            {/* Safari warning */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl mb-4">
              <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-0.5">Between lab sessions?</p>
                <p>
                  Safari on iOS may clear local data after 7 days of inactivity. If your lab spans multiple days or weeks, <strong>download a backup file</strong> before you leave and restore it when you return.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Save */}
              <button
                type="button"
                onClick={() => saveBackupFile()}
                className="w-full flex items-center justify-center gap-2 bg-usafa-blue hover:bg-usafa-blue-light text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Download Backup File (.json)
              </button>

              {/* Restore */}
              <input
                ref={restoreRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleRestoreFile}
              />
              <button
                type="button"
                onClick={() => { setRestoreError(null); restoreRef.current?.click(); }}
                className="w-full flex items-center justify-center gap-2 border-2 border-slate-300 dark:border-slate-600 hover:border-usafa-blue dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                Restore from Backup File
              </button>

              {restoreError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 px-1">{restoreError}</p>
              )}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Backup files include all results, photos, and notes. Restoring will replace your current session.
            </p>
          </Card>
        </div>
      </details>

      {/* Edit incident */}
      <details>
        <summary className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 px-1">
          Edit incident report
        </summary>
        <div className="mt-3">
          <IncidentForm />
        </div>
      </details>
    </div>
  );
}
