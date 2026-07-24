import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPremiumPublicMetadata, userPlanFromClerkMetadata } from "@/lib/clerkPremium";
import { compressPdf } from "@/lib/compressPdf";
import { FREE_PLAN_MAX_RESUMES } from "@/lib/planLimits";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { upsertUserByClerkId } from "@/server/supabase/users";
import { countResumesByUserId, insertResumeRow } from "@/server/supabase/resumes";

export const runtime = "nodejs";

const BUCKET = "resumes";
const MAX_BYTES = 10 * 1024 * 1024;

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "resume.pdf";
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY for uploads" },
      { status: 503 }
    );
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const name =
    user.fullName ??
    [user.firstName, user.lastName].filter(Boolean).join(" ") ??
    user.username ??
    "";

  const meta = user.publicMetadata as Record<string, unknown> | undefined;
  const plan = userPlanFromClerkMetadata(meta);

  const { data: appUser, error: upsertErr } = await upsertUserByClerkId(userId, email, name, plan);
  if (upsertErr || !appUser) {
    return NextResponse.json({ error: upsertErr?.message ?? "User sync failed" }, { status: 503 });
  }

  const isPro = isPremiumPublicMetadata(meta);
  if (!isPro) {
    const { count, error: cntErr } = await countResumesByUserId(appUser.id);
    if (cntErr) {
      return NextResponse.json({ error: cntErr.message }, { status: 503 });
    }
    if (count >= FREE_PLAN_MAX_RESUMES) {
      return NextResponse.json(
        {
          error: `Free plan allows up to ${FREE_PLAN_MAX_RESUMES} resumes. Delete one or upgrade to Pro.`,
          code: "FREE_RESUME_LIMIT",
        },
        { status: 403 }
      );
    }
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const type = file.type;
  if (type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "PDF only" }, { status: 400 });
  }

  const path = `${appUser.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const raw = Buffer.from(await file.arrayBuffer());
  const buf = await compressPdf(raw);

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: resume, error: insErr } = await insertResumeRow({
    userId: appUser.id,
    fileUrl: publicUrl,
  });

  if (insErr || !resume) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: insErr?.message ?? "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ resume });
}
