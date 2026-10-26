import { NextResponse } from "next/server";
import {
  exchangeOAuthCode,
  fetchOAuthProfile,
  getOAuthRedirectUri,
  getSafeRedirectPath,
  isOAuthProvider,
  verifyOAuthState,
} from "@/lib/oauth";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
  provisionOAuthUser,
} from "@/lib/auth";
import { getBaseUrl } from "@/lib/app-url";

function fail(request: Request, reason: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const provider = (params.provider || "").toLowerCase();

  if (!isOAuthProvider(provider)) {
    return fail(request, "oauth_provider");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return fail(request, "oauth_cancelled");
  }

  if (!code || !state) {
    return fail(request, "oauth_missing_code");
  }

  if (!verifyOAuthState(state, provider)) {
    return fail(request, "oauth_invalid_state");
  }

  const statePayload = verifyOAuthState(state, provider);
  const redirectAfterLogin = getSafeRedirectPath(statePayload?.from);

  try {
    const redirectUri = await getOAuthRedirectUri(provider, getBaseUrl(request));
    const tokens = await exchangeOAuthCode(provider, code, redirectUri);
    const profile = await fetchOAuthProfile(provider, tokens);

    if (!profile.providerId) {
      return fail(request, "oauth_missing_profile");
    }

    const user = await provisionOAuthUser(profile, tokens);

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    if (redirectAfterLogin === "/admin" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return fail(request, "admin_required");
    }

    const target = new URL(
      redirectAfterLogin ||
        (user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "/admin" : "/account"),
      request.url
    );

    const response = NextResponse.redirect(target);
    response.cookies.set(
      AUTH_COOKIE_NAME,
      token,
      authCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return fail(request, "oauth_failed");
  }
}
