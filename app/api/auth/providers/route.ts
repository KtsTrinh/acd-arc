import { NextResponse } from "next/server";
import { isOAuthProviderConfigured } from "@/lib/oauth";
import { getSmsProviderInfo } from "@/lib/sms";
import { getEmailProviderInfo } from "@/lib/email";

export async function GET() {
  return NextResponse.json({
    google: isOAuthProviderConfigured("google"),
    facebook: isOAuthProviderConfigured("facebook"),
    sms: getSmsProviderInfo().configured,
    emailDelivery: getEmailProviderInfo().configured,
  });
}
