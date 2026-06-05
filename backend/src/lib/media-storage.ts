import {
  CLOUDINARY_FOLDERS,
  isCloudinaryConfigured,
  uploadBuffer,
  uploadFile,
} from "./cloudinary.js";

export type MediaFolder = keyof typeof CLOUDINARY_FOLDERS;

function requireCloudinary(): void {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is required. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env, then restart the API.",
    );
  }
}

export async function storeImageBuffer(
  buffer: Buffer,
  folder: MediaFolder,
  format = "png",
): Promise<string> {
  requireCloudinary();
  return uploadBuffer(buffer, {
    folder: CLOUDINARY_FOLDERS[folder],
    format,
    resourceType: "image",
  });
}

export async function storeVideoFile(filePath: string): Promise<string> {
  requireCloudinary();
  return uploadFile(filePath, {
    folder: CLOUDINARY_FOLDERS.reels,
    resourceType: "video",
    format: "mp4",
  });
}
