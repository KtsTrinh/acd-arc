import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}

