import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TwitterOAuth } from "@/lib/oauth/twitter";
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

    // Generate PKCE parameters
    const oauth = new TwitterOAuth();
    const { codeVerifier, codeChallenge } = oauth.generatePKCE();

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Store state, brandId, and codeVerifier in session or temporary storage
    const stateData = {
      state,
      brandId,
      userId: session.user.id,
      codeVerifier,
      timestamp: Date.now(),
    };

    // In production, store in Redis or session
    // For now, encode in the state parameter
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString("base64");

    const authUrl = oauth.getAuthorizationUrl(encodedState, codeChallenge);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Twitter OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
