// app/ai-design-visualizer/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
          ? "bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-100"
          : "bg-white/10 border-white/20 hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

/** Brush canvas with mask export */
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
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  // Load the image into base canvas (client-only)
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const base = baseCanvasRef.current!;
      const mask = maskCanvasRef.current!;
      base.width = img.naturalWidth;
      base.height = img.naturalHeight;
      mask.width = img.naturalWidth;
      mask.height = img.naturalHeight;

      const bctx = base.getContext("2d")!;
      bctx.clearRect(0, 0, base.width, base.height);
      bctx.drawImage(img, 0, 0);

      mask.getContext("2d")!.clearRect(0, 0, mask.width, mask.height);
      setHasStrokes(false);
      onMaskReady(null);
    };
    img.src = imageUrl;
  }, [imageUrl, onMaskReady]);

  async function exportMask() {
    const maskCanvas = maskCanvasRef.current!;
    if (!hasStrokes) {
      onMaskReady(null);
      return;
    }
    // Create an OpenAI-style mask:
    // white(opaque)=keep, transparent=edit (the painted areas become transparent)
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

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = maskCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvas.height) / rect.height;
    return { x, y };
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
    const { x, y } = pointerPos(e);
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
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endStroke() {
    if (isDrawing) {
      setIsDrawing(false);
      exportMask();
    }
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

      {/* Clear button */}
      <div className="absolute right-2 bottom-2 flex gap-2">
        <ToolButton
          onClick={() => {
            const m = maskCanvasRef.current!;
            m.getContext("2d")!.clearRect(0, 0, m.width, m.height);
            onMaskReady(null);
          }}
          title="Clear mask"
        >
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

  const [group, setGroup] = useState<GroupKey>("acp");
  const [brushSize, setBrushSize] = useState(36);
  const [mode, setMode] = useState<"paint" | "erase">("paint");
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<Swatch | null>(null);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const swatches: Swatch[] = useMemo(() => SWATCHES[group], [group]);

  function onPickSpace(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setSpaceFile(f);
    setResultUrl(null);
    setMaskBlob(null);
    if (f) setSpaceUrl(URL.createObjectURL(f));
  }

  async function onGenerate() {
    if (!spaceFile) return alert("Please upload a photo of your space.");
    if (!selected) return alert("Select a material first.");
    setLoading(true);
    setResultUrl(null);

    try {
      const fd = new FormData();
      fd.append("space", spaceFile);
      if (maskBlob) fd.append("mask", maskBlob, "mask.png");
      fd.append(
        "instructions",
        [
          `In the transparent (painted) areas, apply a realistic ${selected.name} finish that matches the sample.`,
          "Keep lighting, scale, and perspective consistent. Do not add or remove objects.",
          notes ? `User notes: ${notes}` : "",
        ]
          .filter(Boolean)
          .join(" ")
      );

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
            Upload your space, pick a material, paint where it should go, and generate a photorealistic preview.
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
                <ToolButton onClick={() => setMode("paint")} active={mode === "paint"} title="Paint material area">
                  Paint
                </ToolButton>
                <ToolButton onClick={() => setMode("erase")} active={mode === "erase"} title="Erase painted area">
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

          <button
            type="button"
            onClick={onGenerate}
            disabled={loading || !spaceFile || !selected}
            className="rounded-xl px-4 py-2 border border-fuchsia-500/70 bg-fuchsia-600/20 text-fuchsia-100 hover:bg-fuchsia-600/30 disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate Design"}
          </button>
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
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-100"
                    : "bg-white/10 border-white/20 hover:bg-white/15"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {swatches.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s)}
                className={`rounded-xl overflow-hidden border transition ${
                  selected?.id === s.id
                    ? "border-cyan-400 ring-2 ring-cyan-400/40"
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
            ))}
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
