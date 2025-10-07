"use client";

import { useState } from "react";

export default function AIDesignVisualizer() {
  const [space, setSpace] = useState<File | null>(null);
  const [mask, setMask] = useState<File | null>(null); // optional
  const [instructions, setInstructions] = useState(
    "Apply the selected material to the main feature wall only. Keep ceiling and floor unchanged."
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onPickSpace(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setSpace(f);
    setResultUrl(null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!space) return alert("Please upload your space image first.");

    setLoading(true);
    setResultUrl(null);

    try {
      const fd = new FormData();
      fd.append("space", space);
      if (mask) fd.append("mask", mask); // optional
      fd.append("instructions", instructions);

      const res = await fetch("/api/generate-design", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      alert(`Failed: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-semibold">AI Design Visualizer</h1>
        <nav className="flex gap-3 text-sm">
          <a href="/" className="underline">Home</a>
          <a href="/materials" className="underline">More options</a>
        </nav>
      </header>

      <form onSubmit={onGenerate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Space image (JPG/PNG)</label>
          <input type="file" accept="image/*" onChange={onPickSpace} />
          {preview && (
            <div className="mt-3 border rounded-xl overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-auto object-contain" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Optional mask (PNG with transparent areas to edit)
          </label>
          <input type="file" accept="image/png" onChange={(e) => setMask(e.target.files?.[0] ?? null)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm min-h-[100px]"
            placeholder="Describe exactly how to apply the material."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-xl px-4 py-2 border shadow hover:shadow-md disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate Design"}
        </button>
      </form>

      {resultUrl && (
        <section className="mt-8">
          <h2 className="text-sm font-medium mb-2">Result</h2>
          <div className="border rounded-xl overflow-hidden">
            <img src={resultUrl} alt="AI result" className="w-full h-auto object-contain" />
          </div>
          <a href={resultUrl} download="design.png" className="inline-block mt-3 text-sm underline">
            Download PNG
          </a>
        </section>
      )}
    </main>
  );
}
