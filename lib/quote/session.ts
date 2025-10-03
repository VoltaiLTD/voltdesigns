// DO NOT touch window/localStorage at module top-level.
// Only inside functions, and guard with typeof window.

type Draft = {
  projectName?: string;
  clientName?: string;
  email?: string;
  billingMode?: "sqm" | "board";
  sqm?: number;
  boards?: number;
  fulfillment?: "installation" | "delivery";
  selectedSlugs?: string[];
  selectedPaths?: string[];
};

const KEY = "quote-draft";

export function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {}
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}
