import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(req: NextRequest) {
  const { publicId } = await req.json();
  console.log(publicId);
  if (!publicId) {
    return NextResponse.json(
      { success: false, error: "Missing publicId" },
      { status: 400 }
    );
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result === "ok") {
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json(
        { success: false, error: result.result },
        { status: 400 }
      );
    }
  } catch (err) {
    console.log(err);
    console.error("Cloudinary delete error:", err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
