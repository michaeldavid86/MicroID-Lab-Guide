import { useState } from "react";
import { useNavigate } from "react-router";
import { useSessionStore } from "../../stores/useSessionStore";
import Phase1Initial from "./Phase1Initial";
import Phase2Flowchart from "./Phase2Flowchart";
import Phase3Biochemical from "./Phase3Biochemical";
import Phase4FinalID from "./Phase4FinalID";
import { CheckCircle2, FlaskConical, ArrowRight } from "lucide-react";

const phases = [
  { id: 1, label: "Observations" },
  { id: 2, label: "Routing" },
  { id: 3, label: "Testing" },
  { id: 4, label: "Final ID" },
];

export default function WorkflowContainer() {
  const navigate = useNavigate();
  const currentPhase = useSessionStore((s) => s.currentPhase);
  const phaseCompleted = useSessionStore((s) => s.phaseCompleted);
  const setCurrentPhase = useSessionStore((s) => s.setCurrentPhase);
  const incident = useSessionStore((s) => s.incident);
  const cadetName = useSessionStore((s) => s.cadetName);

  const advanceTo = (n) => setCurrentPhase(n);

  // No investigation in progress — show prompt
  if (!cadetName && !incident?.scenario) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-usafa-blue/10 dark:bg-usafa-blue/20 flex items-center justify-center">
          <FlaskConical className="w-8 h-8 text-usafa-blue dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No Investigation in Progress</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Start a new investigation from the Dashboard by entering your incident report and cadet information.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 bg-usafa-blue hover:bg-usafa-blue-light text-white rounded-xl text-sm font-medium transition-colors"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Phase stepper */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {phases.map((phase, i) => {
            const done = phaseCompleted[phase.id];
            const active = currentPhase === phase.id;
            const canNav = done || phase.id <= currentPhase;
            return (
              <div key={phase.id} className="flex items-center">
                <button
                  onClick={() => canNav && setCurrentPhase(phase.id)}
                  disabled={!canNav}
                  className={`flex flex-col items-center gap-1 ${canNav ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    done
                      ? "bg-green-500 text-white"
                      : active
                      ? "bg-usafa-blue text-white"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : phase.id}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? "text-usafa-blue dark:text-blue-400" : "text-slate-400"}`}>
                    {phase.label}
                  </span>
                </button>
                {i < phases.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-10 mx-1 ${phaseCompleted[phase.id] ? "bg-green-400" : "bg-slate-200 dark:bg-slate-600"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        {currentPhase === 1 && <Phase1Initial onNext={() => advanceTo(2)} />}
        {currentPhase === 2 && <Phase2Flowchart onNext={() => advanceTo(3)} />}
        {currentPhase === 3 && <Phase3Biochemical onNext={() => advanceTo(4)} />}
        {currentPhase === 4 && <Phase4FinalID />}
      </div>
    </div>
  );
}
