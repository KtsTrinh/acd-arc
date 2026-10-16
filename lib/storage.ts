import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PRIVATE_STORAGE_DIR = path.join(process.cwd(), "storage", "private");

// Ensure directories exist
if (!fs.existsSync(PUBLIC_UPLOAD_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(PRIVATE_STORAGE_DIR)) {
  fs.mkdirSync(PRIVATE_STORAGE_DIR, { recursive: true });
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
    const filePath = path.join(PUBLIC_UPLOAD_DIR, safeName);
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
  const filePath = path.join(PRIVATE_STORAGE_DIR, safeName);
  fs.writeFileSync(filePath, buffer);

  const sizeInMb = (buffer.length / (1024 * 1024)).toFixed(1) + " MB";
  return {
    storageKey: safeName,
    fileSize: sizeInMb,
  };
}

/**
 * Read private product file path
 */
export function getPrivateFilePath(storageKey: string): string | null {
  const filePath = path.join(PRIVATE_STORAGE_DIR, storageKey);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

