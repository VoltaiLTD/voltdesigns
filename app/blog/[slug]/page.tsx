import { notFound } from "next/navigation";

const POSTS = [
  {
    slug: "exterior-design-trends-2025",
    title: "Top 5 Exterior Design Trends with ACP Panels in 2025",
    content: `
      <p>ACP panels continue to shape building façades with bold geometry, 
      improved sustainability and cost-effective installation. 
      From parametric CNC patterns to natural metallic finishes, 
      these are the trends shaping 2025.</p>
      <ul>
        <li>Lightweight, recyclable ACP options</li>
        <li>Perforated and CNC-cut design façades</li>
        <li>Energy-efficient cladding with insulation backing</li>
      </ul>
    `,
    date: "2025-09-01",
  },
  {
    slug: "wpc-vs-wood",
    title: "WPC vs. Natural Wood: A Complete Guide",
    content: `
      <p>Wood-Plastic Composite (WPC) offers durability, low maintenance, 
      and resistance to moisture compared to natural timber. 
      It’s ideal for Nigerian climates with high humidity and sun exposure.</p>
    `,
    date: "2025-08-15",
  },
  {
    slug: "studio-acoustics",
    title: "How to Improve Studio Acoustics with Diffusers and Absorbers",
    content: `
      <p>Acoustic diffusers and absorbers are essential for studios. 
      Absorbers reduce flutter echo, while diffusers maintain natural ambience. 
      Together, they create balanced sound.</p>
    `,
    date: "2025-07-20",
  },
];

export default function BlogDetail({ params }: { params: { slug: string } }) {
  const post = POSTS.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  return (
    <article className="section container prose prose-invert">
      <h1>{post.title}</h1>
      <p className="text-sm text-white/50 mb-4">
        {new Date(post.date).toLocaleDateString()}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
