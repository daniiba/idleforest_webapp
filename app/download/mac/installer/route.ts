import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect("https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip", 302);
}
