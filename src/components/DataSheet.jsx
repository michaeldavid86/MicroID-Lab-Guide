import { useNavigate } from "react-router";
import { useSessionStore } from "../stores/useSessionStore";
import { organisms } from "../data/organisms";
import { tests } from "../data/tests";
import Card from "./shared/Card";
import Badge from "./shared/Badge";
import { ClipboardList, CheckCircle2, ArrowRight } from "lucide-react";

function ResultCell({ result }) {
  if (result === undefined || result === null) {
    return <span className="text-slate-300 dark:text-slate-600">—</span>;
  }
  if (typeof result === "object") {
    return (
      <span className="text-xs text-slate-600 dark:text-slate-300">
        {Object.entries(result).map(([k, v]) => `${k[0].toUpperCase()}: ${v}`).join(" / ")}
      </span>
    );
  }
  const lc = String(result).toLowerCase();
  const isPos = lc === "positive" || lc === "acid" || lc === "acid and gas" || lc === "sensitive" || lc === "alpha" || lc === "beta";
  const isNeg = lc === "negative" || lc === "resistant" || lc === "gamma";
  return (
    <span className={`font-medium capitalize text-sm ${isPos ? "text-positive" : isNeg ? "text-negative" : "text-variable"}`}>
      {result}
    </span>
  );
}

export default function DataSheet() {
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

  const proposedOrg = proposedOrganismId ? organisms.find((o) => o.id === proposedOrganismId) : null;

  // Empty state — no investigation started
  if (!cadetName && !incident?.scenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-usafa-blue/10 dark:bg-usafa-blue/20 flex items-center justify-center">
          <ClipboardList className="w-8 h-8 text-usafa-blue dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No Data to Display</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Your data sheet will populate automatically as you work through the identification workflow.
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

  // Group tests by category for data sheet display
  const morphTests = [
    { label: "Gram Reaction", value: gramStain.reaction },
    { label: "Cell Shape", value: gramStain.shape },
    { label: "Arrangement", value: gramStain.arrangement },
    { label: "Endospore", value: endosporeResult },
    { label: "Acid-Fast", value: acidFastResult },
    { label: "Capsule", value: capsuleResult },
    { label: "Notes", value: gramStain.notes },
  ];

  const culturalTests = [
    { label: "Colony Size", value: colonyMorphology.size },
    { label: "Colony Shape", value: colonyMorphology.shape },
    { label: "Margin", value: colonyMorphology.margin },
    { label: "Elevation", value: colonyMorphology.elevation },
    { label: "Pigment", value: colonyMorphology.pigment },
    { label: "Opacity", value: colonyMorphology.opacity },
    { label: "Texture", value: colonyMorphology.surfaceTexture },
    { label: "Growth Medium", value: colonyMorphology.growthMedium },
  ];

  // All biochemical tests with results
  const bioTests = Object.entries(testResults).map(([testId, entry]) => {
    const testDef = tests.find((t) => t.id === testId);
    return { label: testDef?.name || testId, result: entry.result, notes: entry.notes, recordedAt: entry.recordedAt };
  });

  const Section = ({ title, rows }) => (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
        {title}
      </h3>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-3 py-2 ${
              i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-700/40"
            } ${i > 0 ? "border-t border-slate-100 dark:border-slate-700" : ""}`}
          >
            <span className="text-xs text-slate-500 dark:text-slate-400 w-40 flex-shrink-0 pt-0.5">{row.label}</span>
            <div className="flex-1">
              <ResultCell result={row.result ?? row.value} />
              {row.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">{row.notes}</p>}
              {row.recordedAt && (
                <p className="text-xs text-slate-300 dark:text-slate-600">
                  {new Date(row.recordedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-5 h-5 text-usafa-blue" />
          <h1 className="font-bold text-slate-900 dark:text-slate-100">Unknown ID Data Sheet</h1>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cadet Name</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{cadetName || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lab Section</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{labSection || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Culture Number</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{cultureNumber || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{new Date().toLocaleDateString()}</p>
          </div>
          {incident.scenario && (
            <div className="col-span-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Incident Scenario</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{incident.scenario}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Final ID */}
      {proposedOrg && (
        <Card className={identificationConfirmed ? "border-green-300 dark:border-green-700" : ""}>
          <div className="flex items-center gap-2 mb-2">
            {identificationConfirmed
              ? <CheckCircle2 className="w-5 h-5 text-green-500" />
              : <Circle className="w-5 h-5 text-slate-300" />}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {identificationConfirmed ? "Confirmed Identification" : "Proposed Identification"}
            </span>
          </div>
          <p className="text-lg font-bold italic text-usafa-blue dark:text-blue-400">{proposedOrg.name}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={`bsl${proposedOrg.bslLevel}`}>BSL-{proposedOrg.bslLevel}</Badge>
            {identificationConfidence && (
              <Badge variant={identificationConfidence === "high" ? "positive" : identificationConfidence === "medium" ? "variable" : "critical"}>
                {identificationConfidence} confidence
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Morphological section */}
      <Section title="Morphological Characteristics" rows={morphTests.filter((r) => r.value)} />

      {/* Cultural characteristics */}
      {culturalTests.some((r) => r.value) && (
        <Section title="Cultural Characteristics" rows={culturalTests.filter((r) => r.value)} />
      )}

      {/* Biochemical tests */}
      {bioTests.length > 0
        ? <Section title="Biochemical / Physiological Characteristics" rows={bioTests} />
        : (
          <Card>
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
              No biochemical tests recorded yet. Complete Phase 3 in the Workflow tab.
            </p>
          </Card>
        )
      }
    </div>
  );
}
