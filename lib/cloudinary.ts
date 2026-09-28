import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/lib/env';

let configured = false;
export function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export async function uploadEventImage(buffer: Buffer, filename?: string) {
  const cld = getCloudinary();
  return await new Promise<{ url: string; width: number; height: number }>((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder: 'serenart/events',
        resource_type: 'image',
        filename_override: filename,
        use_filename: Boolean(filename),
        unique_filename: !filename,
        overwrite: false,
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Upload failed'));
        resolve({ url: result.secure_url, width: result.width!, height: result.height! });
      },
    );
    stream.end(buffer);
  });
}
