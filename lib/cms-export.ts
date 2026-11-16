import { prisma } from "./prisma";
import { defaultSettings, type SystemSettings } from "./settings";

export const CONTENT_DIR = "content";

export interface CmsExportFile {
  path: string;
  content: string;
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function buildCmsExport(): Promise<CmsExportFile[]> {
  const [settingRows, tags, posts, products, media] = await Promise.all([
    (prisma as any).systemSetting.findMany(),
    (prisma as any).tag.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true } },
        tags: { include: { tag: true } },
      },
    }),
    (prisma as any).product.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).media.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const row of settingRows) settingsMap[row.key] = row.value ?? "";
  delete settingsMap.cmsLastSyncSha;
  delete settingsMap.cmsLastSyncAt;
  delete settingsMap.cmsAutoSync;
  for (const key of [
    "resendApiKey",
    "facebookAppSecret",
    "smsWebhookToken",
    "twilioAuthToken",
    "payosClientId",
    "payosApiKey",
    "payosChecksumKey",
    "paymentWebhookSecret",
  ]) {
    delete settingsMap[key];
  }

  const settings = { ...defaultSettings, ...settingsMap } as SystemSettings;
  const files: CmsExportFile[] = [];

  files.push({ path: `${CONTENT_DIR}/site-settings.json`, content: toJson(settings) });
  files.push({
    path: `${CONTENT_DIR}/tags.json`,
    content: toJson(tags.map((tag: any) => ({ id: tag.id, name: tag.name, slug: tag.slug }))),
  });
  files.push({
    path: `${CONTENT_DIR}/blog-posts.json`,
    content: toJson(
      posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverUrl: post.coverUrl,
        published: post.published,
        views: post.views,
        author: post.author ? { name: post.author.name, email: post.author.email } : null,
        tags: (post.tags || []).map((item: any) => item.tag?.slug).filter(Boolean),
        createdAt: post.createdAt?.toISOString?.() ?? post.createdAt,
        updatedAt: post.updatedAt?.toISOString?.() ?? post.updatedAt,
      }))
    ),
  });
  files.push({
    path: `${CONTENT_DIR}/products.json`,
    content: toJson(
      products.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        priceAfterDiscount: product.priceAfterDiscount,
        fileFormat: product.fileFormat,
        fileSize: product.fileSize,
        thumbnail: product.thumbnail,
        active: product.active,
        featured: product.featured,
        productGroup: product.productGroup,
        productCategory: product.productCategory,
      }))
    ),
  });
  files.push({
    path: `${CONTENT_DIR}/media.json`,
    content: toJson(
      media.map((item: any) => ({
        id: item.id,
        filename: item.filename,
        originalName: item.originalName,
        mimeType: item.mimeType,
        size: item.size,
        url: item.url,
        folder: item.folder,
        width: item.width,
        height: item.height,
        alt: item.alt,
      }))
    ),
  });

  return files;
}
