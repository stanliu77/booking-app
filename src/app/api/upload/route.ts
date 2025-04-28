import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary"; // ✅ 引入 cloudinary 上传函数
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  // 把文件内容读成 buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // 生成一个随机的临时文件名
  const tempFilename = `/tmp/${Date.now()}-${randomUUID()}-${file.name}`;

  // 调用上传到 Cloudinary
  const result = await uploadImage(tempFilename, buffer);

  // 返回 Cloudinary 地址
  return NextResponse.json({ url: result.secure_url });
}
