import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidVietnamesePhone, maskPhone, normalizePhone } from "@/lib/otp";
import { buildOtpSms, getSmsProviderInfo, sendSms } from "@/lib/sms";
import { createOtpVerification } from "@/lib/verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone || "");

    if (!isValidVietnamesePhone(phone)) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ." },
        { status: 400 }
      );
    }

    const smsProvider = getSmsProviderInfo();
    if (!smsProvider.configured) {
      return NextResponse.json(
        {
          error:
            "Dịch vụ gửi tin nhắn chưa được cấu hình. Vui lòng đăng nhập bằng email.",
          code: "SMS_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, phoneVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Số điện thoại chưa được đăng ký. Vui lòng đăng ký tài khoản mới.",
          code: "PHONE_NOT_REGISTERED",
        },
        { status: 404 }
      );
    }

    const { code } = await createOtpVerification({
      identifier: phone,
      purpose: "login",
      channel: "sms",
      userId: user.id,
    });

    await sendSms({
      to: phone,
      body: buildOtpSms({ code, purpose: "login" }),
    });

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      phone: maskPhone(phone),
      message: `Mã đăng nhập đã được gửi tới ${maskPhone(phone)}.`,
    });
  } catch (error) {
    console.error("Login phone error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình đăng nhập." },
      { status: 500 }
    );
  }
}
