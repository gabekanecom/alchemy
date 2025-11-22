import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Sign out
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export async function GET(request: Request) {
  // Support GET for simple logout links
  return POST(request);
}
