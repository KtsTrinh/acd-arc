import { NextResponse } from "next/server";
import { getCurrentUser, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Đã đăng xuất" });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

