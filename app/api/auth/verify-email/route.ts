import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  SIGNUP_PENDING_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
} from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { consumeVerification } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const code = String(body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Vui lòng nhập email và mã xác minh." },
        { status: 400 }
      );
    }

    const pendingToken = cookies().get(SIGNUP_PENDING_COOKIE_NAME)?.value;
    const pending = pendingToken ? verifyToken(pendingToken) : null;

    if (
      !pending ||
      pending.type !== "signup" ||
      String(pending.email || "").toLowerCase() !== email
    ) {
      return NextResponse.json(
        {
          error:
            "Phiên đăng ký đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu mã xác minh lại.",
          code: "SIGNUP_SESSION_EXPIRED",
        },
        { status: 400 }
      );
    }

    const result = await consumeVerification({
      identifier: email,
      purpose: "register",
      channel: "email",
      code,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Mã xác minh không đúng hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng. Vui lòng đăng nhập." },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        role: "USER",
        provider: "local",
        name: pending.name ? String(pending.name) : null,
        email,
        passwordHash: pending.passwordHash ? String(pending.passwordHash) : null,
        emailVerified: new Date(),
      },
    });

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
    response.cookies.delete(SIGNUP_PENDING_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình xác minh." },
      { status: 500 }
    );
  }
}
