import { prisma } from "@/lib/db";

interface InstagramTokenResponse {
  access_token: string;
  user_id: number;
  expires_in?: number;
}

interface InstagramLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

export class InstagramOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID!;
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET!;
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`;
  }

  /**
   * Generate Instagram OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: "user_profile,user_media",
      response_type: "code",
      state,
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for short-lived access token
   */
  async getAccessToken(code: string): Promise<InstagramTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: this.redirectUri,
      code,
    });

    const response = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Instagram access token: ${error}`);
    }

    return response.json();
  }

  /**
   * Exchange short-lived token for long-lived token (60 days)
   */
  async getLongLivedToken(shortLivedToken: string): Promise<InstagramLongLivedTokenResponse> {
    const params = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: this.clientSecret,
      access_token: shortLivedToken,
    });

    const response = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange for long-lived token: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh long-lived token (must be done before expiry)
   */
  async refreshAccessToken(accessToken: string): Promise<InstagramLongLivedTokenResponse> {
    const params = new URLSearchParams({
      grant_type: "ig_refresh_token",
      access_token: accessToken,
    });

    const response = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh Instagram token: ${error}`);
    }

    return response.json();
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken: string): Promise<InstagramUserProfile> {
    const params = new URLSearchParams({
      fields: "id,username,account_type,media_count",
      access_token: accessToken,
    });

    const response = await fetch(`https://graph.instagram.com/me?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Instagram profile: ${error}`);
    }

    return response.json();
  }

  /**
   * Store tokens in database
   */
  async storeTokens(
    userId: string,
    brandId: string,
    tokenResponse: InstagramLongLivedTokenResponse,
    profile: InstagramUserProfile
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    await prisma.integration.upsert({
      where: {
        userId_brandId_provider: {
          userId,
          brandId,
          provider: "instagram",
        },
      },
      create: {
        userId,
        brandId,
        provider: "instagram",
        status: "active",
        config: {
          accessToken: tokenResponse.access_token,
          expiresAt: expiresAt.toISOString(),
          username: profile.username,
          userId: profile.id,
          accountType: profile.account_type,
        },
      },
      update: {
        status: "active",
        config: {
          accessToken: tokenResponse.access_token,
          expiresAt: expiresAt.toISOString(),
          username: profile.username,
          userId: profile.id,
          accountType: profile.account_type,
        },
      },
    });
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async ensureValidToken(integrationId: string): Promise<string> {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    const config = integration.config as any;
    const expiresAt = new Date(config.expiresAt);
    const now = new Date();

    // Refresh if token expires within 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (expiresAt <= sevenDaysFromNow) {
      const refreshed = await this.refreshAccessToken(config.accessToken);

      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

      await prisma.integration.update({
        where: { id: integrationId },
        data: {
          config: {
            ...config,
            accessToken: refreshed.access_token,
            expiresAt: newExpiresAt.toISOString(),
          },
        },
      });

      return refreshed.access_token;
    }

    return config.accessToken;
  }
}
