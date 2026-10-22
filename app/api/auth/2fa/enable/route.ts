import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyTotp } from "@/lib/totp";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thiết lập xác thực 2 lớp." },
        { status: 401 }
      );
    }

    const { code } = await request.json();
    const token = String(code || "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã 6 chữ số từ ứng dụng xác thực." },
        { status: 400 }
      );
    }

    const secret = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true },
    });

    if (!secret?.twoFactorSecret) {
      return NextResponse.json(
        { error: "Chưa khởi tạo mã bí mật. Vui lòng bắt đầu lại quy trình thiết lập." },
        { status: 400 }
      );
    }

    if (!verifyTotp(secret.twoFactorSecret, token)) {
      return NextResponse.json(
        { error: "Mã xác thực không đúng hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true, twoFactorType: "totp" },
    });

    return NextResponse.json({
      success: true,
      message: "Đã bật xác thực 2 lớp cho tài khoản của bạn.",
    });
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json(
      { error: "Không thể bật xác thực 2 lớp." },
      { status: 500 }
    );
  }
}
