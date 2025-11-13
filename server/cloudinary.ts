// Simple Cloudinary helper using unsigned upload via API key/secret server-side
import cloudinary from "cloudinary";
import { ENV } from "./_core/env";

cloudinary.v2.config({
  cloud_name: ENV.cloudinaryCloudName,
  api_key: ENV.cloudinaryApiKey,
  api_secret: ENV.cloudinaryApiSecret,
});

export async function uploadBase64Image(
  base64Data: string,
  publicId?: string
): Promise<{ url: string; public_id: string }> {
  // base64Data expected to be data:<mime>;base64,<data>
  const result = await cloudinary.v2.uploader.upload(base64Data, {
    folder: "specialists",
    public_id: publicId,
    overwrite: true,
  });
  return { url: result.secure_url, public_id: result.public_id };
}
