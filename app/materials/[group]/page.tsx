// app/materials/[group]/page.tsx
import path from "node:path";
import { promises as fs } from "node:fs";
import GridClient from "./GridClient";
import Link from "next/link";

type Group = "acp" | "wpc" | "acoustics";

// Accept common aliases and normalize
const GROUP_ALIASES: Record<string, Group> = {
  acp: "acp",
  wpc: "wpc",
  acoustic: "acoustics",   // singular → plural
  acoustics: "acoustics",
};

export const dynamic = "force-static"; // OK for public assets

async function listImagesFor(group: Group) {
  const relDir = path.posix.join("materials", group);
  const absDir = path.join(process.cwd(), "public", relDir);

  let files: string[] = [];
  try {
    files = await fs.readdir(absDir);
  } catch {
    files = [];
  }

  const imgs = files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  return imgs.map((fn) => {
    const slug = fn.replace(/\.[^.]+$/, "");
    const name = slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const image = `/${relDir}/${fn}`;
    return { slug, name, image };
  });
}

export default async function MaterialsGroupPage({
  params,
}: {
  params: { group: string };
}) {
  const raw = (params.group || "").toLowerCase();
  const group = GROUP_ALIASES[raw];

  // If it's not one of our groups at all, show a gentle landing instead of a hard 404
  if (!group) {
    return (
      <main className="px-6 py-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Unknown category</h1>
        <p className="text-sm text-gray-600 mt-2">
          Try one of the categories below:
        </p>
        <div className="flex gap-3 mt-4">
          <Link href="/materials/acp" className="underline">ACP</Link>
          <Link href="/materials/wpc" className="underline">WPC</Link>
          <Link href="/materials/acoustics" className="underline">Acoustics</Link>
        </div>
      </main>
    );
  }

  const items = await listImagesFor(group);
  return <GridClient items={items} group={group} />;
}
