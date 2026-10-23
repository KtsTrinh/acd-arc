import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SIGNUP_PENDING_COOKIE_NAME,
  authCookieOptions,
  hashPassword,
} from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { isValidVietnamesePhone, maskPhone, normalizePhone } from "@/lib/otp";
import { buildOtpSms, getSmsProviderInfo, sendSms } from "@/lib/sms";
import { createOtpVerification } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone || "");
    const name = (body.name || "").trim() || null;
    const email = body.email ? String(body.email).toLowerCase().trim() : null;
    const password = body.password ? String(body.password) : null;

    if (!isValidVietnamesePhone(phone)) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam." },
        { status: 400 }
      );
    }

    if (email && !email.includes("@")) {
      return NextResponse.json(
        { error: "Email không hợp lệ." },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    const smsProvider = await getSmsProviderInfo();
    if (!smsProvider.configured) {
      return NextResponse.json(
        {
          error:
            "Dịch vụ gửi tin nhắn chưa được cấu hình. Vui lòng đăng ký bằng email hoặc liên hệ quản trị viên.",
          code: "SMS_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const existingByPhone = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (existingByPhone) {
      return NextResponse.json(
        { error: "Số điện thoại này đã được đăng ký. Vui lòng đăng nhập." },
        { status: 409 }
      );
    }

    if (email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingByEmail) {
        return NextResponse.json(
          { error: "Email này đã được sử dụng. Vui lòng đăng nhập." },
          { status: 409 }
        );
      }
    }

    const { code } = await createOtpVerification({
      identifier: phone,
      purpose: "register",
      channel: "sms",
    });

    await sendSms({
      to: phone,
      body: buildOtpSms({ code, purpose: "register" }),
    });

    const passwordHash = password ? await hashPassword(password) : null;

    const pendingToken = signToken(
      {
        type: "signup",
        phone,
        name,
        email,
        passwordHash,
      },
      "20m"
    );

    const response = NextResponse.json({
      success: true,
      requiresOtp: true,
      phone: maskPhone(phone),
      message: `Mã xác minh đã được gửi tới ${maskPhone(phone)}.`,
    });

    response.cookies.set(
      SIGNUP_PENDING_COOKIE_NAME,
      pendingToken,
      authCookieOptions(20 * 60)
    );

    return response;
  } catch (error) {
    console.error("Register phone error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình đăng ký." },
      { status: 500 }
    );
  }
}
