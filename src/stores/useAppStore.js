// MicroID Lab Guide — App-Level State Store
// Bio 431: Operational Microbiology | USAFA

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      activeTab: "dashboard",

      // Saved sessions (completed investigations)
      savedSessions: [],

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

      setActiveTab: (tab) => set({ activeTab: tab }),

      // Save a completed session snapshot
      saveSession: (sessionSnapshot) =>
        set((state) => ({
          savedSessions: [
            sessionSnapshot,
            ...state.savedSessions.filter((s) => s.sessionId !== sessionSnapshot.sessionId),
          ].slice(0, 20), // Keep last 20 sessions
        })),

      // Remove a saved session
      removeSession: (sessionId) =>
        set((state) => ({
          savedSessions: state.savedSessions.filter((s) => s.sessionId !== sessionId),
        })),

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
        savedSessions: state.savedSessions,
      }),
    }
  )
);
