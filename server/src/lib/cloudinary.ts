import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_OPTIONS = { timeout: 120000 }; // 2 minutes for slow connections

export async function uploadStream(stream: NodeJS.ReadableStream, folder: string) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, ...UPLOAD_OPTIONS },
      (err, result) => (err ? reject(err) : resolve(result!))
    );
    stream.pipe(upload);
  });
}

export async function uploadBuffer(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, ...UPLOAD_OPTIONS },
      (err, result) => (err ? reject(err) : resolve(result!))
    );
    stream.write(buffer);
    stream.end();
  });
}

export { cloudinary };
