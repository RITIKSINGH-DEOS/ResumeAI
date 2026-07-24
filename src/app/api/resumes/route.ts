import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkIdOrEnsure } from "@/server/supabase/users";
import { listResumesByUserId } from "@/server/supabase/resumes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser, error: userErr } = await getUserByClerkIdOrEnsure(userId);
  if (userErr) {
    return NextResponse.json({ error: userErr.message }, { status: 503 });
  }
  if (!appUser) {
    return NextResponse.json({ resumes: [] });
  }

  const { data, error } = await listResumesByUserId(appUser.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  return NextResponse.json({ resumes: data });
}
