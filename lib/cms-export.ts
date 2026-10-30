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

/**
 * Gom toàn bộ nội dung quản trị CMS (ngoại trừ dữ liệu nhạy cảm: user, order,
 * download token, fileKey sản phẩm) thành các file JSON trong thư mục
 * `content/` để commit lên GitHub.
 */
export async function buildCmsExport(): Promise<CmsExportFile[]> {
  const [
    settingRows,
    categories,
    tags,
    projects,
    posts,
    products,
    media,
  ] = await Promise.all([
    prisma.systemSetting.findMany(),
    prisma.projectCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: true } } },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        cover: true,
        tags: { include: { tag: true } },
        gallery: {
          orderBy: { sortOrder: "asc" },
          include: { media: true },
        },
      },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const row of settingRows) {
    settingsMap[row.key] = row.value ?? "";
  }
  // Loại metadata nội bộ của quá trình đồng bộ để tránh sinh commit vô ích
  delete settingsMap.cmsLastSyncSha;
  delete settingsMap.cmsLastSyncAt;
  delete settingsMap.cmsAutoSync;

  // Loại các secret tích hợp (không được commit lên repo công khai)
  const SECRET_KEYS = [
    "resendApiKey",
    "facebookAppSecret",
    "smsWebhookToken",
    "twilioAuthToken",
  ];
  for (const key of SECRET_KEYS) {
    delete settingsMap[key];
  }

  const settings = {
    ...defaultSettings,
    ...settingsMap,
  } as SystemSettings;

  const files: CmsExportFile[] = [];

  files.push({
    path: `${CONTENT_DIR}/site-settings.json`,
    content: toJson(settings),
  });

  files.push({
    path: `${CONTENT_DIR}/project-categories.json`,
    content: toJson(
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        projectCount: category._count?.projects ?? undefined,
      }))
    ),
  });

  files.push({
    path: `${CONTENT_DIR}/tags.json`,
    content: toJson(
      tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      }))
    ),
  });

  files.push({
    path: `${CONTENT_DIR}/projects.json`,
    content: toJson(
      projects.map((project) => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        shortDesc: project.shortDesc,
        description: project.description,
        location: project.location,
        client: project.client,
        year: project.year,
        area: project.area,
        style: project.style,
        buildingType: project.buildingType,
        isFeatured: project.isFeatured,
        category: project.category
          ? { slug: project.category.slug, name: project.category.name }
          : null,
        cover: project.cover
          ? {
              filename: project.cover.filename,
              url: project.cover.url,
              alt: project.cover.alt,
            }
          : null,
        gallery: project.gallery.map((item) => ({
          filename: item.media.filename,
          url: item.media.url,
          alt: item.media.alt,
          sortOrder: item.sortOrder,
        })),
        tags: project.tags.map((item) => item.tag.slug),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }))
    ),
  });

  files.push({
    path: `${CONTENT_DIR}/blog-posts.json`,
    content: toJson(
      posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverUrl: post.coverUrl,
        published: post.published,
        views: post.views,
        author: post.author
          ? { name: post.author.name, email: post.author.email }
          : null,
        tags: post.tags.map((item) => item.tag.slug),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }))
    ),
  });

  files.push({
    path: `${CONTENT_DIR}/products.json`,
    content: toJson(
      products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        fileFormat: product.fileFormat,
        fileSize: product.fileSize,
        thumbnail: product.thumbnail,
        active: product.active,
        featured: product.featured,
      }))
    ),
  });

  files.push({
    path: `${CONTENT_DIR}/media.json`,
    content: toJson(
      media.map((item) => ({
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
