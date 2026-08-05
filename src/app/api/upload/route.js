import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
// base64 inflates data by ~33%, so cap the payload a bit higher
const MAX_DATA_URL_LENGTH = Math.round(MAX_FILE_BYTES * 1.4);
const ALLOWED_FOLDERS = ["rbm/avatars", "rbm/rooms"];

// POST /api/upload — authenticated image upload to Cloudinary.
// Body: { dataUrl: "data:image/...;base64,....", folder: "rbm/avatars" | "rbm/rooms" }
export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const { dataUrl, folder } = body || {};
    if (!dataUrl || typeof dataUrl !== "string") {
      return NextResponse.json(
        { success: false, message: "No image data provided" },
        { status: 400 }
      );
    }
    if (!dataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      return NextResponse.json(
        { success: false, message: "Image is too large (max 5 MB)" },
        { status: 413 }
      );
    }

    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "rbm/images";
    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: safeFolder,
      resource_type: "image",
      overwrite: false,
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Uploaded successfully",
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (error) {
    console.error("upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
