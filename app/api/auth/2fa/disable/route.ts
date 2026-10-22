import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, getCurrentUser } from "@/lib/auth";
import { verifyTotp } from "@/lib/totp";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thay đổi xác thực 2 lớp." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const code = String(body.code || "").trim();
    const password = String(body.password || "");

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, passwordHash: true },
    });

    let valid = false;

    if (code && record?.twoFactorSecret) {
      valid = verifyTotp(record.twoFactorSecret, code);
    }

    if (!valid && password && record?.passwordHash) {
      valid = await comparePassword(password, record.passwordHash);
    }

    if (!valid) {
      return NextResponse.json(
        {
          error:
            "Cần mã xác thực 2 lớp hợp lệ hoặc mật khẩu hiện tại để tắt bảo mật này.",
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorType: null },
    });

    return NextResponse.json({
      success: true,
      message: "Đã tắt xác thực 2 lớp cho tài khoản của bạn.",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Không thể tắt xác thực 2 lớp." },
      { status: 500 }
    );
  }
}
