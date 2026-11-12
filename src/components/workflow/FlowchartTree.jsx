import { useMemo } from "react";
import { CheckCircle2, CircleDot, Circle } from "lucide-react";
import { tests } from "../../data/tests";
import { buildFlowTree, summarizePath } from "../../utils/flowPath";

const testName = (step) =>
  step.test ? tests.find((t) => t.id === step.test)?.name || step.test : step.description || "Observe cell morphology";

const branchText = (label) => {
  const parts = String(label).split("→");
  return { cond: parts[0].trim(), outcome: parts.slice(1).join("→").trim() };
};

function StepNode({ node, disabledTests, depth }) {
  const { step, chosen, onPath, observed } = node;
  const isNext = onPath && chosen < 0; // first step on the path without a result
  const unavailable = step.test && disabledTests.includes(step.test);

  return (
    <div className={depth > 0 ? "mt-2" : ""}>
      <div
        className={`flex items-start gap-2 rounded-lg px-2.5 py-2 border ${
          chosen >= 0
            ? "border-usafa-blue/40 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-700"
            : isNext
            ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-600"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-70"
        }`}
      >
        {chosen >= 0 ? (
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-usafa-blue dark:text-blue-400" />
        ) : isNext ? (
          <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        ) : (
          <Circle className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-300 dark:text-slate-600" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{testName(step)}</p>
          {chosen >= 0 && (
            <p className="text-xs text-usafa-blue dark:text-blue-300">You recorded: {observed}</p>
          )}
          {isNext && !unavailable && step.test && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {observed ? `Recorded "${observed}" doesn't match a branch — recheck this result` : "Next decision point — record this result"}
            </p>
          )}
          {unavailable && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Not available in this course — use the other tests to separate these groups
            </p>
          )}
        </div>
      </div>

      <div className="ml-2 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
        {node.branches.map(({ branch, taken, child }, i) => {
          const { cond, outcome } = branchText(branch.label);
          const dimmed = chosen >= 0 && !taken;
          return (
            <div key={i} className={`mt-2 ${dimmed ? "opacity-40" : ""}`}>
              <p className={`text-xs ${taken ? "font-semibold text-usafa-blue dark:text-blue-300" : "text-slate-600 dark:text-slate-300"}`}>
                <span className="inline-block rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 mr-1 text-slate-700 dark:text-slate-200">
                  {cond}
                </span>
                {outcome && <span>→ {outcome}</span>}
                {taken && <span className="ml-1">✓</span>}
              </p>
              {!child && branch.genera?.length > 0 && (
                <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-0.5">{branch.genera.join(", ")}</p>
              )}
              {child && <StepNode node={child} disabledTests={disabledTests} depth={depth + 1} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Full decision tree for a flowchart section, with the student's path
 * highlighted from the results recorded so far.
 * state: { testResults, endosporeResult, acidFastResult, gramStain }
 */
export default function FlowchartTree({ section, state, disabledTests = [] }) {
  const tree = useMemo(() => buildFlowTree(section, state), [section, state]);
  if (!tree) return null;
  const { steps, nextStep, endBranch } = summarizePath(tree);
  const nextUnavailable = !!nextStep?.test && disabledTests.includes(nextStep.test);

  return (
    <div>
      <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 px-3 py-2 mb-3 text-xs text-slate-700 dark:text-slate-200">
        <span className="font-semibold">Your path: </span>
        {steps.length === 0 && !endBranch && <span>no branching results recorded yet. </span>}
        {steps.map((s, i) => (
          <span key={i}>
            {testName(s.step)} = {s.observed}
            {i < steps.length - 1 ? " → " : ""}
          </span>
        ))}
        {nextStep && (
          <span>
            {steps.length > 0 ? " → " : ""}
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              {nextUnavailable
                ? `${testName(nextStep)} is not available in this course — use the recommended tests instead`
                : `next: ${testName(nextStep)}`}
            </span>
          </span>
        )}
        {endBranch && (
          <span className="block mt-1">
            <span className="font-semibold">Flowchart points to: </span>
            {endBranch.genera?.length ? <em>{endBranch.genera.join(", ")}</em> : branchText(endBranch.label).outcome || endBranch.label}
          </span>
        )}
      </div>
      <StepNode node={tree} disabledTests={disabledTests} depth={0} />
    </div>
  );
}
