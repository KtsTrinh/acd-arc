import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
} from "@/lib/auth";
import { maskPhone, normalizePhone } from "@/lib/otp";
import { consumeVerification } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone || "");
    const code = String(body.code || "").trim();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Vui lòng nhập số điện thoại và mã xác minh." },
        { status: 400 }
      );
    }

    const result = await consumeVerification({
      identifier: phone,
      purpose: "login",
      channel: "sms",
      code,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Mã xác minh không đúng hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản với số điện thoại này." },
        { status: 404 }
      );
    }

    if (!user.phoneVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: new Date() },
      });
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
        phone: maskPhone(user.phone || ""),
        role: user.role,
        avatar: user.avatar,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());

    return response;
  } catch (error) {
    console.error("Verify phone login error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình xác minh." },
      { status: 500 }
    );
  }
}
