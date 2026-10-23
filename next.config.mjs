/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "50mb" },
    serverComponentsExternalPackages: ["firebase-admin", "jwks-rsa", "jose", "google-auth-library"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("firebase-admin", "jwks-rsa", "jose", "google-auth-library");
      }
    }
    return config;
  },
};

export default nextConfig;
