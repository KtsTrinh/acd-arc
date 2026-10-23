import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, SIGNUP_PENDING_COOKIE_NAME, authCookieOptions } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { createOtpVerification } from "@/lib/verification";
import { sendEmail, buildOtpEmail } from "@/lib/email";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: "Email không hợp lệ. Vui lòng nhập địa chỉ email đúng (ví dụ: name@gmail.com)." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng. Vui lòng đăng nhập." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { code } = await createOtpVerification({
      identifier: cleanEmail,
      purpose: "register",
      channel: "email",
    });

    const otpEmail = buildOtpEmail({ code, purpose: "register", minutes: 10 });
    await sendEmail({
      to: cleanEmail,
      subject: otpEmail.subject,
      html: otpEmail.html,
      text: otpEmail.text,
    });

    const pendingToken = signToken(
      {
        type: "signup",
        email: cleanEmail,
        name,
        passwordHash,
      },
      "20m"
    );

    const response = NextResponse.json({
      success: true,
      requiresOtp: true,
      email: cleanEmail,
      message: `Mã xác minh đã được gửi tới ${cleanEmail}. Vui lòng kiểm tra hộp thư (cả mục Spam).`,
    });

    response.cookies.set(
      SIGNUP_PENDING_COOKIE_NAME,
      pendingToken,
      authCookieOptions(20 * 60)
    );

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình đăng ký." },
      { status: 500 }
    );
  }
}
