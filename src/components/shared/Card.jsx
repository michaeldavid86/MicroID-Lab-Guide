export default function Card({ children, className = "", padding = true }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ${padding ? "p-4" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
