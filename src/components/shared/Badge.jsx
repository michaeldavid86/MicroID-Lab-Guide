export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    variable: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    low: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    assignable: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    bsl1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    bsl2: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    phase: "bg-usafa-blue text-white",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
