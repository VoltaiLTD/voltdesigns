"use client";

import { useState } from "react";

type ProductKind = "acp" | "wpc" | "acoustic";

export default function AIDesignVisualizer() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [product, setProduct] = useState<ProductKind>("acp");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) return setError("Please upload an image of your space.");
    if (!description.trim()) return setError("Please add a brief description of your idea.");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("description", description.trim());
      formData.append("product", product);

      const res = await fetch("/api/generate-design", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.error || `Generation failed (${res.status})`);
      }

      const data = (await res.json()) as { url?: string; error?: string };
      if (!data.url) throw new Error(data.error || "No image returned.");
      setResult(data.url);
    } catch (err: any) {
      setError(err.message || "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section container">
      <h1>AI Design Visualizer</h1>
      <p className="text-white/70 mt-2 max-w-2xl">
        Upload your space, choose the panel type, and describe your idea. The AI will generate a quick visual concept.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {/* Upload */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Upload a photo of your space</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full rounded-md bg-black/30 border border-white/20 p-2"
          />
        </div>

        {/* Product selector */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Panel/Product</label>
          <select
            className="w-full p-2 rounded-md bg-black/30 border border-white/20"
            value={product}
            onChange={(e) => setProduct(e.target.value as ProductKind)}
          >
            <option value="acp">ACP Panels</option>
            <option value="wpc">WPC Panels</option>
            <option value="acoustic">Acoustic Panels</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Describe your idea</label>
          <textarea
            placeholder="e.g., dark walnut WPC slats on the TV wall; add CNC pattern on feature panel"
            className="w-full p-3 rounded-md bg-black/30 border border-white/20 min-h-[110px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn btn-gold">
            {loading ? "Generating…" : "Generate Design Idea"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setResult(null);
              setError(null);
            }}
          >
            Clear
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8">
          <h2>Preview</h2>
          <img
            src={result}
            alt="AI generated preview"
            className="rounded-md shadow-lg mt-3 max-w-full"
          />
          <div className="mt-4">
            <a href={result} download className="btn btn-outline">Download Design</a>
          </div>
        </div>
      )}
    </section>
  );
}
