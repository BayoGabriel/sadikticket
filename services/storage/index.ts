import { env } from "@/lib/env";
import { ApiError } from "@/lib/errors";

// Storage abstraction. Cloudinary is the active provider (already used for
// event cover images); swap `provider` internals to move to Vercel Blob etc.
export type StoredUpload = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  resourceType: "image" | "video";
};

export interface StorageProvider {
  upload(input: {
    buffer: Buffer;
    filename: string;
    folder: string;
    resourceType: "image" | "video";
  }): Promise<StoredUpload>;
  remove(publicId: string, resourceType: "image" | "video"): Promise<void>;
}

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function assertConfigured() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET)
    throw new ApiError(
      "STORAGE_NOT_CONFIGURED",
      "Image storage isn't set up yet — add the Cloudinary keys to .env",
      503,
    );
}

const cloudinaryProvider: StorageProvider = {
  async upload({ buffer, filename, folder, resourceType }) {
    assertConfigured();
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: filename.replace(/\.[^.]+$/, ""),
          ...(resourceType === "image"
            ? { transformation: [{ quality: "auto", fetch_format: "auto" }] }
            : {}),
        },
        (err, res) => (err || !res ? reject(err ?? new Error("upload failed")) : resolve(res as Record<string, unknown>)),
      );
      stream.end(buffer);
    });
    return {
      url: String(result.secure_url),
      publicId: String(result.public_id),
      width: result.width as number | undefined,
      height: result.height as number | undefined,
      bytes: result.bytes as number | undefined,
      duration: result.duration as number | undefined,
      resourceType,
    };
  },

  async remove(publicId, resourceType) {
    assertConfigured();
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  },
};

export const storage: StorageProvider = cloudinaryProvider;

export function validateUploadSize(kind: "image" | "video", bytes: number) {
  const max = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (bytes > max)
    throw new ApiError(
      "FILE_TOO_LARGE",
      kind === "image" ? "That image is over 15MB." : "That video is over 100MB.",
      413,
    );
}
