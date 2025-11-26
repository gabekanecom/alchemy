import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { syncUser } from "@/lib/auth/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase!.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync user to local database
      await syncUser(
        data.user.id,
        data.user.email!,
        data.user.user_metadata?.name || data.user.user_metadata?.full_name,
        data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture
      );

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
