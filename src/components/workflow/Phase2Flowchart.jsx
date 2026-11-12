import { ChevronRight, GitBranch } from "lucide-react";
import { useSessionStore } from "../../stores/useSessionStore";
import { useAppStore } from "../../stores/useAppStore";
import { flowchartSections, getFlowchartId } from "../../data/flowcharts";
import Card from "../shared/Card";
import FlowchartTree from "./FlowchartTree";
import { useMemo } from "react";
import Badge from "../shared/Badge";

export default function Phase2Flowchart({ onNext }) {
  const gramStain = useSessionStore((s) => s.gramStain);
  const flowchartSectionId = useSessionStore((s) => s.flowchartSectionId);
  const setFlowchartSection = useSessionStore((s) => s.setFlowchartSection);
  const disabledTests = useAppStore((s) => s.disabledTests) || [];
  const testResults = useSessionStore((s) => s.testResults);
  const endosporeResult = useSessionStore((s) => s.endosporeResult);
  const acidFastResult = useSessionStore((s) => s.acidFastResult);
  const flowState = useMemo(
    () => ({ testResults, endosporeResult, acidFastResult, gramStain }),
    [testResults, endosporeResult, acidFastResult, gramStain]
  );

  const detectedId = getFlowchartId(gramStain.reaction, gramStain.shape);
  const section = flowchartSections.find((s) => s.id === detectedId);

  const handleConfirm = () => {
    setFlowchartSection(detectedId);
    onNext();
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-5 h-5 text-usafa-blue" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Flowchart Routing</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Based on your Gram stain results, the app has routed you to the correct identification
          section. Review the routing below, then confirm to begin biochemical testing.
        </p>

        {/* Gram stain summary */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">Your Results</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={gramStain.reaction === "positive" ? "high" : "critical"}>
              Gram-{gramStain.reaction}
            </Badge>
            <Badge variant="default">{gramStain.shape}</Badge>
            <Badge variant="default">{gramStain.arrangement}</Badge>
          </div>
        </div>

        {/* Routing result */}
        {section ? (
          <div className="border-2 border-usafa-blue dark:border-blue-500 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="phase">Routed To</Badge>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{section.label}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{section.description}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Diagnostic Section:</span>
              <Badge variant="info">{section.label}</Badge>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-800 dark:text-yellow-200">
            Could not determine flowchart section. Go back and verify your Gram stain results.
          </div>
        )}
      </Card>

      {/* Full decision tree, with the path highlighted from results so far */}
      {section && (
        <Card>
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1 text-sm">
            Identification Flowchart — {section.label}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Each box is a decision point. Your path lights up as you record results; you can reopen
            this flowchart at any time during biochemical testing.
          </p>
          <FlowchartTree section={section} state={flowState} disabledTests={disabledTests} />
        </Card>
      )}

      <button
        onClick={handleConfirm}
        disabled={!section}
        className="w-full flex items-center justify-center gap-2 bg-usafa-blue hover:bg-usafa-blue-light disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium py-3 rounded-xl transition-colors"
      >
        Confirm Routing — Begin Biochemical Testing
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
