import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/app-url";
import { signToken } from "@/lib/jwt";
import { maskEmail, maskPhone, normalizePhone } from "@/lib/otp";
import { buildResetPasswordEmail, getEmailProviderInfo, sendEmail } from "@/lib/email";
import { buildOtpSms, getSmsProviderInfo, sendSms } from "@/lib/sms";
import {
  createOtpVerification,
  createTokenVerification,
} from "@/lib/verification";

const GENERIC_MESSAGE =
  "Nếu thông tin tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra email và tin nhắn của bạn.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawIdentifier = String(body.identifier || "").trim();

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: "Vui lòng nhập email hoặc số điện thoại đã đăng ký." },
        { status: 400 }
      );
    }

    const isEmail = rawIdentifier.includes("@");
    const identifier = isEmail
      ? rawIdentifier.toLowerCase()
      : normalizePhone(rawIdentifier);

    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier },
      select: { id: true, email: true, phone: true },
    });

    const delivered: string[] = [];

    if (user?.email) {
      const signedToken = signToken(
        {
          purpose: "reset_password",
          identifier: user.email,
          nonce: crypto.randomBytes(16).toString("hex"),
        },
        "30m"
      );

      await createTokenVerification({
        identifier: user.email,
        purpose: "reset_password",
        channel: "email",
        userId: user.id,
        code: signedToken,
        minutes: 30,
      });

      const link = `${getBaseUrl(request)}/reset-password?token=${encodeURIComponent(
        signedToken
      )}`;

      const email = buildResetPasswordEmail({ link, minutes: 30 });
      const sent = await sendEmail({
        to: user.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      if (sent) delivered.push(`email:${maskEmail(user.email)}`);
    }

    if (user?.phone) {
      const { code } = await createOtpVerification({
        identifier: user.phone,
        purpose: "reset_password",
        channel: "sms",
        userId: user.id,
      });

      const sent = await sendSms({
        to: user.phone,
        body: buildOtpSms({ code, purpose: "reset_password" }),
      });

      if (sent) delivered.push(`sms:${maskPhone(user.phone)}`);
    }

    if (!user) {
      console.warn(`[auth] Yêu cầu đặt lại mật khẩu cho tài khoản không tồn tại: ${maskEmail(identifier)}`);
    }

    const emailReady = (await getEmailProviderInfo()).configured;
    const smsReady = (await getSmsProviderInfo()).configured;

    return NextResponse.json({
      success: true,
      message: GENERIC_MESSAGE,
      delivered,
      channels: { email: emailReady, sms: smsReady },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
