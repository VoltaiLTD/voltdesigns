"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MATERIAL_SAMPLES, type MaterialSample, type MaterialTag } from "@/lib/catalog";

export default function AIDesignVisualizerPage() {
  const sp = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [externalImagePaths, setExternalImagePaths] = useState<string[]>([]);

  const [spaceFile, setSpaceFile] = useState<File | null>(null);
  const [maskFile, setMaskFile]   = useState<File | null>(null); // <-- new
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [maskPreviewUrl, setMaskPreviewUrl] = useState<string | null>(null); // <-- new
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState(
    "Apply the material only where the mask is transparent; keep all other areas unchanged."
  );

  const tagsParam = sp.get("tags") || "";
  const materialsParam = sp.get("materials") || sp.get("material") || "";
  const imagesParam = sp.get("images") || "";

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

  function onPickMask(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setMaskFile(f);
    if (f) setMaskPreviewUrl(URL.createObjectURL(f));
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
      if (maskFile) fd.append("mask", maskFile); // <-- send optional mask
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
          <p className="text-sm text-gray-400">Upload your space, (optionally) draw or upload a mask, pick materials, and generate a preview.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm underline">Home</a>
          <a href="/materials" className="text-sm underline">More options</a>
        </div>
      </div>

      <form onSubmit={onGenerate} className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Left: space + mask + instructions */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Space (JPG/PNG)</label>
          <input type="file" accept="image/*" onChange={onPickFile} className="block w-full" />
          {previewUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden border">
              <img src={previewUrl} alt="Space preview" className="w-full h-auto object-contain" />
            </div>
          )}

          {/* Mask upload */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Mask (PNG, optional)</label>
              <small className="text-xs text-gray-500">Transparent = apply material</small>
            </div>
            <input type="file" accept="image/png" onChange={onPickMask} className="block w-full" />
            {maskPreviewUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border">
                <img src={maskPreviewUrl} alt="Mask preview" className="w-full h-auto object-contain" />
              </div>
            )}

            {/* Simple painter (optional) */}
            <div className="mt-3">
              <MaskPainter
                backgroundUrl={previewUrl || undefined}
                onExport={(blob) => {
                  const f = new File([blob], "mask.png", { type: "image/png" });
                  setMaskFile(f);
                  setMaskPreviewUrl(URL.createObjectURL(f));
                }}
              />
            </div>
          </div>

          <label className="block text-sm font-medium mt-6 mb-2">Extra instructions (optional)</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm min-h-[100px]"
            placeholder="e.g., keep ceiling white; apply only on feature wall."
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 inline-flex items-center rounded-xl px-4 py-2 border shadow hover:shadow-md disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate Design"}
          </button>
        </div>

        {/* Right: materials */}
        <div>
          <div className="text-sm text-gray-700 mb-2">
            {tagsParam ? <>Filtered by tags: <code className="text-xs">{tagsParam}</code></> : <>Showing catalog samples</>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filtered.map((m: MaterialSample) => (
              <div key={m.id} className="rounded-2xl overflow-hidden border flex flex-col">
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={`block w-full text-left ${selectedIds.includes(m.id) ? "ring-2 ring-blue-500" : ""}`}
                  title={m.notes || ""}
                >
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

/** Tiny canvas mask painter: erases to transparent where the user draws */
function MaskPainter({
  backgroundUrl,
  onExport,
  width = 768,
  height = 512,
}: {
  backgroundUrl?: string;
  onExport: (blob: Blob) => void;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  // Initialize: fill with opaque black (preserve), user erases to transparent (edit)
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // optional faint background preview
    if (backgroundUrl) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const scale = Math.min(width / img.width, height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (width - w) / 2;
        const y = (height - h) / 2;

        // draw background *beneath* as a faint guide
        // We draw onto a temp canvas and then set globalAlpha
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.globalCompositeOperation = "destination-over";
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      };
      img.src = backgroundUrl;
    }
  }, [backgroundUrl, width, height]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * c.width,
      y: ((e.clientY - rect.top) / rect.height) * c.height,
    };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    last.current = pos(e);
  }
  function up() {
    drawing.current = false;
    last.current = null;
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const p = pos(e);
    const l = last.current || p;

    // Erase to transparent where we paint (transparent = apply material)
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 30; // brush size
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.restore();

    last.current = p;
  }

  async function exportPng() {
    const c = canvasRef.current!;
    const blob = await new Promise<Blob>((res) => c.toBlob(b => res(b!), "image/png"));
    onExport(blob);
  }

  return (
    <div className="mt-2">
      <div className="text-sm font-medium mb-1">Paint mask (transparent = edit)</div>
      <div className="rounded-xl overflow-hidden border inline-block touch-none select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button type="button" className="rounded-xl px-3 py-1 border text-sm" onClick={exportPng}>
          Use this mask
        </button>
        <button
          type="button"
          className="rounded-xl px-3 py-1 border text-sm"
          onClick={() => {
            // reset canvas
            const c = canvasRef.current!;
            const ctx = c.getContext("2d")!;
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, c.width, c.height);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
