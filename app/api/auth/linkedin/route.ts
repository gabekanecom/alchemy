import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LinkedInOAuth } from "@/lib/oauth/linkedin";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get("brandId");

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Store state and brandId in session or temporary storage
    const stateData = {
      state,
      brandId,
      userId: session.user.id,
      timestamp: Date.now(),
    };

    // In production, store in Redis or session
    // For now, encode in the state parameter
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString("base64");

    const oauth = new LinkedInOAuth();
    const authUrl = oauth.getAuthorizationUrl(encodedState);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("LinkedIn OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
