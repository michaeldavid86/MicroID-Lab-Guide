import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

// Accessible, themed confirmation dialog — replaces native confirm().
// Escape closes, backdrop click cancels, focus moves to the dialog on open,
// and the confirm action is announced via role="dialog" + aria-labelledby.
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    // Move focus into the dialog for keyboard + screen-reader users
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        tabIndex={-1}
        className="relative w-full max-w-sm mx-4 bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${destructive ? "bg-red-100 dark:bg-red-950" : "bg-blue-100 dark:bg-blue-950"}`}>
              <AlertTriangle className={`w-5 h-5 ${destructive ? "text-red-600 dark:text-red-400" : "text-usafa-blue dark:text-blue-400"}`} />
            </div>
            <h2 id="confirm-modal-title" className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div id="confirm-modal-message" className="px-5 pb-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </div>
        )}

        <div className="flex gap-2.5 px-5 pb-5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-usafa-blue hover:bg-usafa-blue-light"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
