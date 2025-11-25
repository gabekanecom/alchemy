import { prisma } from "@/lib/db";

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
}

interface LinkedInUserProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

export class LinkedInOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || "";
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "";
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/linkedin/callback`;
  }

  /**
   * Get the authorization URL for LinkedIn OAuth
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      scope: "openid profile email w_member_social", // Permissions for posting
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<LinkedInTokenResponse> {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<LinkedInTokenResponse> {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken: string): Promise<LinkedInUserProfile> {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user profile: ${error}`);
    }

    return response.json();
  }

  /**
   * Store OAuth tokens in database
   */
  async storeTokens(
    userId: string,
    brandId: string,
    tokens: LinkedInTokenResponse,
    profile: LinkedInUserProfile
  ) {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.integration.upsert({
      where: {
        userId_brandId_provider: {
          userId,
          brandId,
          provider: "linkedin",
        },
      },
      create: {
        userId,
        brandId,
        provider: "linkedin",
        category: "publishing",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        metadata: {
          scope: tokens.scope,
          profileId: profile.sub,
          profileName: profile.name,
          profileEmail: profile.email,
          profilePicture: profile.picture,
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        metadata: {
          scope: tokens.scope,
          profileId: profile.sub,
          profileName: profile.name,
          profileEmail: profile.email,
          profilePicture: profile.picture,
        },
      },
    });
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  async ensureValidToken(integrationId: string): Promise<string> {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error("Integration not found");
    }

    // If token expires in less than 5 minutes, refresh it
    if (integration.expiresAt && integration.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
      if (!integration.refreshToken) {
        throw new Error("No refresh token available");
      }

      const tokens = await this.refreshAccessToken(integration.refreshToken);
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      await prisma.integration.update({
        where: { id: integrationId },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || integration.refreshToken,
          expiresAt,
        },
      });

      return tokens.access_token;
    }

    return integration.accessToken || "";
  }
}
