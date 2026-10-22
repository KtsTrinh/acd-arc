# Cấu hình nhà cung cấp đăng nhập (ACD Architecture)

Mọi biến dưới đây được đưa lên Vercel bằng script:

```bash
npm run auth:setup          # hỏi từng giá trị rồi tự chạy vercel env add
vercel --prod --yes --project acd-arc   # deploy lại để áp dụng
```

Sau khi có credential, kiểm tra trạng thái tại `https://acd-arc.com/api/auth/providers`:
`{"google":true,"facebook":true,"sms":true,"emailDelivery":true}`.

## Google OAuth

1. <https://console.cloud.google.com> → tạo project → bật API **Google Identity** (Google People API không bắt buộc).
2. **APIs & Services → OAuth consent screen** → External → điền tên app, email hỗ trợ → thêm email của bạn vào *Test users*.
3. **Credentials → Create Credentials → OAuth client ID → Web application**:
   - Authorized redirect URIs: `https://acd-arc.com/api/auth/oauth/google/callback`
   - Authorized JavaScript origins: `https://acd-arc.com`
4. Lấy **Client ID** và **Client Secret** → nhập vào script (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

## Facebook OAuth

1. <https://developers.facebook.com> → **My Apps → Create App → Other → Consumer**.
2. Thêm sản phẩm **Facebook Login** → **Settings → Client OAuth Settings**:
   - Valid OAuth Redirect URIs: `https://acd-arc.com/api/auth/oauth/facebook/callback`
   - Valid Domains: `acd-arc.com`
3. **App settings → Basic** → lấy **App ID** và **App Secret** (bấm *Show*).
4. Nhập vào script (`FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`).

## SMS (Twilio)

1. <https://console.twilio.com> → tạo trial account → **Phone Numbers** → lấy số có năng lực gửi SMS.
2. Lấy **Account SID**, **Auth Token** và số gửi ở định dạng E.164 (`+84...`).
3. Nhập vào script (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`).

Nếu dùng nhà cung cấp SMS Việt Nam khác, đặt `SMS_WEBHOOK_URL` (POST `{ phone, message, token }`) và `SMS_WEBHOOK_TOKEN`.

## Email (Resend hoặc SMTP)

**Resend** — <https://resend.com/api-keys> → tạo key → `RESEND_API_KEY`.
Nên thêm domain `acd-arc.com` trong Resend (DNS MX/TXT) để gửi từ `no-reply@acd-arc.com`; nếu chưa thêm domain thì dùng địa chỉ onboarding của Resend.

**SMTP** — `SMTP_HOST`, `SMTP_PORT` (mặc định 587), `SMTP_SECURE` (`true` khi port 465), `SMTP_USER`, `SMTP_PASS`.

`MAIL_FROM` đã được đặt sẵn trên Vercel: `ACD Architecture <no-reply@acd-arc.com>`.

## Biến đã cấu hình sẵn trên Vercel

| Biến | Giá trị |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://acd-arc.com` |
| `GOOGLE_REDIRECT_URI` | `https://acd-arc.com/api/auth/oauth/google/callback` |
| `FACEBOOK_REDIRECT_URI` | `https://acd-arc.com/api/auth/oauth/facebook/callback` |
| `MAIL_FROM` | `ACD Architecture <no-reply@acd-arc.com>` |
| `MAIL_FROM_NAME` | `ACD Architecture` |
| `TWO_FACTOR_ISSUER` | `ACD Architecture` |
| `JWT_SECRET` | đã sinh mới (64 ký tự ngẫu nhiên) |
