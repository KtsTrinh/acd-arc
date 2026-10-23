import { NextResponse } from "next/server";
import { isOAuthProviderConfigured } from "@/lib/oauth";
import { getSmsProviderInfo } from "@/lib/sms";
import { getEmailProviderInfo } from "@/lib/email";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  const firebaseConfigured = Boolean(
    (settings.firebaseApiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
      (settings.firebaseProjectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
      (settings.firebaseAppId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
  );
  return NextResponse.json({
    google: await isOAuthProviderConfigured("google"),
    facebook: await isOAuthProviderConfigured("facebook"),
    firebase: firebaseConfigured,
    sms: (await getSmsProviderInfo()).configured,
    emailDelivery: (await getEmailProviderInfo()).configured,
  });
}
