import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { registerSW } from "virtual:pwa-register";

// Shows a banner when a newer version of the app has been downloaded.
// Tapping "Update" activates it and reloads; saved work is kept (it lives in
// on-device storage, not in the page).
export default function UpdatePrompt() {
  const [updateSW, setUpdateSW] = useState(null);
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    let registration = null;
    const check = () => {
      if (document.visibilityState === "visible" && registration) {
        registration.update().catch(() => {});
      }
    };
    const update = registerSW({
      onNeedRefresh: () => setNeedRefresh(true),
      onRegisteredSW: (_url, reg) => {
        registration = reg || null;
      },
    });
    setUpdateSW(() => update);
    // Installed PWAs can stay open for days — look for a new version whenever
    // the app comes back to the foreground, and hourly while it stays open.
    document.addEventListener("visibilitychange", check);
    const interval = setInterval(check, 60 * 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", check);
      clearInterval(interval);
    };
  }, []);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950 border-b border-blue-300 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-100"
    >
      <span className="flex-1">A new version of MicroID is ready. Your work is saved.</span>
      <button
        type="button"
        onClick={async () => {
          // Normal path: activate the waiting version; the page reloads itself
          // once it takes over. On iOS that handoff sometimes never happens
          // (seen in the simulator), so also message the waiting worker
          // directly and reload anyway after a few seconds.
          try {
            const reg = await navigator.serviceWorker?.getRegistration();
            reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
          } catch {
            /* ignore */
          }
          if (updateSW) updateSW(true);
          setTimeout(() => window.location.reload(), 3000);
        }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-usafa-blue text-white font-semibold hover:bg-usafa-blue-light"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Update
      </button>
    </div>
  );
}
