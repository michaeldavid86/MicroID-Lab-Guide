import { useEffect, useState } from "react";
import { Smartphone, X, Download } from "lucide-react";
import { useSessionStore } from "../../stores/useSessionStore";

const DISMISS_KEY = "microid-install-check-dismissed";

// Measure env(safe-area-inset-top) — how far the page is drawn under the status bar.
function readSafeTop() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px)";
  document.body.appendChild(probe);
  const value = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return value;
}

// True when this home-screen install was added while the app still used the
// see-through ("black-translucent") status bar. iOS remembers that setting from
// the moment the icon was added, and on iOS 26 it leaves the app one
// status-bar-height short of the screen (the bottom bar floats high and the
// header is drawn under the status bar). No CSS can fix an install like that —
// only deleting the icon and adding it again picks up the current setting.
export function hasStaleInstall() {
  const isIOS =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone =
    navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  if (!isIOS || !standalone) return false;

  const safeTop = readSafeTop();
  if (safeTop <= 0) return false; // opaque status bar: page starts below it — current install

  // Only flag it when the short-viewport bug is actually present (portrait):
  // the page is shorter than the screen by about the status-bar height.
  const portrait = window.innerHeight > window.innerWidth;
  if (!portrait) return false;
  const screenLong = Math.max(window.screen.width, window.screen.height);
  const shortfall = screenLong - window.innerHeight;
  return shortfall > 0 && Math.abs(shortfall - safeTop) <= 4;
}

export default function InstallCheck() {
  const [show, setShow] = useState(false);
  const saveBackupFile = useSessionStore((s) => s.saveBackupFile);
  const hasWork = useSessionStore((s) => !!(s.cadetName || s.incident?.scenario));

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* storage unavailable — just show it */
    }
    if (dismissed) return;
    // iOS reports full-screen numbers for the first moment after launch and only
    // settles on the real (short) values a little later (seen in the iOS
    // simulator: safe-area 0 / height 874 at startup, then 62 / 812). So check
    // again over the first few seconds and whenever the viewport changes.
    let done = false;
    const check = () => {
      if (!done && hasStaleInstall()) {
        done = true;
        setShow(true);
      }
    };
    check();
    const timers = [400, 1200, 3000].map((ms) => setTimeout(check, ms));
    window.addEventListener("resize", check);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", check);
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div
      role="status"
      className="flex items-start gap-2 px-4 py-2.5 bg-amber-100 dark:bg-amber-950 border-b border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100"
    >
      <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <p className="font-semibold">Re-add MicroID to your home screen to fix the layout</p>
        <p>
          This icon was added with an older version, so the bottom bar sits too high.{" "}
          {hasWork && <>First download a backup — deleting the icon also deletes the data saved in it. Then </>}
          {hasWork ? "delete" : "Delete"} the MicroID icon, open <strong>microid.netlify.app</strong> in Safari, and tap
          Share → Add to Home Screen.
          {hasWork && <> Restore your backup from the Dashboard (Backup &amp; Restore).</>}
        </p>
        {hasWork && (
          <button
            type="button"
            onClick={() => saveBackupFile()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-usafa-blue text-white font-semibold hover:bg-usafa-blue-light"
          >
            <Download className="w-3.5 h-3.5" />
            Download backup
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="p-0.5 rounded hover:bg-amber-200 dark:hover:bg-amber-900"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
