import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  TWO_FACTOR_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
} from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { verifyTotp } from "@/lib/totp";

export async function POST(request: Request) {
  try {
    const pendingToken = cookies().get(TWO_FACTOR_COOKIE_NAME)?.value;
    const payload = pendingToken ? verifyToken(pendingToken) : null;

    if (!payload || payload.type !== "two_factor" || !payload.userId) {
      return NextResponse.json(
        {
          error:
            "Phiên xác thực 2 lớp không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
          code: "TWO_FACTOR_SESSION_EXPIRED",
        },
        { status: 401 }
      );
    }

    const { code } = await request.json();
    const token = String(code || "").trim();

    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã 6 chữ số từ ứng dụng xác thực." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Xác thực 2 lớp chưa được bật cho tài khoản này." },
        { status: 400 }
      );
    }

    if (!verifyTotp(user.twoFactorSecret, token)) {
      return NextResponse.json(
        { error: "Mã xác thực không đúng hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, phone: true, role: true, name: true, avatar: true },
    });

    const sessionToken = createSessionToken({
      id: fullUser!.id,
      email: fullUser!.email,
      phone: fullUser!.phone,
      role: fullUser!.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: fullUser!.id,
        name: fullUser!.name,
        email: fullUser!.email,
        phone: fullUser!.phone,
        role: fullUser!.role,
        avatar: fullUser!.avatar,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, sessionToken, authCookieOptions());
    response.cookies.delete(TWO_FACTOR_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình xác thực." },
      { status: 500 }
    );
  }
}
