import { useState } from "react";
import { useNavigate } from "react-router";
import { useSessionStore } from "../../stores/useSessionStore";
import { organisms as allOrganisms } from "../../data/organisms";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import {
  CheckCircle2, AlertTriangle, Info, XCircle, Shield,
  ChevronRight, RotateCcw
} from "lucide-react";

function ConflictCard({ conflict }) {
  const severityConfig = {
    critical: { icon: XCircle, cls: "text-red-500", bg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800" },
    warning: { icon: AlertTriangle, cls: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800" },
    info: { icon: Info, cls: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800" },
  };
  const cfg = severityConfig[conflict.severity] || severityConfig.info;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${cfg.bg}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.cls}`} />
      <div className="text-xs">
        <span className="font-medium text-slate-800 dark:text-slate-200">{conflict.testName}</span>
        <span className="text-slate-500 dark:text-slate-400 ml-1">
          expected <span className="font-medium capitalize">{String(conflict.expected)}</span>
          {" "}— you recorded <span className="font-medium capitalize">{String(conflict.observed)}</span>
        </span>
      </div>
    </div>
  );
}

export default function Phase4FinalID() {
  const navigate = useNavigate();
  const candidateIds = useSessionStore((s) => s.candidateIds);
  const eliminatedEntries = useSessionStore((s) => s.eliminatedEntries);
  const testResults = useSessionStore((s) => s.testResults);
  const proposedOrganismId = useSessionStore((s) => s.proposedOrganismId);
  const customOrganismName = useSessionStore((s) => s.customOrganismName);
  const sanityCheckResults = useSessionStore((s) => s.sanityCheckResults);
  const identificationConfirmed = useSessionStore((s) => s.identificationConfirmed);
  const setProposedOrganism = useSessionStore((s) => s.setProposedOrganism);
  const setCustomOrganism = useSessionStore((s) => s.setCustomOrganism);
  const runSanityCheck = useSessionStore((s) => s.runSanityCheck);
  const confirmIdentification = useSessionStore((s) => s.confirmIdentification);

  const [confidence, setConfidence] = useState("high");
  const [notes, setNotes] = useState("");
  const [checkedSanity, setCheckedSanity] = useState(false);
  const [showWriteIn, setShowWriteIn] = useState(!!customOrganismName);
  const [writeInDraft, setWriteInDraft] = useState(customOrganismName || "");

  const allCandidateOrgs = allOrganisms.filter((o) => candidateIds.includes(o.id));
  // Also show eliminated candidates so cadets can reconsider
  const eliminatedOrgs = allOrganisms.filter((o) =>
    eliminatedEntries.some((e) => e.organismId === o.id)
  );

  const proposedOrg = proposedOrganismId
    ? allOrganisms.find((o) => o.id === proposedOrganismId)
    : null;

  // Display name for the proposed ID (from database or custom write-in)
  const proposedName = proposedOrg?.name || customOrganismName;
  const hasProposal = !!(proposedOrg || customOrganismName);

  const handleRunSanityCheck = () => {
    runSanityCheck();
    setCheckedSanity(true);
  };

  const handleConfirm = () => {
    confirmIdentification(confidence, notes);
    navigate("/export");
  };

  if (identificationConfirmed && hasProposal) {
    return (
      <Card className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Investigation Complete
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-1">Unknown identified as:</p>
        <p className="text-lg font-semibold italic text-usafa-blue dark:text-blue-400 mb-4">{proposedName}</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {proposedOrg && <Badge variant={`bsl${proposedOrg.bslLevel}`}>BSL-{proposedOrg.bslLevel}</Badge>}
          {customOrganismName && <Badge variant="info">Write-in ID</Badge>}
          <Badge variant={confidence === "high" ? "positive" : confidence === "medium" ? "variable" : "critical"}>
            {confidence} confidence
          </Badge>
        </div>
        <button
          onClick={() => navigate("/export")}
          className="mt-6 flex items-center gap-2 bg-usafa-blue text-white px-6 py-2.5 rounded-xl font-medium mx-auto hover:bg-usafa-blue-light"
        >
          Generate Data Sheet & Memo
          <ChevronRight className="w-4 h-4" />
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Select proposed organism */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Select Your Proposed Identification</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Based on your test results, select the organism you believe is your unknown. You should run a Sanity Check before confirming.
        </p>

        {/* Remaining candidates */}
        {allCandidateOrgs.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Remaining Candidates ({allCandidateOrgs.length})
            </p>
            <div className="space-y-2">
              {allCandidateOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => { setProposedOrganism(org.id); setCheckedSanity(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                    proposedOrganismId === org.id
                      ? "border-usafa-blue bg-blue-50 dark:bg-blue-950/40"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-usafa-blue/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm italic text-slate-900 dark:text-slate-100">{org.name}</span>
                    {org.isAssignableUnknown && <Badge variant="assignable">⭐ In pool</Badge>}
                    <Badge variant={`bsl${org.bslLevel}`}>BSL-{org.bslLevel}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{org.clinicalSignificance.substring(0, 80)}…</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Write-in option */}
        <div className="mb-4">
          {!showWriteIn ? (
            <button
              type="button"
              onClick={() => setShowWriteIn(true)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-usafa-blue dark:hover:text-blue-400 transition-colors"
            >
              Organism not listed? Write in your identification →
            </button>
          ) : (
            <div className="space-y-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Write-in Identification</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={writeInDraft}
                  onChange={(e) => setWriteInDraft(e.target.value)}
                  placeholder="e.g., Bacillus cereus"
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm italic focus:ring-2 focus:ring-usafa-blue outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (writeInDraft.trim()) {
                      setCustomOrganism(writeInDraft.trim());
                      setCheckedSanity(false);
                    }
                  }}
                  disabled={!writeInDraft.trim()}
                  className="px-4 py-2 bg-usafa-blue text-white text-sm font-medium rounded-lg disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors"
                >
                  Select
                </button>
              </div>
              {customOrganismName && (
                <p className="text-xs text-green-600 dark:text-green-400">Selected: <em>{customOrganismName}</em></p>
              )}
              <button
                type="button"
                onClick={() => { setShowWriteIn(false); setWriteInDraft(""); if (customOrganismName) setCustomOrganism(null); }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Cancel write-in
              </button>
            </div>
          )}
        </div>

        {/* Eliminated candidates (for reconsideration) */}
        {eliminatedOrgs.length > 0 && (
          <details className="mt-2">
            <summary className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
              Ruled-out candidates (click to reconsider)
            </summary>
            <div className="mt-2 space-y-1.5">
              {eliminatedOrgs.map((org) => {
                const reason = eliminatedEntries.find((e) => e.organismId === org.id);
                return (
                  <button
                    key={org.id}
                    onClick={() => { setProposedOrganism(org.id); setCheckedSanity(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-all opacity-60 hover:opacity-100 ${
                      proposedOrganismId === org.id
                        ? "border-red-400 bg-red-50 dark:bg-red-950/40"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="font-medium text-sm italic text-slate-700 dark:text-slate-300">{org.name}</span>
                    {reason && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Eliminated: {reason.eliminatedBy} (expected {reason.expected}, got {reason.observed})
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </details>
        )}
      </Card>

      {/* Sanity Check — only for organisms in the database */}
      {proposedOrg && !customOrganismName && (
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-usafa-blue" />
            Sanity Check
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Cross-validates all your results against <em>{proposedOrg.name}</em>. Run this before confirming.
          </p>

          <button
            onClick={handleRunSanityCheck}
            className="w-full py-2.5 border-2 border-usafa-blue text-usafa-blue dark:text-blue-400 dark:border-blue-500 rounded-xl font-medium text-sm hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors mb-3"
          >
            Run Sanity Check
          </button>

          {sanityCheckResults && checkedSanity && (
            <div className="space-y-3">
              {/* Score */}
              <div className={`p-3 rounded-xl border ${sanityCheckResults.passed
                ? "bg-green-50 dark:bg-green-950/50 border-green-300 dark:border-green-700"
                : "bg-yellow-50 dark:bg-yellow-950/50 border-yellow-300 dark:border-yellow-700"}`}>
                <div className="flex items-center gap-2">
                  {sanityCheckResults.passed
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  <div>
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-200">
                      Consistency Score: {sanityCheckResults.score}%
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{sanityCheckResults.summary}</p>
                  </div>
                </div>
              </div>

              {/* Conflicts */}
              {sanityCheckResults.conflicts.length > 0 && (
                <div className="space-y-1.5">
                  {sanityCheckResults.conflicts.map((c, i) => (
                    <ConflictCard key={i} conflict={c} />
                  ))}
                  {sanityCheckResults.warningCount > 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                      Note: ~10% of strains may deviate from typical results. Consider re-running suspect tests before concluding.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Confirm identification — for DB organisms after sanity check, or immediately for write-ins */}
      {((proposedOrg && checkedSanity && sanityCheckResults) || customOrganismName) && (
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Confirm Identification</h2>
          {customOrganismName && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl mb-3 text-sm text-amber-800 dark:text-amber-200">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Write-in identification: <em>{customOrganismName}</em>. Sanity check is not available for write-in organisms.</span>
            </div>
          )}

          <div className="mb-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Identification Confidence</p>
            <div className="flex gap-2">
              {["high", "medium", "low"].map((c) => (
                <button
                  key={c}
                  onClick={() => setConfidence(c)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                    confidence === c
                      ? c === "high" ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : c === "medium" ? "bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Justification Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain your reasoning. Which key tests confirmed your identification? Any discrepancies to note?"
              rows={3}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-usafa-blue outline-none resize-none"
            />
          </div>

          {sanityCheckResults?.criticalCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl mb-3 text-sm text-red-800 dark:text-red-200">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Critical conflicts exist (Gram stain mismatch). Strongly reconsider your identification before confirming.</span>
            </div>
          )}

          <button
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 bg-usafa-blue hover:bg-usafa-blue-light text-white font-medium py-3 rounded-xl transition-colors"
          >
            Confirm: {proposedName}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </Card>
      )}
    </div>
  );
}
