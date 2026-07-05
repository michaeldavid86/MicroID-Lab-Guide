import { useEffect, useState } from "react";
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

// ── TEMPORARY diagnostic: reports how this device measures the viewport, so the
// bottom-nav position can be fixed deterministically. Removed after diagnosis. ──
function ViewportProbe() {
  const [d, setD] = useState(null);
  useEffect(() => {
    const measure = (css) => {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;left:-9999px;top:0;width:1px;height:${css};`;
      document.body.appendChild(el);
      const h = el.getBoundingClientRect().height;
      el.remove();
      return Math.round(h);
    };
    const run = () => {
      const nav = document.querySelector("nav");
      setD({
        inner: window.innerHeight,
        client: document.documentElement.clientHeight,
        visual: window.visualViewport ? Math.round(window.visualViewport.height) : 0,
        screen: window.screen ? window.screen.height : 0,
        dvh: measure("100dvh"),
        svh: measure("100svh"),
        lvh: measure("100lvh"),
        safeT: measure("env(safe-area-inset-top)"),
        safeB: measure("env(safe-area-inset-bottom)"),
        navBottom: nav ? Math.round(nav.getBoundingClientRect().bottom) : 0,
      });
    };
    run();
    const t1 = setTimeout(run, 400);
    const t2 = setTimeout(run, 1500);
    window.addEventListener("resize", run);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", run);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", run);
      if (window.visualViewport) window.visualViewport.removeEventListener("resize", run);
    };
  }, []);
  if (!d) return null;
  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999, background: "rgba(0,0,0,0.92)", color: "#4ade80", font: "12px/1.55 ui-monospace,monospace", padding: "8px 10px", whiteSpace: "pre-wrap" }}>
        {`inner:${d.inner}  client:${d.client}  visual:${d.visual}  screen:${d.screen}
dvh:${d.dvh}  svh:${d.svh}  lvh:${d.lvh}
safeTop:${d.safeT}  safeBottom:${d.safeB}  navBottom:${d.navBottom}`}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999, background: "rgba(220,38,38,0.75)", color: "#fff", font: "11px/1.5 ui-monospace,monospace", textAlign: "center", padding: "2px 0" }}>
        ▲ this red bar is CSS bottom:0
      </div>
    </>
  );
}

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

  return (
    <div className="fixed inset-x-0 top-0 h-app flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
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
      <main className="flex-1 overflow-hidden">
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
      <TabBar />
      <ViewportProbe />
    </div>
  );
}
