// MicroID Lab Guide — Investigation Session Store
// Bio 431: Operational Microbiology | USAFA

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { runElimination, rankTests, runSanityCheck } from "../utils/decisionEngine";
import { getFlowchartId } from "../data/flowcharts";
import { organisms } from "../data/organisms";
import { putPhoto, deletePhoto, clearPhotos, getAllPhotos } from "../utils/photoDB";

const generateId = () => Math.random().toString(36).slice(2, 10).toUpperCase();

// Recompute the decision-engine derived state from the current observations.
// Centralizes the elimination + ranking so every setter stays consistent.
function recomputeDerived(gramStain, testResults, observations, flowchartSectionId) {
  const { candidateIds, eliminatedEntries } = runElimination(
    gramStain.reaction,
    gramStain.shape,
    testResults,
    observations
  );
  const testRankings = flowchartSectionId
    ? rankTests(candidateIds, Object.keys(testResults), flowchartSectionId)
    : [];
  return { candidateIds, eliminatedEntries, testRankings };
}

const initialState = {
  sessionId: generateId(),
  createdAt: new Date().toISOString(),
  lastModifiedAt: new Date().toISOString(),
  isComplete: false,

  // Cadet info
  cadetName: "",
  labSection: "",
  cultureNumber: "",

  // Incident report
  incident: {
    scenario: "",
    sampleSource: "",
    location: "",
    dateReported: "",
    sampleId: "",
    notes: "",
  },

  // Phase tracking (1–4)
  currentPhase: 1,
  phaseCompleted: { 1: false, 2: false, 3: false, 4: false },

  // Phase 1 — Initial observations
  gramStain: {
    reaction: null,     // "positive" | "negative"
    shape: null,        // "coccus" | "rod" | "coccobacillus"
    arrangement: null,  // "clusters" | "chains" | "pairs" | "singles" | "tetrads" | "palisades"
    notes: "",
  },
  endosporeResult: null,   // "positive" | "negative" | null
  acidFastResult: null,
  capsuleResult: null,
  colonyMorphology: {
    size: "",
    shape: "",
    margin: "",
    elevation: "",
    pigment: "",
    opacity: "",
    surfaceTexture: "",
    growthMedium: "",
    growthTemp: "",
    notes: "",
  },

  // Phase 2 — Flowchart routing
  flowchartSectionId: null, // e.g., "gramPositiveCoccus"

  // Phase 3 — Biochemical testing
  // testResults: { [testId]: { result, recordedAt, notes } }
  testResults: {},

  // Lab photos — { [photoKey]: { dataUrl, caption, testName, recordedResult, uploadedAt } }
  // photoKey = testId, or "gramStain", "endosporeStain", etc.
  // Stored in IndexedDB (not localStorage) — see hydratePhotos / photoDB.js.
  testPhotos: {},
  photoError: null, // set when a photo fails to persist to device storage

  // Decision engine state (derived, cached)
  candidateIds: organisms.map((o) => o.id), // All organisms initially
  eliminatedEntries: [], // [{ organismId, name, eliminatedBy, expected, observed }]
  testRankings: [], // [{ testId, testName, discriminationValue, label }]

  // Phase 4 — Final ID
  proposedOrganismId: null,
  customOrganismName: null, // For write-in IDs not in the database
  sanityCheckResults: null,
  identificationConfirmed: false,
  identificationConfidence: null, // "high" | "medium" | "low"
  identificationNotes: "",

  // Risk assessment memo data
  memo: {
    operationalThreatAssessment: "",
    recommendedCountermeasures: "",
    additionalNotes: "",
  },
};

export const useSessionStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ─── Cadet Info ───────────────────────────────────────────
      setCadetInfo: (info) =>
        set({ ...info, lastModifiedAt: new Date().toISOString() }),

      // ─── Incident Report ──────────────────────────────────────
      setIncident: (data) =>
        set((state) => ({
          incident: { ...state.incident, ...data },
          lastModifiedAt: new Date().toISOString(),
        })),

      // ─── Colony Morphology ────────────────────────────────────
      setColonyMorphology: (data) =>
        set((state) => ({
          colonyMorphology: { ...state.colonyMorphology, ...data },
          lastModifiedAt: new Date().toISOString(),
        })),

      // ─── Phase 1: Gram Stain ──────────────────────────────────
      setGramStain: (data) =>
        set((state) => {
          const newGram = { ...state.gramStain, ...data };
          const sectionId = getFlowchartId(newGram.reaction, newGram.shape);
          const observations = {
            endospore: state.endosporeResult,
            acidFast: state.acidFastResult,
            capsule: state.capsuleResult,
          };
          const derived = recomputeDerived(newGram, state.testResults, observations, sectionId);
          return {
            gramStain: newGram,
            flowchartSectionId: sectionId,
            ...derived,
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      setEndosporeResult: (result) =>
        set((state) => {
          const observations = { endospore: result, acidFast: state.acidFastResult, capsule: state.capsuleResult };
          const derived = recomputeDerived(state.gramStain, state.testResults, observations, state.flowchartSectionId);
          return { endosporeResult: result, ...derived, lastModifiedAt: new Date().toISOString() };
        }),
      setAcidFastResult: (result) =>
        set((state) => {
          const observations = { endospore: state.endosporeResult, acidFast: result, capsule: state.capsuleResult };
          const derived = recomputeDerived(state.gramStain, state.testResults, observations, state.flowchartSectionId);
          return { acidFastResult: result, ...derived, lastModifiedAt: new Date().toISOString() };
        }),
      setCapsuleResult: (result) =>
        set((state) => {
          const observations = { endospore: state.endosporeResult, acidFast: state.acidFastResult, capsule: result };
          const derived = recomputeDerived(state.gramStain, state.testResults, observations, state.flowchartSectionId);
          return { capsuleResult: result, ...derived, lastModifiedAt: new Date().toISOString() };
        }),

      // Mark Phase 1 complete and advance
      completePhase1: () =>
        set((state) => ({
          phaseCompleted: { ...state.phaseCompleted, 1: true },
          currentPhase: Math.max(state.currentPhase, 2),
          lastModifiedAt: new Date().toISOString(),
        })),

      // ─── Phase 2: Flowchart routing ───────────────────────────
      setFlowchartSection: (sectionId) =>
        set((state) => ({
          flowchartSectionId: sectionId,
          phaseCompleted: { ...state.phaseCompleted, 2: true },
          currentPhase: Math.max(state.currentPhase, 3),
          lastModifiedAt: new Date().toISOString(),
        })),

      // ─── Phase 3: Record Test Result ──────────────────────────
      recordTestResult: (testId, result, notes = "") => {
        set((state) => {
          const newResults = {
            ...state.testResults,
            [testId]: {
              result,
              notes,
              recordedAt: new Date().toISOString(),
            },
          };
          const observations = {
            endospore: state.endosporeResult,
            acidFast: state.acidFastResult,
            capsule: state.capsuleResult,
          };
          const derived = recomputeDerived(state.gramStain, newResults, observations, state.flowchartSectionId);
          return {
            testResults: newResults,
            ...derived,
            lastModifiedAt: new Date().toISOString(),
          };
        });
      },

      // Update notes on an existing test result
      updateTestNotes: (testId, notes) =>
        set((state) => ({
          testResults: {
            ...state.testResults,
            [testId]: { ...state.testResults[testId], notes },
          },
          lastModifiedAt: new Date().toISOString(),
        })),

      // Remove a test result (undo)
      removeTestResult: (testId) => {
        set((state) => {
          const newResults = { ...state.testResults };
          delete newResults[testId];

          const observations = {
            endospore: state.endosporeResult,
            acidFast: state.acidFastResult,
            capsule: state.capsuleResult,
          };
          const derived = recomputeDerived(state.gramStain, newResults, observations, state.flowchartSectionId);
          return {
            testResults: newResults,
            ...derived,
            lastModifiedAt: new Date().toISOString(),
          };
        });
      },

      // ─── Phase 4: Final ID ────────────────────────────────────
      setProposedOrganism: (organismId) =>
        set({
          proposedOrganismId: organismId,
          customOrganismName: null,
          sanityCheckResults: null,
          identificationConfirmed: false,
          lastModifiedAt: new Date().toISOString(),
        }),

      setCustomOrganism: (name) =>
        set({
          proposedOrganismId: null,
          customOrganismName: name || null,
          sanityCheckResults: null,
          identificationConfirmed: false,
          lastModifiedAt: new Date().toISOString(),
        }),

      runSanityCheck: () => {
        const state = get();
        if (!state.proposedOrganismId) return;
        const results = runSanityCheck(
          state.proposedOrganismId,
          state.gramStain.reaction,
          state.gramStain.shape,
          state.testResults,
          {
            endospore: state.endosporeResult,
            acidFast: state.acidFastResult,
            capsule: state.capsuleResult,
          }
        );
        set({ sanityCheckResults: results, lastModifiedAt: new Date().toISOString() });
      },

      confirmIdentification: (confidence, notes) =>
        set({
          identificationConfirmed: true,
          identificationConfidence: confidence,
          identificationNotes: notes || "",
          isComplete: true,
          phaseCompleted: { 1: true, 2: true, 3: true, 4: true },
          currentPhase: 4,
          lastModifiedAt: new Date().toISOString(),
        }),

      // ─── Lab Photos (persisted in IndexedDB) ─────────────────
      // photoKey = testId or a stain key like "gramStain"
      uploadTestPhoto: (photoKey, dataUrl, caption, testName, recordedResult) => {
        const record = { dataUrl, caption, testName, recordedResult, uploadedAt: new Date().toISOString() };
        // Update in-memory state immediately so the photo renders right away…
        set((state) => ({
          testPhotos: { ...state.testPhotos, [photoKey]: record },
          photoError: null,
          lastModifiedAt: new Date().toISOString(),
        }));
        // …then persist to IndexedDB. Surface a warning if the device rejects it.
        putPhoto(photoKey, record).catch((err) => {
          console.error("Photo save failed:", err);
          set({ photoError: "A photo may not have been saved to this device. Download a backup file to be safe." });
        });
      },

      updatePhotoCaption: (photoKey, caption) =>
        set((state) => {
          const existing = state.testPhotos[photoKey];
          if (!existing) return {};
          const updated = { ...existing, caption };
          putPhoto(photoKey, updated).catch((err) => console.error("Caption save failed:", err));
          return {
            testPhotos: { ...state.testPhotos, [photoKey]: updated },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      removeTestPhoto: (photoKey) => {
        set((state) => {
          const { [photoKey]: _, ...rest } = state.testPhotos;
          return { testPhotos: rest, lastModifiedAt: new Date().toISOString() };
        });
        deletePhoto(photoKey).catch((err) => console.error("Photo delete failed:", err));
      },

      // Load photos from IndexedDB into state, migrating any legacy photos that
      // were previously kept in the localStorage session blob.
      hydratePhotos: async () => {
        try {
          const idbPhotos = await getAllPhotos();
          const statePhotos = get().testPhotos || {};
          const migrations = [];
          for (const [key, rec] of Object.entries(statePhotos)) {
            if (!idbPhotos[key]) migrations.push(putPhoto(key, rec).catch(() => {}));
          }
          if (migrations.length) await Promise.allSettled(migrations);
          set({ testPhotos: { ...statePhotos, ...idbPhotos } });
        } catch (err) {
          console.error("Photo hydrate failed:", err);
        }
      },

      // ─── Memo ─────────────────────────────────────────────────
      setMemo: (data) =>
        set((state) => ({
          memo: { ...state.memo, ...data },
          lastModifiedAt: new Date().toISOString(),
        })),

      // ─── Phase navigation ─────────────────────────────────────
      setCurrentPhase: (phase) =>
        set((state) => {
          // Only allow navigating to completed phases or current+1
          if (phase <= state.currentPhase || state.phaseCompleted[phase - 1]) {
            return { currentPhase: phase };
          }
          return {};
        }),

      // ─── Session management ───────────────────────────────────
      resetSession: () => {
        clearPhotos().catch((err) => console.error("Photo clear failed:", err));
        set({
          ...initialState,
          sessionId: generateId(),
          createdAt: new Date().toISOString(),
          lastModifiedAt: new Date().toISOString(),
          candidateIds: organisms.map((o) => o.id),
        });
      },

      loadSession: (snapshot) => {
        set({ ...snapshot, photoError: null });
        // Mirror restored photos into IndexedDB (replacing any existing ones)
        const photos = snapshot.testPhotos || {};
        clearPhotos()
          .then(() => Promise.allSettled(Object.entries(photos).map(([k, r]) => putPhoto(k, r))))
          .catch((err) => console.error("Photo restore failed:", err));
      },

      // Returns a complete snapshot of all session data for backup/restore
      getSnapshot: () => {
        const s = get();
        return {
          _microidBackup: true,
          _version: 1,
          sessionId: s.sessionId,
          createdAt: s.createdAt,
          lastModifiedAt: s.lastModifiedAt,
          isComplete: s.isComplete,
          // Cadet info
          cadetName: s.cadetName,
          labSection: s.labSection,
          cultureNumber: s.cultureNumber,
          // Incident
          incident: s.incident,
          // Phase tracking
          currentPhase: s.currentPhase,
          phaseCompleted: s.phaseCompleted,
          // Phase 1 observations
          gramStain: s.gramStain,
          endosporeResult: s.endosporeResult,
          acidFastResult: s.acidFastResult,
          capsuleResult: s.capsuleResult,
          colonyMorphology: s.colonyMorphology,
          // Phase 2
          flowchartSectionId: s.flowchartSectionId,
          // Phase 3
          testResults: s.testResults,
          testPhotos: s.testPhotos,
          // Decision engine state
          candidateIds: s.candidateIds,
          eliminatedEntries: s.eliminatedEntries,
          testRankings: s.testRankings,
          // Phase 4
          proposedOrganismId: s.proposedOrganismId,
          customOrganismName: s.customOrganismName,
          sanityCheckResults: s.sanityCheckResults,
          identificationConfirmed: s.identificationConfirmed,
          identificationConfidence: s.identificationConfidence,
          identificationNotes: s.identificationNotes,
          // Memo
          memo: s.memo,
        };
      },

      // Download the full session as a JSON backup file
      saveBackupFile: () => {
        const snapshot = get().getSnapshot();
        const json = JSON.stringify(snapshot, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const cadetSlug = (snapshot.cadetName || "unknown").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download = `MicroID_${cadetSlug}_${dateStr}.json`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      },
    }),
    {
      name: "microid-session",
      // Photos live in IndexedDB (see photoDB.js), and photoError is transient —
      // keep both out of the localStorage blob so it never approaches quota.
      partialize: (state) => {
        const { testPhotos, photoError, ...rest } = state;
        return rest;
      },
    }
  )
);
