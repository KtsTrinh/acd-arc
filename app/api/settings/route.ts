import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings, saveSettings, defaultSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";

export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Không thể tải cấu hình hệ thống." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền thực hiện thao tác này." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Dữ liệu cấu hình không hợp lệ." },
        { status: 400 }
      );
    }

    const allowedKeys = Object.keys(defaultSettings) as (keyof typeof defaultSettings)[];
    const payload: Record<string, string> = {};

    for (const key of allowedKeys) {
      if (settings[key] !== undefined) {
        payload[key] = String(settings[key] ?? "");
      }
    }

    await saveSettings(payload);

    const updated = await getSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình lưu cấu hình." },
      { status: 500 }
    );
  }
}
