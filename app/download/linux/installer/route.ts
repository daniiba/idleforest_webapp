import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACQUISITION_COOKIE, normalizeAttributionId, recordAcquisitionDownloadBestEffort } from "@/lib/acquisition-attribution";
import { isSpeculativeNavigation } from "@/lib/download-request";

const linuxInstallerUrl = "https://idleforest-updates.s3.us-east-1.amazonaws.com/updates/linux/x64/idle-forest.deb";

export async function GET(request: Request) {
  if (isSpeculativeNavigation(request)) {
    return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }

  const cookieStore = await cookies();
  const attributionId = normalizeAttributionId(cookieStore.get(ACQUISITION_COOKIE)?.value);
  if (attributionId) {
    await recordAcquisitionDownloadBestEffort({
      attributionId,
      platform: 'linux',
      referrer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
    });
  }

  return NextResponse.redirect(linuxInstallerUrl, 302);
}
