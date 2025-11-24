import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";

/**
 * Get the current authenticated user from Supabase
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  // If Supabase is not configured, return null
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current user's ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return !!userId;
}

/**
 * Sync Supabase user to local Prisma database
 * This creates or updates the user record in our database
 */
export async function syncUser(supabaseUserId: string, email: string, name?: string, image?: string) {
  const user = await prisma.user.upsert({
    where: { id: supabaseUserId },
    update: {
      email,
      name: name || undefined,
      image: image || undefined,
    },
    create: {
      id: supabaseUserId,
      email,
      name: name || undefined,
      image: image || undefined,
    },
  });

  return user;
}

/**
 * Get or create user in local database from Supabase session
 */
export async function getOrCreateUser() {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    return null;
  }

  // Check if user exists in our database
  let user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  // If not, create them
  if (!user) {
    user = await syncUser(
      supabaseUser.id,
      supabaseUser.email!,
      supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture
    );
  }

  return user;
}
