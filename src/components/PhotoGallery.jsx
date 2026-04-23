import { useState } from "react";
import { Image, Camera, Trash2, BookOpen, FlaskConical, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useSessionStore } from "../stores/useSessionStore";
import { useNavigate } from "react-router";

// ─── Reference gallery data (static, for learning) ────────────────────────────
// Images sourced from Wikimedia Commons (CC BY-SA) and CDC PHIL (public domain)
const referenceItems = [
  // Staining
  { id: "gram-pos-coccus", category: "Staining", testName: "Gram Stain", label: "Gram+ Cocci", description: "Purple cocci in clusters (e.g., Staphylococcus)", photo: "/images/reference/gram-pos-coccus.jpg", credit: "Y Tambe, Wikimedia CC BY-SA 3.0" },
  { id: "gram-pos-rod", category: "Staining", testName: "Gram Stain", label: "Gram+ Rods", description: "Purple rods (e.g., Bacillus, Clostridium)", photo: "/images/reference/gram-pos-rod.jpg", credit: "Y Tambe, Wikimedia CC BY-SA 3.0" },
  { id: "gram-neg-rod", category: "Staining", testName: "Gram Stain", label: "Gram− Rods", description: "Pink/red rods (e.g., E. coli, Salmonella)", photo: "/images/reference/gram-neg-rod.jpg", credit: "Y Tambe, Wikimedia CC BY-SA 3.0" },
  { id: "gram-neg-coccus", category: "Staining", testName: "Gram Stain", label: "Gram− Cocci", description: "Pink diplococci (e.g., Neisseria)", photo: "/images/reference/gram-neg-coccus.jpg", credit: "Dr Graham Beards, Wikimedia CC BY-SA 4.0" },
  { id: "endospore-pos", category: "Staining", testName: "Endospore Stain", label: "Endospore Positive", description: "Green oval endospores inside pink vegetative cells", photo: "/images/reference/endospore-pos.png", credit: "WMrapids, Wikimedia CC0" },
  { id: "endospore-neg", category: "Staining", testName: "Endospore Stain", label: "Endospore Negative", description: "All cells pink/red — no green bodies visible", photo: "/images/reference/endospore-neg.png", credit: "AI-generated reference image" },
  { id: "acid-fast-pos", category: "Staining", testName: "Acid-Fast Stain", label: "Acid-Fast Positive", description: "Bright red bacilli against blue background", photo: "/images/reference/acid-fast-pos.jpg", credit: "CDC/Dr. George P. Kubica, public domain" },
  { id: "acid-fast-neg", category: "Staining", testName: "Acid-Fast Stain", label: "Acid-Fast Negative", description: "All cells blue — non-acid-fast organisms", photo: "/images/reference/acid-fast-neg.jpg", credit: "S. Nxumalo, Wikimedia CC BY-SA 4.0" },
  // Media / biochemical
  { id: "blood-alpha", category: "Media", testName: "Blood Agar", label: "Alpha Hemolysis", description: "Greenish discoloration — partial RBC lysis", photo: "/images/reference/blood-alpha.jpg", credit: "A.K. Chaurasiya, Wikimedia CC BY-SA 4.0" },
  { id: "blood-beta", category: "Media", testName: "Blood Agar", label: "Beta Hemolysis", description: "Complete clear zone — total RBC lysis", photo: "/images/reference/blood-beta.jpg", credit: "HansN., Wikimedia CC BY-SA 3.0" },
  { id: "blood-gamma", category: "Media", testName: "Blood Agar", label: "Hemolysis Comparison", description: "Alpha, beta, and gamma hemolysis side by side", photo: "/images/reference/hemolysis-types.jpg", credit: "Y Tambe, Wikimedia CC BY-SA 3.0" },
  { id: "mac-pos", category: "Media", testName: "MacConkey Agar", label: "LF vs Non-Fermenter", description: "Pink colonies = lactose+; colorless = lactose−", photo: "/images/reference/mac-combined.jpg", credit: "A.K. Chaurasiya, Wikimedia CC BY-SA 4.0" },
  { id: "kia-all", category: "Media", testName: "KIA / TSI", label: "Reaction Patterns", description: "A/A with gas, K/A glucose only, H₂S positive, uninoculated", photo: "/images/reference/kia-tubes.jpg", credit: "Witmadrid, Wikimedia public domain" },
  { id: "kia-labeled", category: "Media", testName: "KIA / TSI", label: "Labeled Reactions", description: "TSI tubes with organism-specific results labeled", photo: "/images/reference/kia-tubes-labeled.jpg", credit: "Y Tambe, Wikimedia CC BY-SA 3.0" },
  { id: "urease-pos", category: "Enzymatic", testName: "Urea Broth", label: "Urease Positive", description: "Bright pink/magenta — ammonia raises pH", photo: "/images/reference/urease-pos.jpg", credit: "A.K. Chaurasiya, Wikimedia CC BY 4.0" },
  { id: "catalase-pos", category: "Enzymatic", testName: "Catalase", label: "Catalase Positive", description: "Vigorous bubbling with H₂O₂", photo: "/images/reference/catalase-pos.jpg", credit: "Nase, Wikimedia CC BY-SA 3.0" },
  { id: "oxidase-pos", category: "Enzymatic", testName: "Oxidase", label: "Oxidase Positive", description: "Dark blue/purple color within 10 seconds", photo: "/images/reference/oxidase-pos.jpg", credit: "A.K. Chaurasiya, Wikimedia CC BY-SA 4.0" },
];

// ─── Result color chip ─────────────────────────────────────────────────────────
function resultChip(result) {
  if (!result) return null;
  const r = String(result).toLowerCase();
  let cls = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
  if (r === "positive" || r === "acid" || r === "acid and gas" || r === "sensitive" || r === "alpha" || r === "beta") {
    cls = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  } else if (r === "negative" || r === "resistant" || r === "gamma") {
    cls = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${cls}`}>{result}</span>
  );
}

// ─── Individual uploaded photo card ───────────────────────────────────────────
function PhotoCard({ photoKey, photo }) {
  const removeTestPhoto = useSessionStore((s) => s.removeTestPhoto);
  const updatePhotoCaption = useSessionStore((s) => s.updatePhotoCaption);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(photo.caption ?? "");
  const [lightbox, setLightbox] = useState(false);

  const saveCaption = () => {
    updatePhotoCaption(photoKey, draft);
    setEditing(false);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 flex flex-col">
        {/* Thumbnail — tap to enlarge */}
        <div className="relative cursor-pointer" onClick={() => setLightbox(true)}>
          <img
            src={photo.dataUrl}
            alt={photo.caption || photo.testName}
            className="w-full object-cover"
            style={{ maxHeight: "180px" }}
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-lg transition-opacity">
              Tap to enlarge
            </span>
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTestPhoto(photoKey); }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-red-600 text-white transition-colors"
            title="Remove photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Info */}
        <div className="p-2.5 flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{photo.testName}</span>
            {resultChip(photo.recordedResult)}
          </div>

          {/* Caption — tap to edit */}
          {editing ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveCaption(); if (e.key === "Escape") setEditing(false); }}
                className="flex-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-1.5 py-1 focus:ring-1 focus:ring-usafa-blue outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={saveCaption}
                className="text-xs px-2 py-1 bg-usafa-blue text-white rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setDraft(photo.caption ?? ""); setEditing(true); }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 italic text-left w-full truncate transition-colors"
            >
              📷 {photo.caption || "Tap to edit caption"}
            </button>
          )}

          {photo.uploadedAt && (
            <p className="text-xs text-slate-300 dark:text-slate-600">
              {new Date(photo.uploadedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={photo.dataUrl} alt={photo.caption} className="w-full rounded-xl shadow-2xl" />
            <div className="mt-2 text-center text-white text-sm font-medium">
              {photo.testName} {photo.recordedResult ? `— ${photo.recordedResult}` : ""}
            </div>
            {photo.caption && <p className="text-center text-white/70 text-xs mt-1 italic">{photo.caption}</p>}
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Reference image card ─────────────────────────────────────────────────────
function ReferenceCard({ item }) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div
        className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 cursor-pointer"
        onClick={() => item.photo && setLightbox(true)}
      >
        {item.photo ? (
          <img
            src={item.photo}
            alt={`${item.testName} — ${item.label}`}
            className="aspect-video w-full object-cover rounded-t-xl border-b border-slate-200 dark:border-slate-700"
            loading="lazy"
          />
        ) : (
          <div className="aspect-video rounded-t-xl border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center p-2">
            <p className="text-xs font-medium text-center text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">AI-generated image needed</p>
          </div>
        )}
        <div className="p-2">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.testName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-tight">{item.description}</p>
          {item.credit && (
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1 truncate" title={item.credit}>{item.credit}</p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && item.photo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={item.photo} alt={`${item.testName} — ${item.label}`} className="w-full rounded-xl shadow-2xl" />
            <div className="mt-2 text-center text-white text-sm font-medium">{item.testName} — {item.label}</div>
            <p className="text-center text-white/70 text-xs mt-1">{item.description}</p>
            {item.credit && <p className="text-center text-white/50 text-xs mt-1">{item.credit}</p>}
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function PhotoGallery() {
  const navigate = useNavigate();
  const testPhotos = useSessionStore((s) => s.testPhotos ?? {});
  const [showReference, setShowReference] = useState(false);
  const [refSearch, setRefSearch] = useState("");

  const uploadedPhotos = Object.entries(testPhotos);
  const hasPhotos = uploadedPhotos.length > 0;

  const filteredRef = referenceItems.filter((item) =>
    !refSearch ||
    item.testName.toLowerCase().includes(refSearch.toLowerCase()) ||
    item.label.toLowerCase().includes(refSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(refSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* ── My Lab Photos ─────────────────────────────────────── */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-usafa-blue" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">My Lab Photos</h2>
          {hasPhotos && (
            <span className="ml-auto text-xs bg-usafa-blue text-white px-2 py-0.5 rounded-full font-medium">
              {uploadedPhotos.length}
            </span>
          )}
        </div>

        {hasPhotos ? (
          <div className="grid grid-cols-2 gap-3">
            {uploadedPhotos.map(([key, photo]) => (
              <PhotoCard key={key} photoKey={key} photo={photo} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-usafa-blue/10 dark:bg-usafa-blue/20 flex items-center justify-center">
              <Camera className="w-7 h-7 text-usafa-blue dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">No Photos Yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Add photos of your stains and test results as you work through the identification workflow.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-200 max-w-xs text-left">
              <p className="font-semibold mb-1">📸 How to add photos:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Go to the <strong>Workflow</strong> tab</li>
                <li>In Phase 1, add a photo of your Gram stain</li>
                <li>In Phase 3, tap the camera icon on any recorded test</li>
                <li>Photos appear here and are included in your export</li>
              </ol>
            </div>
            <button
              onClick={() => navigate("/workflow")}
              className="flex items-center gap-2 px-5 py-2.5 bg-usafa-blue hover:bg-usafa-blue-light text-white rounded-xl text-sm font-medium transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              Go to Workflow
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-700 mx-4" />

      {/* ── Reference Gallery (collapsible) ───────────────────── */}
      <div className="p-4 space-y-3">
        <button
          onClick={() => setShowReference((v) => !v)}
          className="w-full flex items-center gap-2 text-left"
        >
          <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Reference Photo Guide</span>
          <span className="text-xs text-slate-400 ml-1">(what each result looks like)</span>
          <span className="ml-auto text-slate-400">
            {showReference ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {showReference && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={refSearch}
                onChange={(e) => setRefSearch(e.target.value)}
                placeholder="Search tests…"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:ring-2 focus:ring-usafa-blue outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredRef.map((item) => (
                <ReferenceCard key={item.id} item={item} />
              ))}
            </div>
            {filteredRef.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No matches for "{refSearch}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
