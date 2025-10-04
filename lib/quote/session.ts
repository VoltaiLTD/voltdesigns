// lib/quote/session.ts
// SSR/Edge-safe localStorage helpers (no direct 'window' references)

export type Draft = {
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

function getStorage(): Storage | null {
  // Works in browsers only; safe in Node/Edge/prerender
  if (typeof globalThis === "undefined") return null;
  try {
    const ls = (globalThis as any).localStorage as Storage | undefined;
    return ls ?? null;
  } catch {
    return null;
  }
}

export function loadDraft(): Draft | null {
  const ls = getStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  const ls = getStorage();
  if (!ls) return;
  try {
    ls.setItem(KEY, JSON.stringify(draft));
  } catch {}
}

export function clearDraft() {
  const ls = getStorage();
  if (!ls) return;
  try {
    ls.removeItem(KEY);
  } catch {}
}
