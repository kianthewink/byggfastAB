import "server-only";

/**
 * Storage adapter for listing images.
 *
 * - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (works on serverless).
 * - Otherwise the local disk under public/uploads, which works for local
 *   development and any self-hosted deploy with a persistent filesystem.
 *
 * Uploads are therefore always available; setting the Blob token later
 * switches providers with no code change. Existing image URLs in the
 * database are untouched either way — they're just <img src> strings.
 */

export type StorageProvider = "vercel-blob" | "local-disk";

/** Extension is derived from the validated MIME type, never the filename. */
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(EXTENSION_BY_TYPE);

export function getStorageProvider(): StorageProvider {
  return process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "local-disk";
}

/**
 * Local disk can't persist on Vercel's serverless filesystem, so warn when
 * that combination is detected rather than silently losing uploads.
 */
export function getStorageWarning(): string | null {
  if (getStorageProvider() === "local-disk" && process.env.VERCEL) {
    return "Bilder sparas på lokal disk, vilket inte är beständigt på Vercel. Sätt BLOB_READ_WRITE_TOKEN för att lagra bilder i Vercel Blob.";
  }
  return null;
}

export const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

export async function uploadImage(file: File): Promise<{ url: string }> {
  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) {
    throw new Error("Filtypen stöds inte — använd JPEG, PNG, WebP eller GIF.");
  }
  return storeFile(file, extension, "listings");
}

/** Listing documents (planritningar, produktblad) — PDF only. */
export async function uploadDocument(file: File): Promise<{ url: string }> {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    throw new Error("Filtypen stöds inte — ladda upp en PDF.");
  }
  return storeFile(file, ".pdf", "documents");
}

async function storeFile(
  file: File,
  extension: string,
  folder: "listings" | "documents"
): Promise<{ url: string }> {
  // Fully server-generated name: nothing from the client reaches the path.
  const filename = `${crypto.randomUUID()}${extension}`;

  if (getStorageProvider() === "vercel-blob") {
    // Imported lazily so the app runs without @vercel/blob credentials.
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  const { mkdir, writeFile } = await import("fs/promises");
  const path = await import("path");

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, filename),
    Buffer.from(await file.arrayBuffer())
  );

  // Served statically by Next from public/.
  return { url: `/uploads/${folder}/${filename}` };
}
