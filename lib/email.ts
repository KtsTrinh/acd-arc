import nodemailer from "nodemailer";
import { getSettings } from "./settings";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProviderInfo {
  configured: boolean;
  provider: string;
}

export async function getEmailProviderInfo(): Promise<EmailProviderInfo> {
  const settings = await getSettings();
  const resendKey = settings.resendApiKey || process.env.RESEND_API_KEY;
  if (resendKey) return { configured: true, provider: "resend" };
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return { configured: true, provider: "smtp" };
  }
  return { configured: false, provider: "none" };
}

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
        }
      : undefined,
  });
}

async function sendViaResend(message: EmailMessage) {
  const settings = await getSettings();
  const resendKey = settings.resendApiKey || process.env.RESEND_API_KEY;
  const from =
    settings.emailFrom ||
    process.env.MAIL_FROM ||
    "ACD Architecture <no-reply@acd.vn>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Resend lỗi ${response.status}: ${(await response.text()).slice(0, 200)}`
    );
  }
}

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const info = await getEmailProviderInfo();
  if (!info.configured) {
    console.warn(
      `[email] Chưa cấu hình dịch vụ gửi email. Bỏ qua gửi tới ${message.to}`
    );
    return false;
  }

  try {
    if (info.provider === "resend") {
      await sendViaResend(message);
    } else {
      const transport = buildTransport();
      const settings = await getSettings();
      const from =
        settings.emailFrom ||
        process.env.MAIL_FROM ||
        "ACD Architecture <no-reply@acd.vn>";
      await transport!.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
    }
    console.log(`[email] Đã gửi "${message.subject}" tới ${message.to}`);
    return true;
  } catch (error) {
    console.error("[email] Gửi thất bại:", error);
    return false;
  }
}

function layout(title: string, body: string, actionLabel?: string, actionUrl?: string) {
  return `<!doctype html>
<html lang="vi">
  <body style="margin:0;padding:0;background:#0b1220;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:32px 16px;">
      <tr><td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111c2e;border:1px solid #1e2d45;border-radius:16px;overflow:hidden;">
          <tr><td style="padding:28px 32px 8px;">
            <div style="color:#22d3ee;font-weight:800;font-size:18px;letter-spacing:2px;">ACD ARCHITECTURE</div>
            <h1 style="color:#f8fafc;font-size:20px;margin:12px 0 0;">${title}</h1>
          </td></tr>
          <tr><td style="padding:8px 32px 28px;color:#cbd5e1;font-size:14px;line-height:1.7;">
            ${body}
            ${
              actionLabel && actionUrl
                ? `<div style="margin:26px 0;"><a href="${actionUrl}" style="display:inline-block;background:#22d3ee;color:#04212b;font-weight:700;padding:12px 22px;border-radius:10px;text-decoration:none;">${actionLabel}</a></div>`
                : ""
            }
            <p style="color:#64748b;font-size:12px;margin-top:24px;">
              Nếu bạn không yêu cầu hành động này, hãy bỏ qua email này.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function buildOtpEmail(params: {
  code: string;
  purpose: "register" | "reset_password" | "two_factor";
  minutes?: number;
}): { subject: string; html: string; text: string } {
  const minutes = params.minutes ?? 10;
  const titles = {
    register: "Mã xác minh đăng ký",
    reset_password: "Mã đặt lại mật khẩu",
    two_factor: "Mã xác thực 2 lớp",
  };
  const subject = `${titles[params.purpose]} - ${params.code}`;

  return {
    subject,
    html: layout(
      titles[params.purpose],
      `<p>Mã xác minh của bạn là:</p>
       <p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#22d3ee;margin:16px 0;">${params.code}</p>
       <p>Mã có hiệu lực trong <b>${minutes} phút</b> và chỉ dùng được một lần.</p>`,
    ),
    text: `${titles[params.purpose]}: mã của bạn là ${params.code}. Hiệu lực ${minutes} phút.`,
  };
}

export function buildResetPasswordEmail(params: {
  link: string;
  minutes?: number;
}): { subject: string; html: string; text: string } {
  const minutes = params.minutes ?? 30;
  return {
    subject: "Đặt lại mật khẩu - ACD Architecture",
    html: layout(
      "Đặt lại mật khẩu",
      `<p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực trong <b>${minutes} phút</b>.</p>`,
      "Đặt lại mật khẩu",
      params.link
    ),
    text: `Đặt lại mật khẩu: ${params.link} (hết hạn sau ${minutes} phút)`,
  };
}
