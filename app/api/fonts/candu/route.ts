import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Serves the Candu font from the app/fonts directory so it can be referenced in @font-face
export async function GET() {
  try {
    const fontPath = path.join(process.cwd(), "app", "fonts", "CanduRounded.otf");
    const data = await fs.readFile(fontPath);
    const res = new NextResponse(data, {
      headers: {
        "Content-Type": "font/otf",
        // Cache aggressively in browsers and CDNs
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
    return res;
  } catch (err) {
    return new NextResponse("Font not found", { status: 404 });
  }
}
