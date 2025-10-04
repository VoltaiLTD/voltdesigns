/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,


  images: {

    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:;",
  },

  webpack: (config, { nextRuntime }) => {

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
