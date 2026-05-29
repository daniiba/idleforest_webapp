import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/#impact", request.url), 302);
}
