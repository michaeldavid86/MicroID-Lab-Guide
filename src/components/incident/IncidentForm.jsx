import { useState } from "react";
import { useNavigate } from "react-router";
import { FileText, ChevronRight } from "lucide-react";
import { useSessionStore } from "../../stores/useSessionStore";
import Card from "../shared/Card";

export default function IncidentForm({ onComplete }) {
  const incident = useSessionStore((s) => s.incident);
  const cadetName = useSessionStore((s) => s.cadetName);
  const labSection = useSessionStore((s) => s.labSection);
  const cultureNumber = useSessionStore((s) => s.cultureNumber);
  const setIncident = useSessionStore((s) => s.setIncident);
  const setCadetInfo = useSessionStore((s) => s.setCadetInfo);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    scenario: incident.scenario,
    sampleSource: incident.sampleSource,
    location: incident.location,
    dateReported: incident.dateReported,
    sampleId: incident.sampleId,
    notes: incident.notes,
  });
  const [cadet, setCadet] = useState({ cadetName, labSection, cultureNumber });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIncident(form);
    setCadetInfo(cadet);
    if (onComplete) onComplete();
    else navigate("/workflow");
  };

  const field = (label, key, type = "text", placeholder = "", required = false) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-usafa-blue focus:border-usafa-blue outline-none transition h-[38px]"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-usafa-blue" />
          Cadet Information
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={cadet.cadetName}
              onChange={(e) => setCadet((p) => ({ ...p, cadetName: e.target.value }))}
              placeholder="Last, First MI"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-usafa-blue focus:border-usafa-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lab Section</label>
            <input
              type="text"
              value={cadet.labSection}
              onChange={(e) => setCadet((p) => ({ ...p, labSection: e.target.value }))}
              placeholder="e.g., M3A"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-usafa-blue focus:border-usafa-blue outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Culture #</label>
            <input
              type="text"
              value={cadet.cultureNumber}
              onChange={(e) => setCadet((p) => ({ ...p, cultureNumber: e.target.value }))}
              placeholder="e.g., A-12"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-usafa-blue focus:border-usafa-blue outline-none"
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-red-500" />
          Incident Report
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Incident Scenario <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.scenario}
              onChange={(e) => setForm((p) => ({ ...p, scenario: e.target.value }))}
              placeholder="e.g., Unknown biofilm recovered from KC-46 fuel bladder during scheduled maintenance inspection. Growth observed on interior surface. Sample collected for identification and risk assessment."
              required
              rows={4}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-usafa-blue focus:border-usafa-blue outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("Sample Source", "sampleSource", "text", "e.g., Wound swab, Water sample")}
            {field("Location/Platform", "location", "text", "e.g., Hangar 6, FOB Alpha")}
            {field("Date Reported", "dateReported", "date")}
            {field("Sample ID", "sampleId", "text", "e.g., BIO-2026-047")}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional context about the incident or sample..."
              rows={2}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-usafa-blue focus:border-usafa-blue outline-none resize-none"
            />
          </div>
        </div>
      </Card>

      <button
        type="submit"
        disabled={!form.scenario.trim()}
        className="w-full flex items-center justify-center gap-2 bg-usafa-blue hover:bg-usafa-blue-light disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium py-3 rounded-xl transition-colors"
      >
        Begin Investigation
        <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );
}
