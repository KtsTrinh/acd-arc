import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const adminAuth = getFirebaseAdminAuth();
    if (!adminAuth) {
      return NextResponse.json(
        { error: "Firebase chưa được cấu hình trên máy chủ." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const idToken = String(body.idToken || "");
    if (!idToken) {
      return NextResponse.json(
        { error: "Thiếu Firebase ID token." },
        { status: 400 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email ? String(decoded.email).toLowerCase().trim() : null;
    const name = decoded.name || null;
    const avatar = decoded.picture || null;
    const providerId = decoded.uid;

    if (!email) {
      return NextResponse.json(
        { error: "Tài khoản Firebase không có email." },
        { status: 400 }
      );
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
  } catch (error) {
    console.error("Firebase auth error:", error);
    return NextResponse.json(
      { error: "Xác thực Firebase thất bại." },
      { status: 401 }
    );
  }
}
