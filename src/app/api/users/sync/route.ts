import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureUserRowFromClerk } from "@/server/supabase/users";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await ensureUserRowFromClerk(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  return NextResponse.json({ user: data });
}
