import { useState, useRef } from "react";
import { ChevronRight, Microscope, Info, Camera, Trash2, Loader2 } from "lucide-react";
import { useSessionStore } from "../../stores/useSessionStore";
import { compressImage } from "../../utils/photoUtils";
import Card from "../shared/Card";
import Badge from "../shared/Badge";

const gramOptions = [
  { value: "positive", label: "Gram-Positive", color: "bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-200", desc: "Purple/violet cells" },
  { value: "negative", label: "Gram-Negative", color: "bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200", desc: "Pink/red cells" },
];

const shapeOptions = [
  { value: "coccus", label: "Coccus", desc: "Spherical / oval" },
  { value: "rod", label: "Rod (Bacillus)", desc: "Cylindrical" },
  { value: "coccobacillus", label: "Coccobacillus", desc: "Very short rod" },
];

const arrangementOptions = [
  { value: "singles", label: "Singles" },
  { value: "pairs", label: "Pairs (Diplo-)" },
  { value: "chains", label: "Chains (Strepto-)" },
  { value: "clusters", label: "Clusters (Staphylo-)" },
  { value: "tetrads", label: "Tetrads (4-cell)" },
  { value: "palisades", label: "Palisades / Chinese letters" },
  { value: "irregular", label: "Irregular" },
];

// ─── Shared photo upload widget ───────────────────────────────────────────────
function LabPhoto({ photoKey, testName, autoCaption, buttonLabel = "Add photo" }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");
  const photo = useSessionStore((s) => s.testPhotos?.[photoKey]);
  const uploadTestPhoto = useSessionStore((s) => s.uploadTestPhoto);
  const removeTestPhoto = useSessionStore((s) => s.removeTestPhoto);
  const updatePhotoCaption = useSessionStore((s) => s.updatePhotoCaption);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const caption = autoCaption || testName;
      uploadTestPhoto(photoKey, dataUrl, caption, testName, "");
      setCaptionDraft(caption);
    } catch { /* ignore */ } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!photo) {
    return (
      <div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-usafa-blue hover:text-usafa-blue dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {uploading ? "Uploading…" : buttonLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <img src={photo.dataUrl} alt={photo.caption} className="w-full object-cover max-h-52" />
        <button
          type="button"
          onClick={() => removeTestPhoto(photoKey)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-red-600 text-white transition-colors"
          title="Remove photo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {editingCaption ? (
        <div className="flex gap-1.5">
          <input
            type="text"
            value={captionDraft}
            onChange={(e) => setCaptionDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { updatePhotoCaption(photoKey, captionDraft); setEditingCaption(false); }
              if (e.key === "Escape") setEditingCaption(false);
            }}
            className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 focus:ring-2 focus:ring-usafa-blue outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={() => { updatePhotoCaption(photoKey, captionDraft); setEditingCaption(false); }}
            className="text-xs px-2 py-1 bg-usafa-blue text-white rounded-lg"
          >
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { setCaptionDraft(photo.caption); setEditingCaption(true); }}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 italic text-left w-full truncate transition-colors"
        >
          📷 {photo.caption || "Tap to add caption"}
        </button>
      )}
    </div>
  );
}

// ─── Gram stain photo upload ──────────────────────────────────────────────────
function GramStainPhoto({ gramReaction, gramShape }) {
  const autoCaption = gramReaction
    ? `Gram ${gramReaction}${gramShape ? ` ${gramShape}` : ""} — Gram Stain`
    : "Gram Stain";
  return (
    <LabPhoto
      photoKey="gramStain"
      testName="Gram Stain"
      autoCaption={autoCaption}
      buttonLabel="Add Gram stain photo"
    />
  );
}

// ─── Colony morphology plate photo upload ─────────────────────────────────────
function ColonyMorphologyPhoto({ colonyMorphology }) {
  // Build an auto-caption from whatever fields are filled in
  const parts = [
    colonyMorphology.pigment,
    colonyMorphology.shape,
    colonyMorphology.margin && `${colonyMorphology.margin} margin`,
    colonyMorphology.elevation,
    colonyMorphology.surfaceTexture,
    colonyMorphology.growthMedium,
  ].filter(Boolean);
  const autoCaption = parts.length
    ? `Colony: ${parts.join(", ")}`
    : "Colony Morphology — plate photo";
  return (
    <LabPhoto
      photoKey="colonyMorphology"
      testName="Colony Morphology"
      autoCaption={autoCaption}
      buttonLabel="Add plate photo"
    />
  );
}

export default function Phase1Initial({ onNext }) {
  const gramStain = useSessionStore((s) => s.gramStain);
  const setGramStain = useSessionStore((s) => s.setGramStain);
  const completePhase1 = useSessionStore((s) => s.completePhase1);
  const endosporeResult = useSessionStore((s) => s.endosporeResult);
  const acidFastResult = useSessionStore((s) => s.acidFastResult);
  const setEndosporeResult = useSessionStore((s) => s.setEndosporeResult);
  const setAcidFastResult = useSessionStore((s) => s.setAcidFastResult);
  const colonyMorphology = useSessionStore((s) => s.colonyMorphology);
  const setColonyMorphology = useSessionStore((s) => s.setColonyMorphology);

  const canAdvance = gramStain.reaction && gramStain.shape && gramStain.arrangement;

  const handleNext = () => {
    if (!canAdvance) return;
    completePhase1();
    onNext();
  };

  const SelectGroup = ({ label, options, value, onChange, colorMap }) => (
    <div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
              value === opt.value
                ? opt.color || "bg-usafa-blue border-usafa-blue text-white"
                : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-usafa-blue"
            }`}
          >
            {opt.label}
            {opt.desc && <span className="block text-xs opacity-70">{opt.desc}</span>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Gram Stain — REQUIRED */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Microscope className="w-5 h-5 text-usafa-blue" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Gram Stain <Badge variant="phase">Required First</Badge>
          </h2>
        </div>

        <div className="space-y-4">
          <SelectGroup
            label="Gram Reaction"
            options={gramOptions}
            value={gramStain.reaction}
            onChange={(v) => setGramStain({ reaction: v })}
          />
          <SelectGroup
            label="Cell Shape"
            options={shapeOptions}
            value={gramStain.shape}
            onChange={(v) => setGramStain({ shape: v })}
          />
          <SelectGroup
            label="Arrangement"
            options={arrangementOptions}
            value={gramStain.arrangement}
            onChange={(v) => setGramStain({ arrangement: v })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Microscopy Notes</label>
            <input
              type="text"
              value={gramStain.notes}
              onChange={(e) => setGramStain({ notes: e.target.value })}
              placeholder="e.g., Thick chains, uniform rods, some variation in size..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-usafa-blue outline-none"
            />
          </div>

          {/* ── Gram stain photo upload ───────────────────────────── */}
          <GramStainPhoto gramReaction={gramStain.reaction} gramShape={gramStain.shape} />
        </div>
      </Card>

      {/* Additional stains — shown only if gram reaction recorded */}
      {gramStain.reaction && (
        <>
          {/* Endospore stain — relevant for GP rods */}
          {(gramStain.reaction === "positive" && gramStain.shape === "rod") && (
            <Card>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Endospore Stain</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Schaeffer-Fulton method. Green endospores inside pink vegetative cells = positive.
              </p>
              <div className="flex gap-2">
                {["positive", "negative", "not performed"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEndosporeResult(v === "not performed" ? null : v)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
                      (endosporeResult === v || (v === "not performed" && endosporeResult === null))
                        ? v === "positive" ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : v === "negative" ? "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-slate-200 border-slate-400 text-slate-700 dark:bg-slate-600 dark:text-slate-300"
                        : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Acid-fast stain */}
          {gramStain.reaction === "positive" && gramStain.shape === "rod" && (
            <Card>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Acid-Fast Stain (Ziehl-Neelsen)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Bright red bacilli against blue background = acid-fast positive (Mycobacterium).
              </p>
              <div className="flex gap-2">
                {["positive", "negative", "not performed"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAcidFastResult(v === "not performed" ? null : v)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
                      (acidFastResult === v || (v === "not performed" && acidFastResult === null))
                        ? v === "positive" ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : v === "negative" ? "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-slate-200 border-slate-400 text-slate-700 dark:bg-slate-600 dark:text-slate-300"
                        : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Colony morphology */}
          <Card>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Colony Morphology</h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[
                ["Size", "size", "e.g., pinpoint, small, large"],
                ["Shape", "shape", "e.g., circular, irregular"],
                ["Margin", "margin", "e.g., entire, undulate, filamentous"],
                ["Elevation", "elevation", "e.g., flat, raised, convex"],
                ["Pigment", "pigment", "e.g., white, yellow, none"],
                ["Opacity", "opacity", "e.g., opaque, translucent"],
                ["Texture", "surfaceTexture", "e.g., smooth, rough, mucoid"],
                ["Medium", "growthMedium", "e.g., TSA at 37°C"],
              ].map(([label, key, placeholder]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                  <input
                    type="text"
                    value={colonyMorphology[key] || ""}
                    onChange={(e) => setColonyMorphology({ [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-xs focus:ring-2 focus:ring-usafa-blue outline-none"
                  />
                </div>
              ))}
            </div>

            {/* ── Colony plate photo upload ───────────────────────── */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Plate Photo</p>
              <ColonyMorphologyPhoto colonyMorphology={colonyMorphology} />
            </div>
          </Card>
        </>
      )}

      {/* Advance button */}
      <div className="pb-4">
        {!canAdvance && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl mb-3 text-sm text-amber-800 dark:text-amber-200">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Complete your Gram stain first — it's the foundation of your ID workflow.</span>
          </div>
        )}
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className="w-full flex items-center justify-center gap-2 bg-usafa-blue hover:bg-usafa-blue-light disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Proceed to Flowchart Routing
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
