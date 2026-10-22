import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { normalizePhone } from "@/lib/otp";
import { consumeVerification } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password || "");
    const token = body.token ? String(body.token) : null;
    const phone = body.phone ? normalizePhone(String(body.phone)) : null;
    const code = body.code ? String(body.code).trim() : null;

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    let identifier: string | null = null;
    let channel: "email" | "sms" | null = null;
    let verificationCode: string | null = null;

    if (token) {
      const payload = verifyToken(token);
      if (!payload || payload.purpose !== "reset_password" || !payload.identifier) {
        return NextResponse.json(
          { error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." },
          { status: 400 }
        );
      }
      identifier = String(payload.identifier);
      channel = "email";
      verificationCode = token;
    } else if (phone && code) {
      identifier = phone;
      channel = "sms";
      verificationCode = code;
    }

    if (!identifier || !channel || !verificationCode) {
      return NextResponse.json(
        { error: "Thiếu mã xác minh để đặt lại mật khẩu." },
        { status: 400 }
      );
    }

    const result = await consumeVerification({
      identifier,
      purpose: "reset_password",
      channel,
      code: verificationCode,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Mã xác minh không đúng hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: channel === "email" ? { email: identifier } : { phone: identifier },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản tương ứng." },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password) },
    });

    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
