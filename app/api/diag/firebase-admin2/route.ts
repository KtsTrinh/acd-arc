import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { getFirebaseAdminAuth } = await import("@/lib/firebase-admin");
    const auth = getFirebaseAdminAuth();
    return NextResponse.json({ ok: true, hasAuth: !!auth });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.stack || e?.message || e).slice(0, 500) }, { status: 500 });
  }
}
