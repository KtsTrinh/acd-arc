import fs from "fs";
import path from "path";

const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "50mb" } },
  async redirects() {
    try {
      const file = path.join(process.cwd(), "redirects.json");
      const raw = fs.readFileSync(file, "utf8");
      const data = JSON.parse(raw);
      return (data.redirects || []).map((r) => ({
        source: r.source,
        destination: r.destination,
        permanent: r.permanent !== false,
        has: r.has,
      }));
    } catch {
      return [];
    }
  },
};

export default nextConfig;
