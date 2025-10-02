// Simple helpers to persist design data between pages
const KEY = "voltDesignDraft";

export type DesignDraft = {
  projectName: string;
  clientName: string;
  email: string;
  billingMode: string;
  sqm: number;
  boards: number;
  fulfillment: string;
  selectedSlugs: string[];
  selectedPaths: string[];
  imageUrl: string;
  category: "acp" | "wpc" | "acoustic";
  paletteId: string;
  description: string;
};

export function saveDraft(draft: DesignDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function loadDraft(): DesignDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DesignDraft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
