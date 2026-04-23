// MicroID Lab Guide — Investigation Session Store
// Bio 431: Operational Microbiology | USAFA

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { runElimination, rankTests, runSanityCheck } from "../utils/decisionEngine";
import { getFlowchartId } from "../data/flowcharts";
import { organisms } from "../data/organisms";

const generateId = () => Math.random().toString(36).slice(2, 10).toUpperCase();

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
  testPhotos: {},

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

          // Re-run elimination with new gram data
          const { candidateIds, eliminatedEntries } = runElimination(
            newGram.reaction,
            newGram.shape,
            state.testResults
          );

          const rankings = sectionId
            ? rankTests(candidateIds, Object.keys(state.testResults), sectionId)
            : [];

          return {
            gramStain: newGram,
            flowchartSectionId: sectionId,
            candidateIds,
            eliminatedEntries,
            testRankings: rankings,
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      setEndosporeResult: (result) =>
        set({ endosporeResult: result, lastModifiedAt: new Date().toISOString() }),
      setAcidFastResult: (result) =>
        set({ acidFastResult: result, lastModifiedAt: new Date().toISOString() }),
      setCapsuleResult: (result) =>
        set({ capsuleResult: result, lastModifiedAt: new Date().toISOString() }),

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

          // Re-run elimination engine
          const { candidateIds, eliminatedEntries } = runElimination(
            state.gramStain.reaction,
            state.gramStain.shape,
            newResults
          );

          // Re-rank tests
          const rankings = state.flowchartSectionId
            ? rankTests(candidateIds, Object.keys(newResults), state.flowchartSectionId)
            : [];

          return {
            testResults: newResults,
            candidateIds,
            eliminatedEntries,
            testRankings: rankings,
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

          const { candidateIds, eliminatedEntries } = runElimination(
            state.gramStain.reaction,
            state.gramStain.shape,
            newResults
          );
          const rankings = state.flowchartSectionId
            ? rankTests(candidateIds, Object.keys(newResults), state.flowchartSectionId)
            : [];

          return {
            testResults: newResults,
            candidateIds,
            eliminatedEntries,
            testRankings: rankings,
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
          state.testResults
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

      // ─── Lab Photos ──────────────────────────────────────────
      // photoKey = testId or a stain key like "gramStain"
      uploadTestPhoto: (photoKey, dataUrl, caption, testName, recordedResult) =>
        set((state) => ({
          testPhotos: {
            ...state.testPhotos,
            [photoKey]: { dataUrl, caption, testName, recordedResult, uploadedAt: new Date().toISOString() },
          },
          lastModifiedAt: new Date().toISOString(),
        })),

      updatePhotoCaption: (photoKey, caption) =>
        set((state) => ({
          testPhotos: {
            ...state.testPhotos,
            [photoKey]: { ...state.testPhotos[photoKey], caption },
          },
          lastModifiedAt: new Date().toISOString(),
        })),

      removeTestPhoto: (photoKey) =>
        set((state) => {
          const { [photoKey]: _, ...rest } = state.testPhotos;
          return { testPhotos: rest, lastModifiedAt: new Date().toISOString() };
        }),

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
      resetSession: () =>
        set({
          ...initialState,
          sessionId: generateId(),
          createdAt: new Date().toISOString(),
          lastModifiedAt: new Date().toISOString(),
          candidateIds: organisms.map((o) => o.id),
        }),

      loadSession: (snapshot) => set({ ...snapshot }),

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
    }
  )
);
