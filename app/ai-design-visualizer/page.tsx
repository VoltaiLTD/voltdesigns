"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

/** Demo swatches from /public/materials/... */
const makeRange = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

const SWATCHES = {
  acp: makeRange(8).map((i) => ({
    id: `acp-${i}`,
    name: `ACP #${i}`,
    thumb: `/materials/acp/acp-${i}.jpg`,
  })),
  wpc: makeRange(8).map((i) => ({
    id: `wpc-${i}`,
    name: `WPC #${i}`,
    thumb: `/materials/wpc/wpc-${i}.jpg`,
  })),
  acoustic: makeRange(8).map((i) => ({
    id: `acoustic-${i}`,
    name: `Acoustic #${i}`,
    thumb: `/materials/acoustic/acoustic-${i}.jpg`,
  })),
};

type Swatch = { id: string; name: string; thumb: string };
type GroupKey = keyof typeof SWATCHES;

/** Small gold-accent button */
function ToolButton({
  onClick,
  children,
  active = false,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-3 py-1 rounded-lg border text-sm transition ${
        active
          ? "bg-amber-500/20 border-amber-400 text-amber-100"
          : "bg-white/10 border-white/20 hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

/** Brush canvas (optional mask painting) */
function BrushCanvas({
  imageUrl,
  brushSize,
  mode, // "paint" | "erase"
  zoom,
  onMaskReady,
}: {
  imageUrl: string;
  brushSize: number;
  mode: "paint" | "erase";
  zoom: number;
  onMaskReady: (blob: Blob | null) => void;
}) {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  // Draw uploaded image to base canvas
  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const base = baseCanvasRef.current!;
      const mask = maskCanvasRef.current!;
      base.width = img.naturalWidth;
      base.height = img.naturalHeight;
      mask.width = img.naturalWidth;
      mask.height = img.naturalHeight;

      const bctx = base.getContext("2d")!;
      bctx.clearRect(0, 0, base.width, base.height);
      bctx.drawImage(img, 0, 0);

      const mctx = mask.getContext("2d")!;
      mctx.clearRect(0, 0, mask.width, mask.height);
      setHasStrokes(false);
      onMaskReady(null);
    };
    img.src = imageUrl;
  }, [imageUrl, onMaskReady]);

  // Export mask in OpenAI format: white(opaque)=keep, transparent=edit
  async function exportMask() {
    const maskCanvas = maskCanvasRef.current!;
    if (!hasStrokes) {
      onMaskReady(null);
      return;
    }
    const out = document.createElement("canvas");
    out.width = maskCanvas.width;
    out.height = maskCanvas.height;
    const octx = out.getContext("2d")!;
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, out.width, out.height);
    octx.globalCompositeOperation = "destination-out";
    octx.drawImage(maskCanvas, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      out.toBlob((b) => resolve(b), "image/png")
    );
    onMaskReady(blob);
  }

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = maskCanvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * c.width) / r.width,
      y: ((e.clientY - r.top) * c.height) / r.height,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const ctx = maskCanvasRef.current!.getContext("2d")!;
    ctx.globalCompositeOperation = mode === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    setHasStrokes(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const ctx = maskCanvasRef.current!.getContext("2d")!;
    ctx.globalCompositeOperation = mode === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = brushSize;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endStroke() {
    if (!isDrawing) return;
    setIsDrawing(false);
    exportMask();
  }

  function clearMask() {
    const m = maskCanvasRef.current!;
    m.getContext("2d")!.clearRect(0, 0, m.width, m.height);
    setHasStrokes(false);
    onMaskReady(null);
  }

  return (
    <div className="relative border rounded-2xl overflow-hidden bg-black/30">
      <div
        className="relative origin-top-left"
        style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
      >
        <canvas ref={baseCanvasRef} className="block select-none" />
        <canvas
          ref={maskCanvasRef}
          className="absolute inset-0 cursor-crosshair select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
        />
      </div>

      <div className="absolute right-2 bottom-2 flex gap-2">
        <ToolButton onClick={clearMask} title="Clear">
          Clear
        </ToolButton>
      </div>
    </div>
  );
}

export default function AIDesignVisualizer() {
  const [spaceFile, setSpaceFile] = useState<File | null>(null);
  const [spaceUrl, setSpaceUrl] = useState<string | null>(null);
  const [maskBlob, setMaskBlob] = useState<Blob | null>(null);

  // multiple selection
  const [group, setGroup] = useState<GroupKey>("acp");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [brushSize, setBrushSize] = useState(36);
  const [mode, setMode] = useState<"paint" | "erase">("paint");
  const [zoom, setZoom] = useState(1);

  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const swatches = useMemo<Swatch[]>(() => SWATCHES[group], [group]);

  // All swatches (for name lookup)
  const allSwatches = useMemo<Swatch[]>(
    () => Object.values(SWATCHES).flat(),
    []
  );

  // Selected swatch objects (for names + thumbs)
  const selectedSwatches = useMemo<Swatch[]>(
    () => allSwatches.filter((s) => selectedIds.includes(s.id)),
    [allSwatches, selectedIds]
  );

  // Build /get-a-quote URL with selected material IDs + swatch images
  const quoteHref = useMemo(() => {
    const materialsParam = encodeURIComponent(selectedSwatches.map((s) => s.id).join(","));
    const imagesParam = selectedSwatches.map((s) => encodeURIComponent(s.thumb)).join(",");
    return `/get-a-quote?materials=${materialsParam}&images=${imagesParam}`;
  }, [selectedSwatches]);

  function onPickSpace(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setSpaceFile(f);
    setResultUrl(null);
    setMaskBlob(null);
    if (f) setSpaceUrl(URL.createObjectURL(f)); // ✅ preview works
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function onGenerate() {
    if (!spaceFile) return alert("Please upload a photo of your space.");
    if (!selectedIds.length)
      return alert("Select at least one material (you can pick multiple).");
    setLoading(true);
    setResultUrl(null);

    try {
      const selectedNames = selectedSwatches.map((s) => s.name);

      const fd = new FormData();
      fd.append("space", spaceFile);
      if (maskBlob) fd.append("mask", maskBlob, "mask.png");
      fd.append(
        "instructions",
        [
          `Apply these materials where painted: ${selectedNames.join(", ")}.`,
          "Blend lighting, perspective and scale realistically. Do not add or remove objects.",
          notes ? `User notes: ${notes}` : "",
        ]
          .filter(Boolean)
          .join(" ")
      );

      // Optional for server logging/debug
      fd.append("materials", JSON.stringify(selectedNames));

      const res = await fetch("/api/generate-design", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as any).error || `HTTP ${res.status}`);
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
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">AI Design Visualizer</h1>
          <p className="text-sm text-white/80">
            Upload your space, pick one or more materials, paint where they should go, then generate a preview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="text-sm underline">Home</Link>
          <Link href="/materials" className="text-sm underline">More materials</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        {/* LEFT: Upload + Canvas + Tools + Notes */}
        <div className="space-y-4">
          <label className="block text-sm font-medium">Upload your space (JPG/PNG)</label>
          <input type="file" accept="image/*" onChange={onPickSpace} />

          {spaceUrl ? (
            <>
              <BrushCanvas
                imageUrl={spaceUrl}
                brushSize={brushSize}
                mode={mode}
                zoom={zoom}
                onMaskReady={setMaskBlob}
              />

              {/* Tools */}
              <div className="flex flex-wrap items-center gap-3">
                <ToolButton onClick={() => setMode("paint")} active={mode === "paint"} title="Paint">
                  Paint
                </ToolButton>
                <ToolButton onClick={() => setMode("erase")} active={mode === "erase"} title="Erase">
                  Erase
                </ToolButton>

                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm opacity-80">Brush</span>
                  <input
                    type="range"
                    min={8}
                    max={120}
                    value={brushSize}
                    onChange={(e) => setBrushSize(+e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <ToolButton onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(2)))} title="Zoom out">
                    −
                  </ToolButton>
                  <div className="text-sm opacity-80 w-12 text-center">{Math.round(zoom * 100)}%</div>
                  <ToolButton onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))} title="Zoom in">
                    +
                  </ToolButton>
                  <ToolButton onClick={() => setZoom(1)} title="Reset zoom">
                    Reset
                  </ToolButton>
                </div>
              </div>

              <label className="block text-sm font-medium mt-2">Describe your design (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-xl p-3 text-sm min-h-[90px] bg-white/5 border-white/15"
                placeholder="e.g., Use ACP on the feature wall; keep doors and windows unchanged."
              />
            </>
          ) : (
            <div className="rounded-2xl border border-white/15 p-6 text-sm text-white/70">
              No image yet. Upload a photo to start painting.
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading || !spaceFile || !selectedIds.length}
              className="rounded-xl px-4 py-2 border border-amber-400/70 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25 disabled:opacity-60"
            >
              {loading ? "Generating…" : "Generate Design"}
            </button>

            {/* Link to Get a Quote with selected materials */}
            <Link
              href={quoteHref}
              prefetch={false}
              className={`rounded-xl px-4 py-2 border ${
                selectedIds.length === 0 ? "pointer-events-none opacity-60" : "hover:shadow"
              } border-amber-400/70 bg-amber-500/10 text-amber-100`}
            >
              Get a Quote
            </Link>
          </div>
        </div>

        {/* RIGHT: Category + Swatches + Result */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Category:</span>
            {(["acp", "wpc", "acoustic"] as GroupKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setGroup(k)}
                className={`px-3 py-1 rounded-full border text-xs ${
                  group === k
                    ? "bg-amber-500/20 border-amber-400 text-amber-100"
                    : "bg-white/10 border-white/20 hover:bg-white/15"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="text-xs opacity-80">Selected ({selectedIds.length})</div>

          <div className="grid grid-cols-3 gap-4">
            {swatches.map((s) => {
              const picked = selectedIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSelect(s.id)}
                  className={`rounded-xl overflow-hidden border transition ${
                    picked
                      ? "border-amber-400 ring-2 ring-amber-400/40"
                      : "border-white/15 hover:border-white/30"
                  }`}
                  title={s.name}
                >
                  <Image
                    src={s.thumb}
                    alt={s.name}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                  <div className="text-[12px] px-2 py-1 text-white/85">{s.name}</div>
                </button>
              );
            })}
          </div>

          {resultUrl && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Result</div>
              <div className="rounded-2xl overflow-hidden border border-white/15">
                <img src={resultUrl} alt="AI result" className="w-full h-auto object-contain" />
              </div>
              <a href={resultUrl} download="design.png" className="inline-block mt-3 text-sm underline">
                Download PNG
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
