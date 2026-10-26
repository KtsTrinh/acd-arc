import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Không thể lấy danh sách người dùng." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin được phép thêm tài khoản." }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Thiếu email." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email đã tồn tại." }, { status: 400 });
    }

    const passwordHash = password ? await hashPassword(password) : null;
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash,
        role: role === "ADMIN" || role === "SUPER_ADMIN" ? role : "USER",
        provider: "local",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Không thể tạo tài khoản." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, role } = await request.json();

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    if (target.role === "ADMIN" || target.role === "SUPER_ADMIN" || role === "ADMIN" || role === "SUPER_ADMIN") {
      if (currentUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Chỉ Super Admin được phép thay đổi quyền quản trị." }, { status: 403 });
      }
    }

    if (currentUser.id === id && currentUser.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Không thể tự hạ quyền của chính mình." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Không thể cập nhật quyền người dùng." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin được phép xóa tài khoản." }, { status: 403 });
    }

    const { id } = await request.json();
    if (id === currentUser.id) {
      return NextResponse.json({ error: "Không thể xóa chính mình." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Không thể xóa người dùng." }, { status: 500 });
  }
}