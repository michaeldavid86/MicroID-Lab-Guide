import { useState } from "react";
import { useNavigate } from "react-router";
import { Microscope, Moon, Sun, FlaskConical, RotateCcw, AlertTriangle, X } from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import { useSessionStore } from "../../stores/useSessionStore";

// ─── Inline confirmation modal ────────────────────────────────────────────────
function ResetConfirmModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm mx-4 bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">
                Clear All &amp; Start Over?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                This cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-3">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            All data for this investigation will be permanently cleared:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              Incident report &amp; cadet information
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              Gram stain &amp; morphology observations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              All recorded biochemical test results
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              Final identification &amp; risk assessment
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 px-5 pb-5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Clear Everything
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header() {
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);

  const candidateIds   = useSessionStore((s) => s.candidateIds);
  const currentPhase   = useSessionStore((s) => s.currentPhase);
  const isComplete     = useSessionStore((s) => s.isComplete);
  const incident       = useSessionStore((s) => s.incident);
  const cadetName      = useSessionStore((s) => s.cadetName);
  const resetSession   = useSessionStore((s) => s.resetSession);

  // Only show the reset button when an investigation is actually in progress
  const hasActiveSession = !!(cadetName || incident?.scenario);

  const phaseLabels = {
    1: "Phase 1 — Initial Observations",
    2: "Phase 2 — Flowchart Routing",
    3: "Phase 3 — Biochemical Testing",
    4: "Phase 4 — Final ID",
  };

  const handleConfirmReset = () => {
    resetSession();
    setShowResetConfirm(false);
    navigate("/dashboard");
  };

  return (
    <>
      <header className="bg-usafa-blue dark:bg-slate-900 text-white px-4 pb-3 safe-pt flex items-center justify-between shadow-lg border-b border-blue-900 dark:border-slate-700">
        {/* Left — branding */}
        <div className="flex items-center gap-2">
          <Microscope className="w-6 h-6 text-blue-200 flex-shrink-0" />
          <div>
            <h1 className="font-bold text-sm leading-tight">MicroID Lab Guide</h1>
            <p className="text-blue-200 text-xs">Bio 431 · USAFA</p>
          </div>
        </div>

        {/* Right — status badge + controls */}
        <div className="flex items-center gap-2">
          {/* Phase / status badge (hidden on small screens) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-blue-900/50 rounded-full px-3 py-1 text-xs">
            <FlaskConical className="w-3 h-3 text-blue-300" />
            <span className="text-blue-100">
              {isComplete ? "✓ ID Complete" : phaseLabels[currentPhase]}
            </span>
            {!isComplete && currentPhase >= 3 && (
              <span className="ml-1 bg-blue-700 rounded-full px-1.5 py-0.5 text-blue-100">
                {candidateIds.length} candidates
              </span>
            )}
          </div>

          {/* Start Over button — only shown when an investigation exists */}
          {hasActiveSession && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-900/40 hover:bg-red-700/70 text-blue-200 hover:text-white text-xs font-medium transition-colors border border-blue-800/60 hover:border-red-600"
              aria-label="Clear all and start a new investigation"
              title="Start Over"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-blue-200" />
            )}
          </button>
        </div>
      </header>

      {/* Reset confirmation modal — rendered outside header flow */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}
