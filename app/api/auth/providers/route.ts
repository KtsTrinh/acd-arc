import { NextResponse } from "next/server";
import { isOAuthProviderConfigured } from "@/lib/oauth";
import { getSmsProviderInfo } from "@/lib/sms";
import { getEmailProviderInfo } from "@/lib/email";

export async function GET() {
  return NextResponse.json({
    google: await isOAuthProviderConfigured("google"),
    facebook: await isOAuthProviderConfigured("facebook"),
    sms: (await getSmsProviderInfo()).configured,
    emailDelivery: (await getEmailProviderInfo()).configured,
  });
}
