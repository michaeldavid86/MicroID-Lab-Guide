// MicroID Lab Guide — App-Level State Store
// Bio 431: Operational Microbiology | USAFA

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_UNAVAILABLE_TESTS } from "../data/courseConfig";

// First-run default: follow the device's system theme. Once the user toggles,
// their explicit choice is persisted and used instead.
const systemPrefersDark = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useAppStore = create(
  persist(
    (set) => ({
      // UI state
      darkMode: systemPrefersDark(),

      // Tests the classroom does not stock (set on the Course Setup screen or
      // by entering a class code). Hidden from the workflow on this device.
      disabledTests: DEFAULT_UNAVAILABLE_TESTS,
      setDisabledTests: (ids) => set({ disabledTests: [...new Set(ids)] }),

      // Which organisms are in this semester's unknown pool. null = use the
      // defaults flagged in organisms.js; otherwise an array of organism ids.
      poolOverride: null,
      setPoolOverride: (ids) => set({ poolOverride: ids === null ? null : [...new Set(ids)] }),

      // Instructor answer key: [{ culture, organismId }]. Kept ONLY on this
      // device — never in class codes, backups, or the published app.
      answerKey: [],
      setAnswerKey: (rows) => set({ answerKey: rows }),

      // Toggles
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          // Apply/remove dark class on <html> element
          if (next) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { darkMode: next };
        }),

      // Initialize dark mode from persisted state on app load
      initDarkMode: () =>
        set((state) => {
          if (state.darkMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return {};
        }),
    }),
    {
      name: "microid-app",
      partialize: (state) => ({
        darkMode: state.darkMode,
        // Persist only an explicit choice; an untouched device keeps following
        // DEFAULT_UNAVAILABLE_TESTS across releases.
        ...(state.disabledTests !== DEFAULT_UNAVAILABLE_TESTS && { disabledTests: state.disabledTests }),
        poolOverride: state.poolOverride,
        answerKey: state.answerKey,
      }),
    }
  )
);
