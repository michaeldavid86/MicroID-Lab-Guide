import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import { X } from "lucide-react";
import { useAppStore } from "./stores/useAppStore";
import { useSessionStore } from "./stores/useSessionStore";
import Header from "./components/layout/Header";
import TabBar from "./components/layout/TabBar";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import Dashboard from "./components/Dashboard";
import WorkflowContainer from "./components/workflow/WorkflowContainer";
import DataSheet from "./components/DataSheet";
import ReferenceLibrary from "./components/ReferenceLibrary";
import PhotoGallery from "./components/PhotoGallery";
import ExportView from "./components/ExportView";

export default function App() {
  const initDarkMode = useAppStore((s) => s.initDarkMode);
  const hydratePhotos = useSessionStore((s) => s.hydratePhotos);
  const recompute = useSessionStore((s) => s.recompute);
  const photoError = useSessionStore((s) => s.photoError);

  // On mount: reconcile dark mode, load photos from IndexedDB, and recompute
  // derived engine state so any stale persisted candidate list is corrected.
  useEffect(() => {
    initDarkMode();
    hydratePhotos();
    recompute();
  }, []);

  // Measure the fixed header and nav (their heights include the safe-area
  // padding) so the scrollable middle can be positioned exactly between them.
  // This avoids every viewport height unit (dvh/lvh/vh/innerHeight), which iOS
  // standalone PWAs report inconsistently. Only position:fixed top:0 / bottom:0
  // anchoring is used — verified reliable on-device.
  useEffect(() => {
    const rootEl = document.documentElement;
    const header = document.getElementById("app-header");
    const nav = document.getElementById("app-nav");
    const update = () => {
      if (header) rootEl.style.setProperty("--header-h", header.offsetHeight + "px");
      if (nav) rootEl.style.setProperty("--nav-h", nav.offsetHeight + "px");
    };
    update();
    // Re-measure after layout settles (safe areas / fonts can arrive a frame late)
    const raf = requestAnimationFrame(update);
    const timer = setTimeout(update, 300);
    const ro = "ResizeObserver" in window ? new ResizeObserver(update) : null;
    if (ro && header) ro.observe(header);
    if (ro && nav) ro.observe(nav);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header — anchored to the true top edge */}
      <div id="app-header" className="fixed top-0 inset-x-0 z-40">
        <Header />
        {photoError && (
          <div className="flex items-start gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-950 border-b border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            <span className="flex-1">{photoError}</span>
            <button
              onClick={() => useSessionStore.setState({ photoError: null })}
              className="p-0.5 hover:bg-amber-200 dark:hover:bg-amber-900 rounded"
              aria-label="Dismiss storage warning"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable content — positioned exactly between the fixed header and nav */}
      <main
        className="fixed inset-x-0 overflow-hidden bg-slate-50 dark:bg-slate-900"
        style={{
          top: "var(--header-h, calc(4.5rem + env(safe-area-inset-top, 0px)))",
          bottom: "var(--nav-h, calc(3.5rem + env(safe-area-inset-bottom, 0px)))",
        }}
      >
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<div className="h-full overflow-y-auto"><Dashboard /></div>} />
            <Route path="/workflow" element={<div className="h-full flex flex-col"><WorkflowContainer /></div>} />
            <Route path="/datasheet" element={<div className="h-full overflow-y-auto"><DataSheet /></div>} />
            <Route path="/reference" element={<div className="h-full flex flex-col"><ReferenceLibrary /></div>} />
            <Route path="/gallery" element={<div className="h-full flex flex-col"><PhotoGallery /></div>} />
            <Route path="/export" element={<div className="h-full overflow-y-auto"><ExportView /></div>} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Nav — anchored to the true bottom edge */}
      <div id="app-nav" className="fixed bottom-0 inset-x-0 z-40">
        <TabBar />
      </div>
    </div>
  );
}
