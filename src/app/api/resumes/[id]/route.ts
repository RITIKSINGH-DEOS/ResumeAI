import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getUserByClerkIdOrEnsure } from "@/server/supabase/users";

export const runtime = "nodejs";

const BUCKET = "resumes";

function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(publicUrl.slice(i + marker.length));
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const { data: appUser, error: uErr } = await getUserByClerkIdOrEnsure(userId);
  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 503 });
  }
  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: row, error: fetchErr } = await supabase
    .from("resumes")
    .select("id, user_id, file_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (row.user_id !== appUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const path = storagePathFromPublicUrl(row.file_url);
  if (path) {
    const { error: rmErr } = await supabase.storage.from(BUCKET).remove([path]);
    if (rmErr) {
      // Still remove DB row so UI stays consistent; file may need manual cleanup
      console.warn("[delete resume] storage remove:", rmErr.message);
    }
  }

  const { error: delErr } = await supabase.from("resumes").delete().eq("id", id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
