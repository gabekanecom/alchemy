import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LinkedInOAuth } from "@/lib/oauth/linkedin";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const encodedState = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("LinkedIn OAuth error:", error, errorDescription);
      const errorUrl = new URL("/settings/integrations", request.url);
      errorUrl.searchParams.set("error", errorDescription || "OAuth authorization failed");
      return NextResponse.redirect(errorUrl);
    }

    if (!code || !encodedState) {
      return NextResponse.json(
        { error: "Missing code or state parameter" },
        { status: 400 }
      );
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(encodedState, "base64").toString());
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid state parameter" },
        { status: 400 }
      );
    }

    // Verify state matches current user
    if (stateData.userId !== session.user.id) {
      return NextResponse.json(
        { error: "State validation failed - user mismatch" },
        { status: 403 }
      );
    }

    // Verify state timestamp (not older than 10 minutes)
    const stateAge = Date.now() - stateData.timestamp;
    if (stateAge > 10 * 60 * 1000) {
      return NextResponse.json(
        { error: "State expired - please try again" },
        { status: 400 }
      );
    }

    const oauth = new LinkedInOAuth();

    // Exchange code for tokens
    const tokenResponse = await oauth.getAccessToken(code);

    // Fetch user profile
    const profile = await oauth.getUserProfile(tokenResponse.access_token);

    // Store tokens in database
    await oauth.storeTokens(
      session.user.id,
      stateData.brandId,
      tokenResponse,
      profile
    );

    // Redirect back to integrations page with success message
    const successUrl = new URL("/settings/integrations", request.url);
    successUrl.searchParams.set("success", "linkedin");
    successUrl.searchParams.set("account", profile.name);
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("LinkedIn OAuth callback error:", error);
    const errorUrl = new URL("/settings/integrations", request.url);
    errorUrl.searchParams.set("error", "Failed to complete LinkedIn authorization");
    return NextResponse.redirect(errorUrl);
  }
}
