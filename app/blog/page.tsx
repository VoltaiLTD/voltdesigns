export const metadata = {
  title: "Blog — Volt Designs & Acoustics",
  description: "Insights on ACP, WPC, acoustic design, and modern building solutions.",
};

const POSTS = [
  {
    slug: "exterior-design-trends-2025",
    title: "Top 5 Exterior Design Trends with ACP Panels in 2025",
    excerpt: "From parametric façades to sustainable cladding systems, see what’s driving façade design this year.",
    date: "2025-09-01",
  },
  {
    slug: "wpc-vs-wood",
    title: "WPC vs. Natural Wood: A Complete Guide",
    excerpt: "Understand the durability, maintenance and cost differences between Wood-Plastic Composite and natural wood.",
    date: "2025-08-15",
  },
  {
    slug: "studio-acoustics",
    title: "How to Improve Studio Acoustics with Diffusers and Absorbers",
    excerpt: "A quick primer on designing a professional-sounding recording space.",
    date: "2025-07-20",
  },
];

export default function BlogPage() {
  return (
    <section className="section container">
      <h1>Our Blog</h1>
      <p className="text-white/70 mt-2 max-w-2xl">
        Practical tips, design inspiration, and acoustic know-how.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {POSTS.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="card hover:border-gold-500 transition"
          >
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-white/60 text-sm mt-2">{post.excerpt}</p>
            <p className="text-xs text-white/40 mt-3">
              {new Date(post.date).toLocaleDateString()}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
