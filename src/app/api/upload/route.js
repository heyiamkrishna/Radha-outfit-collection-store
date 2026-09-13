import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { verifyAdmin } from "@/lib/adminAuth";

export async function POST(req) {
  // Check admin authorization
  const auth = await verifyAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Admin privilege required to upload assets." },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Convert file to base64 buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If ImageKit credentials exist in .env.local, upload via ImageKit
    if (
      process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PUBLIC_KEY !== "your_public_key_here" &&
      process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY !== "your_private_key_here"
    ) {
      const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      });

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `roc-${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
        folder: "/products",
      });

      return NextResponse.json({
        success: true,
        url: uploadResponse.url,
      });
    }

    // Fallback if ImageKit keys are not yet configured: data URI for immediate testing
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;
    return NextResponse.json({
      success: true,
      url: base64Data,
    });
  } catch (err) {
    console.error("Asset upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}