import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, AlertTriangle, CheckCircle2, Copy, Check, ClipboardCheck, ChevronRight } from "lucide-react";
import { organisms } from "../data/organisms";
import { useAppStore } from "../stores/useAppStore";
import { useSessionStore } from "../stores/useSessionStore";
import {
  CONFIGURABLE_TESTS,
  encodeClassCode,
  decodeClassCode,
  findUnresolvablePairs,
  sanitizeDisabled,
  sanitizePool,
  getPoolIds,
} from "../utils/courseConfig";
import Card from "./shared/Card";

const CATEGORY_LABELS = {
  staining: "Stains",
  enzymatic: "Enzyme tests",
  metabolic: "Metabolic / fermentation tests",
  "differential-media": "Differential media",
  "selective-media": "Selective media",
  "antibiotic-sensitivity": "Antibiotic sensitivity",
};

export default function CourseSetup() {
  const navigate = useNavigate();
  const disabledTests = useAppStore((s) => s.disabledTests) || [];
  const setDisabledTests = useAppStore((s) => s.setDisabledTests);
  const poolOverride = useAppStore((s) => s.poolOverride);
  const setPoolOverride = useAppStore((s) => s.setPoolOverride);
  const poolIds = useMemo(() => getPoolIds(poolOverride), [poolOverride]);
  const recompute = useSessionStore((s) => s.recompute);

  const [codeInput, setCodeInput] = useState("");
  const [codeMessage, setCodeMessage] = useState(null); // { ok, text }
  const [copied, setCopied] = useState(false);

  const apply = (ids) => {
    setDisabledTests(sanitizeDisabled(ids));
    recompute(); // refresh the recommended-test ranking for the current session
  };

  const toggle = (id) =>
    apply(disabledTests.includes(id) ? disabledTests.filter((t) => t !== id) : [...disabledTests, id]);

  const togglePool = (id) =>
    setPoolOverride(sanitizePool(poolIds.includes(id) ? poolIds.filter((o) => o !== id) : [...poolIds, id]));

  const organismGroups = useMemo(() => {
    const label = (o) => `Gram-${o.gramReaction} ${o.shape === "coccus" ? "cocci" : "rods"}`;
    const byGroup = {};
    for (const o of organisms) (byGroup[label(o)] ||= []).push(o);
    return Object.entries(byGroup);
  }, []);

  const groups = useMemo(() => {
    const byCat = {};
    for (const t of CONFIGURABLE_TESTS) (byCat[t.category || "other"] ||= []).push(t);
    return Object.entries(byCat);
  }, []);

  const poolPairs = useMemo(() => findUnresolvablePairs(disabledTests, poolIds), [disabledTests, poolIds]);
  const classCode = encodeClassCode(disabledTests, poolOverride);
  const availableCount = CONFIGURABLE_TESTS.length - disabledTests.length;

  const applyCode = () => {
    const decoded = decodeClassCode(codeInput);
    if (!decoded) {
      setCodeMessage({ ok: false, text: "That class code isn't valid. Check it and try again." });
      return;
    }
    const ids = decoded.disabledTests;
    setPoolOverride(decoded.poolOverride); // null = the built-in default pool
    apply(ids);
    setCodeInput("");
    setCodeMessage({
      ok: true,
      text: ids.length === 0 ? "Class code applied — all tests available." : `Class code applied — ${ids.length} test${ids.length > 1 ? "s" : ""} hidden.`,
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the code is shown on screen to copy by hand.
    }
  };

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
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course Setup</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose which tests your classroom stocks and which organisms are in this semester's unknown
          pool. Tests switched off are hidden from the workflow and are never recommended. Results
          already recorded are kept.
        </p>
      </div>

      {/* Student: enter a class code */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Students: enter your class code</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Your instructor will give you a code that sets this list for you.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => { setCodeInput(e.target.value); setCodeMessage(null); }}
            placeholder="e.g., MID-3F0A"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Class code"
            className="flex-1 min-w-0 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-usafa-blue outline-none"
          />
          <button
            type="button"
            onClick={applyCode}
            disabled={!codeInput.trim()}
            className="px-4 py-2 rounded-lg bg-usafa-blue text-white text-sm font-medium disabled:opacity-40"
          >
            Apply
          </button>
        </div>
        {codeMessage && (
          <p className={`text-xs mt-2 ${codeMessage.ok ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {codeMessage.text}
          </p>
        )}
      </Card>

      {/* Instructor: class code + identifiability check */}
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Instructors: share this setup</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Set the test and organism switches below, then give students this code. It updates as you change the lists.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-2 text-base font-bold tracking-wider text-slate-900 dark:text-slate-100">
            {classCode}
          </code>
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-4">
          {poolPairs.length === 0 ? (
            <p className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              All {poolIds.length} organisms in the unknown pool (⭐) can still be separated from each other with the tests that are on.
            </p>
          ) : (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 p-3">
              <p className="flex items-start gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                With this setup, {poolPairs.length} pair{poolPairs.length > 1 ? "s" : ""} of pool organisms can no longer be told apart:
              </p>
              <ul className="mt-2 space-y-0.5 text-xs text-amber-900 dark:text-amber-100">
                {poolPairs.slice(0, 12).map(({ a, b }) => (
                  <li key={`${a.id}-${b.id}`}>
                    <em>{a.name}</em> vs <em>{b.name}</em>
                  </li>
                ))}
                {poolPairs.length > 12 && <li>…and {poolPairs.length - 12} more</li>}
              </ul>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-2">
                Switch a test back on, or avoid assigning both organisms of a pair.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Test switches */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Tests available ({availableCount} of {CONFIGURABLE_TESTS.length})
          </h2>
          <button
            type="button"
            onClick={() => apply([])}
            disabled={disabledTests.length === 0}
            className="text-xs font-medium text-usafa-blue dark:text-blue-400 disabled:opacity-40"
          >
            Turn all on
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          The Gram stain is always required and can't be switched off.
        </p>
        <div className="space-y-4">
          {groups.map(([cat, list]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                {CATEGORY_LABELS[cat] || "Other tests"}
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {list.map((t) => {
                  const on = !disabledTests.includes(t.id);
                  return (
                    <label key={t.id} className="flex items-center justify-between gap-3 py-2 cursor-pointer">
                      <span className={`text-sm ${on ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 line-through"}`}>
                        {t.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(t.id)}
                        className="w-5 h-5 accent-usafa-blue flex-shrink-0"
                        aria-label={`${t.name} available`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Unknown pool */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Unknown pool ({poolIds.length} of {organisms.length})
          </h2>
          <button
            type="button"
            onClick={() => setPoolOverride(null)}
            disabled={poolOverride === null}
            className="text-xs font-medium text-usafa-blue dark:text-blue-400 disabled:opacity-40"
          >
            Reset to default
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Organisms switched on are marked ⭐ for students as possible assigned unknowns. Organisms
          switched off stay in the database, so a contaminant can still be recognized.
        </p>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setPoolOverride([])}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => setPoolOverride(organisms.map((o) => o.id))}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
          >
            Select all
          </button>
        </div>
        <div className="space-y-4">
          {organismGroups.map(([group, list]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">{group}</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {list.map((o) => {
                  const on = poolIds.includes(o.id);
                  return (
                    <label key={o.id} className="flex items-center justify-between gap-3 py-2 cursor-pointer">
                      <span className={`text-sm italic ${on ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>
                        {on && <span className="not-italic">⭐ </span>}
                        {o.name}
                        <span className="not-italic text-xs text-slate-400 dark:text-slate-500"> · BSL-{o.bslLevel}</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => togglePool(o.id)}
                        className="w-5 h-5 accent-usafa-blue flex-shrink-0"
                        aria-label={`${o.name} in unknown pool`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Instructor tools */}
      <button
        type="button"
        onClick={() => navigate("/instructor")}
        className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left shadow-sm"
      >
        <span className="flex items-center gap-3">
          <ClipboardCheck className="w-5 h-5 text-usafa-blue dark:text-blue-400 flex-shrink-0" />
          <span>
            <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Instructor tools</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">Answer key, check cadet IDs, class summary (CSV)</span>
          </span>
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
}
