import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import { useAppStore } from "./stores/useAppStore";
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

  // Apply persisted dark mode on mount
  useEffect(() => {
    initDarkMode();
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
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
    </div>
  );
}
