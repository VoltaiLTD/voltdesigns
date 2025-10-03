// app/ai-design-visualizer/page.tsx  (supports ?materials= and ?images=)
export const dynamic = "force-dynamic";
export const revalidate = 0;

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MATERIAL_SAMPLES, type MaterialSample, type MaterialTag } from "@/lib/catalog";

export default function AIDesignVisualizerPage() {
  const sp = useSearchParams();

  // selected from catalog (slugs) and direct image paths
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [externalImagePaths, setExternalImagePaths] = useState<string[]>([]);

  const [spaceFile, setSpaceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState("Apply the chosen materials appropriately; keep geometry and avoid adding new objects.");

  const tagsParam = sp.get("tags") || "";
  const materialsParam = sp.get("materials") || sp.get("material") || "";
  const imagesParam = sp.get("images") || "";

  // preload picks
  useEffect(() => {
    if (materialsParam) {
      const ids = materialsParam.split(",").map(s => s.trim()).filter(Boolean);
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    }
    if (imagesParam) {
      const paths = imagesParam.split(",").map(s => decodeURIComponent(s.trim())).filter(Boolean);
      setExternalImagePaths(prev => Array.from(new Set([...prev, ...paths])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered: MaterialSample[] = useMemo(() => {
    const tags = tagsParam.split(",").map(s => s.trim()).filter(Boolean) as MaterialTag[];
    if (!tags.length) return MATERIAL_SAMPLES;
    const set = new Set(tags);
    return MATERIAL_SAMPLES.filter(s => s.tags.some(t => set.has(t)));
  }, [tagsParam]);

  function toggle(id: string) {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setResultUrl(null);
    setSpaceFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!spaceFile) return alert("Upload a photo of your space first.");
    if (!selectedIds.length && !externalImagePaths.length) return alert("Pick at least one material.");

    setLoading(true);
    setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append("space", spaceFile);
      if (selectedIds.length) fd.append("materialIds", JSON.stringify(selectedIds));
      if (externalImagePaths.length) fd.append("imagePaths", JSON.stringify(externalImagePaths));
      fd.append("instructions", instructions);

      const res = await fetch("/api/generate-design", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      alert(`Failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">AI Design Visualizer</h1>
          <p className="text-sm text-gray-600">Upload your space, pick materials, and generate a photorealistic preview.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm underline">Home</a>
          <a href="/materials" className="text-sm underline">More options</a>
        </div>
      </div>

      <form onSubmit={onGenerate} className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Left */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Space (JPG/PNG)</label>
          <input type="file" accept="image/*" onChange={onPickFile} className="block w-full" />
          {previewUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden border">
              <img src={previewUrl} alt="Space preview" className="w-full h-auto object-contain" />
            </div>
          )}

          <label className="block text-sm font-medium mt-6 mb-2">Extra instructions (optional)</label>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm min-h-[100px]"
            placeholder="e.g., ACP on trims, WPC on wall panels; keep windows/doors unchanged." />

          {(selectedIds.length > 0 || externalImagePaths.length > 0) && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-1">Selected ({selectedIds.length + externalImagePaths.length})</div>
              <div className="flex flex-wrap gap-2">
                {selectedIds.map(id => {
                  const item = MATERIAL_SAMPLES.find(s => s.id === id);
                  return <span key={id} className="px-2 py-1 rounded-full border text-xs">{item?.name ?? id}</span>;
                })}
                {externalImagePaths.map(p => {
                  const label = p.split("/").pop() || p;
                  return <span key={p} className="px-2 py-1 rounded-full border text-xs">{label}</span>;
                })}
                <button type="button" onClick={() => { setSelectedIds([]); setExternalImagePaths([]); }} className="px-2 py-1 rounded-full border text-xs">Clear</button>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="mt-4 inline-flex items-center rounded-xl px-4 py-2 border shadow hover:shadow-md disabled:opacity-60">
            {loading ? "Generating…" : "Generate Design"}
          </button>
        </div>

        {/* Right */}
        <div>
          <div className="text-sm text-gray-700 mb-2">
            {tagsParam ? <>Filtered by tags: <code className="text-xs">{tagsParam}</code></> : <>Showing catalog samples</>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filtered.map((m: MaterialSample) => (
              <div key={m.id} className="rounded-2xl overflow-hidden border flex flex-col">
                <button type="button" onClick={() => toggle(m.id)}
                  className={`block w-full text-left ${selectedIds.includes(m.id) ? "ring-2 ring-blue-500" : ""}`} title={m.notes || ""}>
                  <Image src={m.sampleImage} alt={m.name} width={400} height={300} className="w-full h-auto object-cover" />
                  <div className="p-2">
                    <div className="text-xs font-medium">{m.name}</div>
                    <div className="text-[11px] opacity-70">{m.tags.join(" • ")}</div>
                  </div>
                </button>
                <div className="flex items-center justify-between px-2 pb-2 gap-2">
                  <a href="/materials" className="text-[12px] underline">View more options</a>
                  <span className="text-[12px]">{selectedIds.includes(m.id) ? "Selected" : "Tap to select"}</span>
                </div>
              </div>
            ))}
          </div>

          {resultUrl && (
            <>
              <h2 className="text-sm font-medium mt-6 mb-2">Result</h2>
              <div className="rounded-2xl overflow-hidden border">
                <img src={resultUrl} alt="AI result" className="w-full h-auto object-contain" />
              </div>
              <a href={resultUrl} download="design.png" className="inline-block mt-3 text-sm underline">Download PNG</a>
            </>
          )}
        </div>
      </form>
    </main>
  );
}
