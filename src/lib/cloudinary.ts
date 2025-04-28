import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ 改成支持直接上传 Buffer
export async function uploadImage(filename: string, buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "booking-app", // 文件夹
        public_id: filename,    // 用我们的随机文件名
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      }
    );

    stream.end(buffer);
  });
}
