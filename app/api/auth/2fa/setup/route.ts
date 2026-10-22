import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildOtpAuthUri, generateTotpSecret } from "@/lib/totp";

const ISSUER = process.env.TWO_FACTOR_ISSUER || "ACD Architecture";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thiết lập xác thực 2 lớp." },
        { status: 401 }
      );
    }

    const secret = generateTotpSecret();

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret, twoFactorType: "totp" },
    });

    const accountName = user.email || user.phone || user.id;
    const otpauthUri = buildOtpAuthUri({
      secret,
      accountName,
      issuer: ISSUER,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri, {
      width: 240,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    return NextResponse.json({
      success: true,
      secret,
      otpauthUri,
      qrCodeDataUrl,
      issuer: ISSUER,
      accountName,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Không thể khởi tạo xác thực 2 lớp." },
      { status: 500 }
    );
  }
}
