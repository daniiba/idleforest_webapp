import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACQUISITION_COOKIE, normalizeAttributionId, recordAcquisitionDownload } from "@/lib/acquisition-attribution";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const attributionId = normalizeAttributionId(cookieStore.get(ACQUISITION_COOKIE)?.value);
  if (attributionId) {
    await recordAcquisitionDownload({
      attributionId,
      platform: 'darwin',
      referrer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
    });
  }
  return NextResponse.redirect("https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip", 302);
}
