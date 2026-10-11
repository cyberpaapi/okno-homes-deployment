"use client";

import { useCallback } from "react";
import { customerCopyDefaults, type CustomerCopyId } from "@/data/configurator/studio/customerCopy";
import { useSiteContentMap } from "@/lib/useSiteContent";

/** Published copy updates in place; draft values appear only in the admin preview. */
export function useCustomerCopy() {
  const values = useSiteContentMap();
  return useCallback((id: CustomerCopyId, tokens: Record<string, string | number> = {}) =>
    (values[id] ?? customerCopyDefaults[id]).replace(/\{([a-z-]+)\}/g, (match, token: string) =>
      Object.hasOwn(tokens, token) ? String(tokens[token]) : match), [values]);
}
