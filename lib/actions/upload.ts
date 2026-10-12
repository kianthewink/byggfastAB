"use server";

import { verifySession } from "../auth/dal";
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  uploadDocument,
  uploadImage,
} from "../storage";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

export async function uploadListingImageAction(
  formData: FormData
): Promise<{ url: string }> {
  await verifySession();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Ingen fil valdes.");
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Filtypen stöds inte — använd JPEG, PNG, WebP eller GIF.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Filen är för stor — max 8 MB.");
  }

  return uploadImage(file);
}

const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024; // 8MB

export async function uploadListingDocumentAction(
  formData: FormData
): Promise<{ url: string }> {
  await verifySession();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Ingen fil valdes.");
  }
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    throw new Error("Filtypen stöds inte — ladda upp en PDF.");
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("Filen är för stor — max 8 MB.");
  }

  return uploadDocument(file);
}
