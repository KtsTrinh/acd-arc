import { NextResponse } from "next/server";
import {
  createOAuthState,
  getOAuthProviderConfig,
  getOAuthRedirectUri,
  getSafeRedirectPath,
  isOAuthProvider,
} from "@/lib/oauth";
import { getBaseUrl } from "@/lib/app-url";

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const provider = (params.provider || "").toLowerCase();

  if (!isOAuthProvider(provider)) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_provider", request.url)
    );
  }

  const config = await getOAuthProviderConfig(provider);
  if (!config) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_not_configured", request.url)
    );
  }

  const redirectUri = await getOAuthRedirectUri(provider, getBaseUrl(request));
  const from = getSafeRedirectPath(new URL(request.url).searchParams.get("from"));

  const authorizeUrl = new URL(config.authorizeUrl);
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", config.scope);
  authorizeUrl.searchParams.set("state", createOAuthState(provider, from));
  authorizeUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(authorizeUrl.toString());
}
