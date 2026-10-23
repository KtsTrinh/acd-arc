import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

let cachedKeys: Record<string, string> | null = null;
let cachedAt = 0;

async function getPublicKeys(): Promise<Record<string, string>> {
  if (cachedKeys && Date.now() - cachedAt < 3600_000) return cachedKeys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error("Failed to fetch Google JWKS");
  const data = await res.json();
  const keys: Record<string, string> = {};
  for (const k of data.keys || []) {
    if (k.kid && k.n && k.e) {
      // Convert JWK to PEM
      const { createPublicKey } = await import("crypto");
      const pub = createPublicKey({ key: k, format: "jwk" });
      keys[k.kid] = pub.export({ type: "spki", format: "pem" }) as string;
    }
  }
  cachedKeys = keys;
  cachedAt = Date.now();
  return keys;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = String(body.idToken || "");
    if (!idToken) {
      return NextResponse.json({ error: "Thiếu Firebase ID token." }, { status: 400 });
    }

    const decodedHeader = jwt.decode(idToken, { complete: true }) as any;
    if (!decodedHeader?.header?.kid) {
      return NextResponse.json({ error: "Token không hợp lệ." }, { status: 400 });
    }

    const keys = await getPublicKeys();
    const pem = keys[decodedHeader.header.kid];
    if (!pem) {
      return NextResponse.json({ error: "Không tìm thấy key." }, { status: 400 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const decoded = jwt.verify(idToken, pem, {
      algorithms: ["RS256"],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    }) as any;

    const email = decoded.email ? String(decoded.email).toLowerCase().trim() : null;
    const name = decoded.name || null;
    const avatar = decoded.picture || null;
    const providerId = decoded.sub || decoded.uid;

    if (!email) {
      return NextResponse.json({ error: "Tài khoản Firebase không có email." }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          role: "USER",
          provider: "firebase",
          providerId,
          name,
          email,
          avatar,
          emailVerified: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: name || user.name, avatar: avatar || user.avatar },
      });
    }

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (error: any) {
    console.error("Firebase auth error:", error?.message || error);
    return NextResponse.json(
      { error: "Xác thực Firebase thất bại: " + String(error?.message || error).slice(0, 200) },
      { status: 500 }
    );
  }
}
