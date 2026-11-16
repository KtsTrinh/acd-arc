# Cấu hình nhà cung cấp đăng nhập (ACD Architecture)

Đưa các biến sau vào môi trường (file `.env`/biến môi trường máy chủ/hosting):

- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_REDIRECT_URI`, `FACEBOOK_REDIRECT_URI`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- `TWILIO_*` hoặc `SMS_WEBHOOK_*`
- `RESEND_API_KEY` hoặc `SMTP_*`
- `MAIL_FROM`, `JWT_SECRET`

Sau khi có credential, kiểm tra trạng thái tại `/api/auth/providers`:
`{"google":true,"facebook":true,"sms":true,"emailDelivery":true}`.

## Google OAuth

1. <https://console.cloud.google.com> → tạo project → bật API **Google Identity**.
2. **APIs & Services → OAuth consent screen** → External → điền tên app, email hỗ trợ → thêm email của bạn vào *Test users*.
3. **Credentials → Create Credentials → OAuth client ID → Web application**:
   - Authorized redirect URIs: `https://acd-arc.com/api/auth/oauth/google/callback`
   - Authorized JavaScript origins: `https://acd-arc.com`
4. Lấy **Client ID** và **Client Secret** → đặt `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Facebook OAuth

1. <https://developers.facebook.com> → **My Apps → Create App → Other → Consumer**.
2. Thêm sản phẩm **Facebook Login** → **Settings → Client OAuth Settings**:
   - Valid OAuth Redirect URIs: `https://acd-arc.com/api/auth/oauth/facebook/callback`
   - Valid Domains: `acd-arc.com`
3. **App settings → Basic** → lấy **App ID** và **App Secret**.
4. Đặt `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`.

## SMS (Twilio)

1. <https://console.twilio.com> → **Phone Numbers** → lấy số gửi SMS.
2. Lấy **Account SID**, **Auth Token** và số gửi (E.164 `+84...`).
3. Đặt `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.

Nếu dùng nhà cung cấp SMS Việt Nam khác: `SMS_WEBHOOK_URL` (POST `{ phone, message, token }`) và `SMS_WEBHOOK_TOKEN`.

## Email (Resend hoặc SMTP)

**Resend** — <https://resend.com/api-keys> → `RESEND_API_KEY`.
**SMTP** — `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`.  
Đặt `MAIL_FROM` (vd. `ACD Architecture <no-reply@acd-arc.com>`).
