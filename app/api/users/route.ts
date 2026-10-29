import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: [
        { role: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    // Sắp xếp: SUPER_ADMIN trước, ADMIN, USER
    const roleOrder = { SUPER_ADMIN: 0, ADMIN: 1, USER: 2 };
    users.sort((a, b) => {
      const orderA = roleOrder[a.role as keyof typeof roleOrder] ?? 99;
      const orderB = roleOrder[b.role as keyof typeof roleOrder] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/** Tạo tài khoản (chỉ SUPER_ADMIN) */
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có quyền thêm tài khoản." }, { status: 403 });
    }
    const body = await request.json();
    const { name, email, password, role = "ADMIN" } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin." }, { status: 400 });
    }
    if (role !== "ADMIN" && role !== "USER") {
      return NextResponse.json({ error: "Chỉ có thể tạo tài khoản ADMIN hoặc USER." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email đã được sử dụng." }, { status: 400 });
    }
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, role },
    });
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
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
    const body = await request.json();
    const { id, role } = body;
    if (!id || !role || !["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }
    if (target.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Không thể chỉnh sửa tài khoản Super Admin" }, { status: 403 });
    }
    if (role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có thể chuyển nhượng quyền" }, { status: 403 });
    }
    if (currentUser.role !== "SUPER_ADMIN" && target.role !== "USER") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có quyền thay đổi phân quyền" }, { status: 403 });
    }
    if (currentUser.role === "ADMIN" && target.role === "USER" && role === "ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có quyền nâng cấp thành Admin" }, { status: 403 });
    }
    if (currentUser.id === id && currentUser.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Không thể tự hạ quyền của chính mình." }, { status: 400 });
    }
    const updated = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, name: true, email: true, role: true } });
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
      return NextResponse.json({ error: "Chỉ Super Admin mới có quyền xóa người dùng." }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID người dùng." }, { status: 400 });
    }
    if (id === currentUser.id) {
      return NextResponse.json({ error: "Không thể tự xóa tài khoản của chính mình." }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Không thể xóa người dùng." }, { status: 500 });
  }
}
