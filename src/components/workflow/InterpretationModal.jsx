// InterpretationModal.jsx
// Guided step-by-step test interpretation wizard.
// Shown for tests where interpretationQuestion !== null (KIA, fermentation, hemolysis, nitrate).
// Enforces the pedagogical model: cadets observe → interpret → record.

import { useState, useMemo } from "react";
import { Lightbulb, CheckCircle2, ArrowRight, ChevronRight, RotateCcw } from "lucide-react";
import Modal from "../shared/Modal";

// ─── Result derivation from step answers ─────────────────────────────────────

function deriveResult(testId, stepAnswers) {
  // KIA — steps map directly to compound sub-result fields
  if (testId === "kia") {
    return {
      slant: stepAnswers.slant ?? null,
      butt: stepAnswers.butt ?? null,
      gas: stepAnswers.gas ?? null,
      h2s: stepAnswers.h2s ?? null,
    };
  }

  // Sugar fermentation — acid/gas observations → result string
  if (testId.endsWith("Fermentation")) {
    const acid = stepAnswers.acid;
    const gas = stepAnswers.gas;
    if (acid === "no") return "negative";
    if (acid === "yes" && gas === "yes") return "acid and gas";
    if (acid === "yes" && gas === "no") return "acid";
    return null;
  }

  // Nitrate reduction — two-step conditional
  if (testId === "nitrateReduction") {
    if (stepAnswers.initialColor === "red") return "positive";
    if (stepAnswers.zincTest === "red") return "negative";
    if (stepAnswers.zincTest === "none") return "positive"; // strong positive: reduced past nitrite
    return null;
  }

  // Hemolysis — single-step, option value IS the result
  if (testId === "hemolysis") {
    return stepAnswers.hemolysisType ?? null;
  }

  // Generic fallback: single-step test where option value = result
  const keys = Object.keys(stepAnswers);
  if (keys.length === 1) return stepAnswers[keys[0]];
  return null;
}

// ─── Human-readable interpretation of derived result ─────────────────────────

function getInterpretation(test, result, stepAnswers) {
  const id = test.id;

  if (id === "kia" && result && typeof result === "object") {
    const { slant, butt, gas, h2s } = result;
    let meaning;
    if (slant === "alkaline" && butt === "acid") {
      meaning =
        "Alkaline slant / Acid butt — glucose-only fermentation. The organism fermented glucose (0.1% in the medium) but NOT lactose. Once glucose is exhausted, the aerobic surface catabolizes peptone → NH₃ → pH rises → slant reverts to alkaline (red).";
    } else if (slant === "acid" && butt === "acid") {
      meaning =
        "Acid slant / Acid butt — glucose AND lactose fermentation. With 10× more lactose available, acid production persists through the slant and butt alike. Multi-sugar fermenter.";
    } else if (slant === "alkaline" && butt === "alkaline") {
      meaning =
        "Alkaline slant / Alkaline butt — non-fermenter. Organism catabolizes only peptone (alkaline amines). Typical of Pseudomonas aeruginosa, Alcaligenes faecalis. No carbohydrate fermentation pathway.";
    } else {
      meaning =
        "Unusual pattern — verify your incubation time (must be 18–24 h) and your color readings.";
    }
    const addons = [];
    if (h2s === "positive")
      addons.push(
        "H₂S production: black FeS precipitate indicates reduction of thiosulfate or degradation of sulfur-containing amino acids."
      );
    if (gas === "positive")
      addons.push(
        "Gas production: CO₂ and H₂ from fermentation created bubbles, cracks, or agar displacement."
      );
    return [meaning, ...addons].join(" ");
  }

  if (id.endsWith("Fermentation")) {
    const sugar = id.replace("Fermentation", "");
    if (result === "negative")
      return `No fermentation of ${sugar}. The phenol red indicator remained red/orange — no acid was produced, meaning this organism lacks the enzymatic pathway to catabolize ${sugar} anaerobically.`;
    if (result === "acid")
      return `${sugar.charAt(0).toUpperCase() + sugar.slice(1)} fermented to acid only. The pH indicator turned yellow (acid production), but no bubble appeared in the Durham tube — fermentation produced organic acids without significant gas.`;
    if (result === "acid and gas")
      return `${sugar.charAt(0).toUpperCase() + sugar.slice(1)} fermented with acid AND gas production. Yellow indicator confirms acid; the bubble in the Durham tube captures CO₂/H₂ gas from fermentation.`;
  }

  if (id === "nitrateReduction") {
    if (stepAnswers?.initialColor === "red")
      return "Positive — nitrate (NO₃⁻) was reduced to nitrite (NO₂⁻). The Griess reagent (sulfanilic acid + α-naphthylamine) turned red, confirming nitrite presence.";
    if (stepAnswers?.zincTest === "red")
      return "Negative — nitrate was NOT reduced. Zinc is a strong reductant that converted residual nitrate → nitrite, which then reacted with the Griess reagent. The original negative reaction was a true negative.";
    if (stepAnswers?.zincTest === "none")
      return "Strong positive — nitrate was completely reduced beyond nitrite (to N₂ gas, NO, or NH₃). No nitrite remained for zinc to react with. This is a stronger result than a standard positive.";
  }

  if (id === "hemolysis") {
    if (result === "alpha")
      return "Alpha-hemolysis: partial RBC lysis. Hemolysins produce H₂O₂ → oxidizes hemoglobin → methemoglobin (green discoloration). Key organisms: Streptococcus pneumoniae, viridans streptococci.";
    if (result === "beta")
      return "Beta-hemolysis: complete RBC lysis. Streptolysins O and S (or other beta-hemolysins) fully lyse RBCs, creating a clear, colorless zone. Key organism: Streptococcus pyogenes (Group A).";
    if (result === "gamma")
      return "Gamma (non-hemolytic): no RBC lysis. Medium unchanged around colonies. Key organisms: Enterococcus, S. mutans, some CoNS.";
  }

  return "";
}

// ─── Display label for derived result ────────────────────────────────────────

function getResultLabel(testId, result) {
  if (!result) return "Unknown";
  if (testId === "kia" && typeof result === "object") {
    const parts = [
      result.slant && `Slant: ${result.slant}`,
      result.butt && `Butt: ${result.butt}`,
      result.gas && `Gas: ${result.gas}`,
      result.h2s && `H₂S: ${result.h2s}`,
    ].filter(Boolean);
    return parts.join(" · ");
  }
  if (typeof result === "string") {
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
  return String(result);
}

// ─── Color accent for result label ───────────────────────────────────────────

function getResultColorClass(result) {
  if (!result) return "";
  const str = typeof result === "string" ? result : "";
  if (str === "negative" || str === "resistant") return "text-red-700 dark:text-red-300";
  if (str === "positive" || str === "acid" || str === "acid and gas" || str === "sensitive")
    return "text-green-700 dark:text-green-300";
  if (str === "beta") return "text-green-700 dark:text-green-300";
  if (str === "alpha") return "text-yellow-700 dark:text-yellow-300";
  if (str === "gamma") return "text-slate-500 dark:text-slate-400";
  return "text-usafa-blue dark:text-blue-300";
}

// ─── Main modal component ─────────────────────────────────────────────────────

export default function InterpretationModal({ test, isOpen, onClose, onRecord }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [stepAnswers, setStepAnswers] = useState({});
  const [phase, setPhase] = useState("steps"); // "steps" | "result"

  const interp = test?.interpretationQuestion;
  const steps = interp?.steps ?? [];
  const prompt = interp?.prompt ?? "";
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];
  const currentAnswer = currentStep ? stepAnswers[currentStep.field] : null;

  const derivedResult = useMemo(() => {
    if (phase !== "result" || !test) return null;
    return deriveResult(test.id, stepAnswers);
  }, [phase, test, stepAnswers]);

  const interpretation = useMemo(() => {
    if (!derivedResult || !test) return "";
    return getInterpretation(test, derivedResult, stepAnswers);
  }, [derivedResult, test, stepAnswers]);

  const handleSelectOption = (field, value) => {
    setStepAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setPhase("result");
    }
  };

  const handleRecord = () => {
    if (derivedResult !== null) {
      onRecord(derivedResult);
      resetState();
    }
  };

  const resetState = () => {
    setStepIndex(0);
    setStepAnswers({});
    setPhase("steps");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!interp) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Interpret: ${test?.name ?? "Test"}`}
      size="lg"
    >
      <div className="space-y-4 pb-2">
        {/* Context prompt banner */}
        <div className="rounded-xl bg-usafa-blue/10 dark:bg-usafa-blue/20 border border-usafa-blue/20 dark:border-usafa-blue/30 px-4 py-3">
          <p className="text-sm font-medium text-usafa-blue dark:text-blue-300">{prompt}</p>
        </div>

        {/* ── STEP PHASE ─────────────────────────────────────────────── */}
        {phase === "steps" && (
          <>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < stepIndex
                        ? "bg-green-500"
                        : i === stepIndex
                        ? "bg-usafa-blue"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step {stepIndex + 1} of {totalSteps}
              </p>
            </div>

            {/* Observation question */}
            {currentStep && (
              <div className="space-y-3">
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 leading-snug">
                  {currentStep.question}
                </p>
                <div className="space-y-2">
                  {currentStep.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(currentStep.field, opt.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm leading-snug ${
                        currentAnswer === opt.value
                          ? "border-usafa-blue bg-usafa-blue/10 dark:bg-usafa-blue/20 text-usafa-blue dark:text-blue-300 font-medium"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-usafa-blue/40 dark:hover:border-blue-600/40"
                      }`}
                    >
                      <span className={`inline-block w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 align-middle ${
                        currentAnswer === opt.value
                          ? "border-usafa-blue bg-usafa-blue"
                          : "border-slate-300 dark:border-slate-600"
                      }`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation button */}
            <button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors bg-usafa-blue hover:bg-usafa-blue-light disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400"
            >
              {stepIndex < totalSteps - 1 ? (
                <>
                  Next Observation <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Derive Result <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}

        {/* ── RESULT PHASE ───────────────────────────────────────────── */}
        {phase === "result" && (
          <div className="space-y-4">
            {/* Derived result chip */}
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-0.5">
                  Derived Result
                </p>
                <p className={`text-base font-bold capitalize ${getResultColorClass(derivedResult)}`}>
                  {getResultLabel(test.id, derivedResult)}
                </p>
              </div>
            </div>

            {/* Interpretation */}
            {interpretation && (
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                  What this means
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {interpretation}
                </p>
              </div>
            )}

            {/* First principle */}
            {test?.firstPrinciple && (
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
                <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    First Principles
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    {test.firstPrinciple}
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={resetState}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-read
              </button>
              <button
                type="button"
                onClick={handleRecord}
                disabled={derivedResult === null}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-usafa-blue hover:bg-usafa-blue-light disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 rounded-xl text-sm font-semibold transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Record Result
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
