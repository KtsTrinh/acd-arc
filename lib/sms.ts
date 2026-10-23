import { getSettings } from "./settings";

export interface SmsMessage {
  to: string;
  body: string;
}

export interface SmsProviderInfo {
  configured: boolean;
  provider: string;
}

export async function getSmsProviderInfo(): Promise<SmsProviderInfo> {
  const settings = await getSettings();
  if (settings.twilioAccountSid && settings.twilioAuthToken) {
    return { configured: true, provider: "twilio" };
  }
  if (
    settings.smsWebhookUrl ||
    process.env.SMS_WEBHOOK_URL ||
    process.env.TWILIO_ACCOUNT_SID
  ) {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      return { configured: true, provider: "twilio" };
    }
    if (settings.smsWebhookUrl || process.env.SMS_WEBHOOK_URL) {
      return { configured: true, provider: "webhook" };
    }
  }
  return { configured: false, provider: "none" };
}

async function sendViaTwilio(message: SmsMessage) {
  const settings = await getSettings();
  const accountSid = settings.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = settings.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
  const from = settings.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER;

  const body = new URLSearchParams({
    To: message.to,
    From: from || "",
    Body: message.body,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString(
          "base64"
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Twilio lỗi ${response.status}: ${(await response.text()).slice(0, 200)}`
    );
  }
}

async function sendViaWebhook(message: SmsMessage) {
  const settings = await getSettings();
  const url = settings.smsWebhookUrl || process.env.SMS_WEBHOOK_URL;
  const token = settings.smsWebhookToken || process.env.SMS_WEBHOOK_TOKEN;

  const response = await fetch(url!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      phone: message.to,
      message: message.body,
      token,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `SMS webhook lỗi ${response.status}: ${(await response.text()).slice(0, 200)}`
    );
  }
}

export async function sendSms(message: SmsMessage): Promise<boolean> {
  const info = await getSmsProviderInfo();
  if (!info.configured) {
    console.warn(`[sms] Chưa cấu hình dịch vụ gửi SMS. Bỏ qua gửi tới ${message.to}`);
    return false;
  }

  try {
    const settings = await getSettings();
    const useTwilio =
      info.provider === "twilio" ||
      (settings.twilioAccountSid && settings.twilioAuthToken) ||
      (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

    if (useTwilio) {
      await sendViaTwilio(message);
    } else {
      await sendViaWebhook(message);
    }
    console.log(`[sms] Đã gửi tới ${message.to}`);
    return true;
  } catch (error) {
    console.error("[sms] Gửi thất bại:", error);
    return false;
  }
}

export function buildOtpSms(params: {
  code: string;
  purpose: "register" | "login" | "reset_password" | "two_factor";
  minutes?: number;
}): string {
  const minutes = params.minutes ?? 10;
  const labels = {
    register: "Mã xác minh đăng ký ACD",
    login: "Mã đăng nhập ACD",
    reset_password: "Mã đặt lại mật khẩu ACD",
    two_factor: "Mã xác thực 2 lớp ACD",
  };
  return `${labels[params.purpose]}: ${params.code}. Hết hạn sau ${minutes} phút. Không chia sẻ mã này.`;
}
