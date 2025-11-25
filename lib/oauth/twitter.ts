import { prisma } from "@/lib/db";
import crypto from "crypto";

interface TwitterTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token?: string;
}

interface TwitterUserProfile {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
}

export class TwitterOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.TWITTER_CLIENT_ID || "";
    this.clientSecret = process.env.TWITTER_CLIENT_SECRET || "";
    this.redirectUri = process.env.TWITTER_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`;
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    return { codeVerifier, codeChallenge };
  }

  /**
   * Get the authorization URL for Twitter OAuth 2.0
   */
  getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: "tweet.read tweet.write users.read offline.access",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string, codeVerifier: string): Promise<TwitterTokenResponse> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
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
  async refreshAccessToken(refreshToken: string): Promise<TwitterTokenResponse> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        client_id: this.clientId,
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
  async getUserProfile(accessToken: string): Promise<TwitterUserProfile> {
    const response = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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
    tokens: TwitterTokenResponse,
    profile: TwitterUserProfile
  ) {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.integration.upsert({
      where: {
        userId_brandId_provider: {
          userId,
          brandId,
          provider: "twitter",
        },
      },
      create: {
        userId,
        brandId,
        provider: "twitter",
        category: "publishing",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        metadata: {
          scope: tokens.scope,
          profileId: profile.data.id,
          profileName: profile.data.name,
          profileUsername: profile.data.username,
          profileImage: profile.data.profile_image_url,
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        metadata: {
          scope: tokens.scope,
          profileId: profile.data.id,
          profileName: profile.data.name,
          profileUsername: profile.data.username,
          profileImage: profile.data.profile_image_url,
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
