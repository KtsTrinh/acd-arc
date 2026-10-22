import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  TWO_FACTOR_COOKIE_NAME,
  authCookieOptions,
  comparePassword,
  createSessionToken,
  createTwoFactorToken,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ email và mật khẩu." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const pendingToken = createTwoFactorToken({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        twoFactorRequired: true,
        message:
          "Vui lòng nhập mã 6 chữ số từ ứng dụng xác thực để hoàn tất đăng nhập.",
      });

      response.cookies.set(
        TWO_FACTOR_COOKIE_NAME,
        pendingToken,
        authCookieOptions(10 * 60)
      );

      return response;
    }

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

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình đăng nhập." },
      { status: 500 }
    );
  }
}
