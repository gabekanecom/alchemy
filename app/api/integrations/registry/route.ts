// GET /api/integrations/registry - Get available providers

import { NextRequest, NextResponse } from "next/server";
import { getAllProviders, getCategorizedProviders } from "@/lib/integrations/registry";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categorized = searchParams.get("categorized") === "true";

  if (categorized) {
    const providers = getCategorizedProviders();
    return NextResponse.json({ providers });
  }

  const providers = getAllProviders();
  return NextResponse.json({ providers });
}
