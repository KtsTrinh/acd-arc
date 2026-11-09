import fs from "fs";
import os from "os";
import path from "path";
import { prisma } from "./prisma";
import { isVideoUrl } from "./media-url";

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PRIVATE_STORAGE_DIR = path.join(process.cwd(), "storage", "private");

// Vercel (serverless) có filesystem read-only ngoài /tmp -> dùng thư mục tạm
const PUBLIC_UPLOAD_FALLBACK_DIR = path.join(os.tmpdir(), "acd-uploads");
const PRIVATE_STORAGE_FALLBACK_DIR = path.join(os.tmpdir(), "acd-private");

/**
 * Tạo thư mục nếu chưa có. KHÔNG được làm module-level vì trên môi trường
 * serverless (read-only) sẽ khiến toàn bộ route import module này bị lỗi 500.
 */
function ensureDir(dir: string): string {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  } catch {
    return "";
  }
}

/** Thư mục lưu file public (kèm fallback cho môi trường read-only) */
function resolvePublicDir(): string {
  return (
    ensureDir(PUBLIC_UPLOAD_DIR) || ensureDir(PUBLIC_UPLOAD_FALLBACK_DIR) || ""
  );
}

/** Thư mục lưu file private (kèm fallback cho môi trường read-only) */
function resolvePrivateDir(): string {
  return (
    ensureDir(PRIVATE_STORAGE_DIR) || ensureDir(PRIVATE_STORAGE_FALLBACK_DIR) || ""
  );
}

export interface SaveMediaInput {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url?: string;
  buffer?: Buffer;
  folder?: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Save physical file or external CDN image link into Media Library database
 */
export async function createMediaItem(input: SaveMediaInput) {
  let finalUrl = input.url;
  let storageKey = input.filename;

  // If buffer is provided, save physical file to disk
  if (input.buffer) {
    const safeName = `${Date.now()}-${input.filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadDir = resolvePublicDir();
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, input.buffer);
    finalUrl = `/uploads/${safeName}`;
    storageKey = `uploads/${safeName}`;
  }

  const media = await prisma.media.create({
    data: {
      filename: input.filename,
      originalName: input.originalName || input.filename,
      mimeType: input.mimeType || "image/jpeg",
      size: input.size || 0,
      url: finalUrl || "",
      storageKey: storageKey,
      folder: input.folder || "general",
      width: input.width || 1920,
      height: input.height || 1080,
      alt: input.alt || input.originalName || input.filename,
    },
  });

  return media;
}

export async function registerExternalMedia(url: string) {
  try {
    const existing = await prisma.media.findFirst({ where: { url } });
    if (existing) return existing;

    return createMediaItem({
      filename: url.split("/").pop()?.split("?")[0] || "media",
      originalName: "External Media",
      mimeType: isVideoUrl(url)
        ? url.includes(".webm")
          ? "video/webm"
          : "video/mp4"
        : "image/jpeg",
      size: 0,
      url,
      folder: "external",
      alt: "ACD Media",
    });
  } catch (err) {
    console.error("registerExternalMedia error:", err);
    return null;
  }
}

/**
 * Rename Media: updates filename and alt in database.
 * Because all projects and posts link to media by `mediaId`,
 * changing the filename immediately synchronizes everywhere!
 */
export async function updateMediaMetadata(
  id: string,
  data: { filename?: string; alt?: string; folder?: string }
) {
  return prisma.media.update({
    where: { id },
    data,
  });
}

/**
 * Delete Media item from DB and remove local file if applicable
 */
export async function deleteMediaItem(id: string) {
  const media = await prisma.media.findUnique({
    where: { id },
  });

  if (!media) throw new Error("Media not found");

  // If local file exists, remove it safely
  if (media.storageKey && media.storageKey.startsWith("uploads/")) {
    const filePath = path.join(process.cwd(), "public", media.storageKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn("Could not delete physical file:", err);
      }
    }
  }

  return prisma.media.delete({
    where: { id },
  });
}

/**
 * Store a private file (CAD / 3D models / templates) for paid customers
 */
export async function savePrivateProductFile(
  fileName: string,
  buffer: Buffer
): Promise<{ storageKey: string; fileSize: string }> {
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const privateDir = resolvePrivateDir();
  const filePath = path.join(privateDir, safeName);
  fs.writeFileSync(filePath, buffer);

  const sizeInMb = (buffer.length / (1024 * 1024)).toFixed(1) + " MB";
  return {
    storageKey: safeName,
    fileSize: sizeInMb,
  };
}

/**
 * Read private product file path
 * (kiểm tra cả thư mục chính và thư mục fallback cho môi trường read-only)
 */
export function getPrivateFilePath(storageKey: string): string | null {
  const candidates = [
    path.join(PRIVATE_STORAGE_DIR, storageKey),
    path.join(PRIVATE_STORAGE_FALLBACK_DIR, storageKey),
  ];

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    } catch {
      /* bỏ qua */
    }
  }

  return null;
}

