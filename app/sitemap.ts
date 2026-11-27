import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/app-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const entries: MetadataRoute.Sitemap = [{ url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 }];

  try {
    const products = await (prisma as any).product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });
    for (const p of products) {
      if (!p.slug) continue;
      entries.push({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt || new Date(), changeFrequency: "weekly", priority: 0.8 });
    }
  } catch {}

  try {
    const groups = await (prisma as any).product.groupBy({ by: ["productGroup"], where: { active: true, productGroup: { not: null } } });
    for (const g of groups) {
      if (!g.productGroup) continue;
      entries.push({ url: `${base}/products?productGroup=${encodeURIComponent(g.productGroup)}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 });
    }
  } catch {}

  entries.push({ url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 });
  entries.push({ url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 });
  return entries;
}

