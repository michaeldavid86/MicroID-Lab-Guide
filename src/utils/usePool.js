import { useMemo } from "react";
import { useAppStore } from "../stores/useAppStore";
import { getPoolIds } from "./courseConfig";

/** Set of organism ids in the active unknown pool (instructor override or default). */
export function usePoolIds() {
  const poolOverride = useAppStore((s) => s.poolOverride);
  return useMemo(() => new Set(getPoolIds(poolOverride)), [poolOverride]);
}
