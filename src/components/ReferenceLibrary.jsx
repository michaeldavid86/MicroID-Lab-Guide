import { useState, useMemo } from "react";
import { tests } from "../data/tests";
import { media } from "../data/media";
import { Search, BookOpen, ChevronDown, FlaskConical, Microscope } from "lucide-react";
import Card from "./shared/Card";
import Badge from "./shared/Badge";

const typeColors = {
  "selective": "info",
  "differential": "medium",
  "selective-differential": "high",
  "enrichment": "variable",
  "general-purpose": "default",
  "biochemical": "assignable",
};

function ReferenceCard({ item, type }) {
  const [expanded, setExpanded] = useState(false);
  const isTest = type === "test";

  const typeBadge = isTest ? item.category : item.type;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
      <button
        className="w-full flex items-start gap-3 p-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
          {isTest ? <FlaskConical className="w-4 h-4 text-usafa-blue" /> : <Microscope className="w-4 h-4 text-usafa-blue" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{item.name}</span>
            {item.abbreviation && (
              <span className="text-xs text-slate-400 dark:text-slate-500">({item.abbreviation})</span>
            )}
            <Badge variant={typeColors[typeBadge] || "default"}>{typeBadge}</Badge>
          </div>
          {!expanded && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {isTest ? item.quickRef : item.howToRead}
            </p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-700 pt-3 space-y-3">
          {/* Photo placeholder */}
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <div className="text-center p-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Positive Result</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {isTest ? item.resultDescriptions?.positive : "See lab reference"}
                </p>
              </div>
            </div>
            <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <div className="text-center p-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Negative Result</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {isTest ? item.resultDescriptions?.negative : "See lab reference"}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {isTest ? (
              <>
                <Detail label="Quick Reference" value={item.quickRef} />
                <Detail label="Phase" value={`Phase ${item.phase}`} />
                <Detail label="Applies To" value={`Section${item.applicableSections.length > 1 ? "s" : ""} ${item.applicableSections.join(", ")}`} />
                {item.firstPrinciple && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">First Principles</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 rounded-lg p-2">{item.firstPrinciple}</p>
                  </div>
                )}
                {item.prerequisiteTests?.length > 0 && (
                  <Detail label="Prerequisites" value={item.prerequisiteTests.join(", ")} />
                )}
              </>
            ) : (
              <>
                <Detail label="Type" value={item.type} />
                <Detail label="Key Components" value={item.components} />
                {item.selectsFor && <Detail label="Selects For" value={item.selectsFor} />}
                {item.differentiates && <Detail label="Differentiates" value={item.differentiates} />}
                <Detail label="How to Read" value={item.howToRead} />
                {item.commonPitfalls && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">⚠️ Common Pitfalls</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 rounded-lg p-2">{item.commonPitfalls}</p>
                  </div>
                )}
                {item.relatedExercises?.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400">See:</span>
                    {item.relatedExercises.map((ex) => (
                      <Badge key={ex} variant="info">{ex}</Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}: </span>
      <span className="text-xs text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  );
}

export default function ReferenceLibrary() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const allItems = useMemo(() => {
    const testItems = tests.map((t) => ({ ...t, _type: "test" }));
    const mediaItems = media.map((m) => ({ ...m, _type: "media" }));
    return [...testItems, ...mediaItems];
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter((item) => {
      const matchesSearch = !q || item.name.toLowerCase().includes(q) ||
        (item.quickRef || "").toLowerCase().includes(q) ||
        (item.howToRead || "").toLowerCase().includes(q) ||
        (item.id || "").toLowerCase().includes(q);
      const matchesTab = activeTab === "all" || item._type === activeTab ||
        (activeTab === "staining" && item.category === "staining") ||
        (activeTab === "enzymatic" && (item.category === "enzymatic" || item.category === "metabolic")) ||
        (activeTab === "media" && item._type === "media");
      return matchesSearch && matchesTab;
    });
  }, [allItems, search, activeTab]);

  const tabOptions = [
    { id: "all", label: "All" },
    { id: "staining", label: "Staining" },
    { id: "enzymatic", label: "Tests" },
    { id: "media", label: "Media" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Search + filter */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests, media, protocols..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-usafa-blue outline-none"
          />
        </div>
        <div className="flex gap-2">
          {tabOptions.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-usafa-blue text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No results for "{search}"</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 dark:text-slate-500 px-1 mb-2">{filtered.length} entries</p>
            {filtered.map((item) => (
              <ReferenceCard key={`${item._type}-${item.id}`} item={item} type={item._type} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
