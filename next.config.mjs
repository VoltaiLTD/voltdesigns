/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Nothing special needed for Edge routes with pdf-lib/qrcode.
  // (Do NOT add experimental.serverActions here — it's deprecated.)

  images: {
    // Good defaults; allows data:/blob: for inline images if you ever need them
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:;",
  },

  webpack: (config, { nextRuntime }) => {
    // For Edge runtime routes, avoid bundling node-only modules if any library tries to pull them in.
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        fs: false,
        path: false,
        canvas: false, // qrcode works without node-canvas; this prevents accidental pulls
      };
    }
    return config;
  },
};

export default nextConfig;
