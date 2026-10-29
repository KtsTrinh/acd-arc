import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic"; // Ép Next.js luôn chạy runtime trực tiếp, giải quyết triệt để lỗi cache danh sách người dùng

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || ((currentUser.role as string) !== "ADMIN" && (currentUser.role as string) !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

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

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role as string) !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có quyền thêm tài khoản." }, { status: 403 });
    }
    const body = await request.json();
    const { name, email, role = "ADMIN" } = body;
    if (!name || !email) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin." }, { status: 400 });
    }
    if (role !== "ADMIN" && role !== "USER") {
      return NextResponse.json({ error: "Chỉ có thể tạo tài khoản ADMIN hoặc USER." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email đã được sử dụng." }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: { name, email, role: role as any },
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
    if (!currentUser || ((currentUser.role as string) !== "ADMIN" && (currentUser.role as string) !== "SUPER_ADMIN")) {
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

    const curRole = currentUser.role as string;
    const tgRole = target.role as string;

    // 1. XỬ LÝ ĐẶC CÁCH: CHUYỂN NHƯỢNG QUYỀN LỰC TỐI CAO (SUPER_ADMIN TRANSFER)
    if (curRole === "SUPER_ADMIN" && role === "SUPER_ADMIN" && target.id !== currentUser.id) {
      if (tgRole !== "ADMIN") {
        return NextResponse.json({ error: "Chỉ có thể chuyển nhượng quyền cho tài khoản Admin" }, { status: 400 });
      }
      
      const [updatedTarget, demotedCurrent] = await prisma.$transaction([
        prisma.user.update({
          where: { id: target.id },
          data: { role: "SUPER_ADMIN" },
          select: { id: true, name: true, email: true, role: true }
        }),
        prisma.user.update({
          where: { id: currentUser.id },
          data: { role: "USER" }, // Hoặc ADMIN tùy logic của bạn
          select: { id: true, name: true, email: true, role: true }
        }),
      ]);

      // Tạo một JSON response để gửi về cho client
      const response = NextResponse.json({ 
        success: true, 
        user: updatedTarget, 
        transferred: true,
        shouldSignOut: true,
        message: "Chuyển nhượng quyền lực thành công. Hệ thống sẽ đăng xuất để cập nhật lại quyền."
      });

      // 🔥 ÉP BUỘC SERVER XÓA COOKIE ĐĂNG NHẬP NGAY LẬP TỨC
      // Hãy thay thế 'token' hoặc 'session' bằng tên cookie Auth thực tế của hệ thống bạn
      response.cookies.set("token", "", { path: "/", expires: new Date(0) });
      response.cookies.set("session", "", { path: "/", expires: new Date(0) });
      response.cookies.set("next-auth.session-token", "", { path: "/", expires: new Date(0) }); // Phòng khi dùng Next-Auth

      return response;
    }


    // 2. NGĂN CHẶN CÁC HÀNH VI TỰ THAY ĐỔI QUYỀN LỰC CHÍNH MÌNH
    if (target.id === currentUser.id) {
      if (curRole === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Không thể tự hạ quyền của chính mình." }, { status: 400 });
      }
      if (curRole === "ADMIN" && role !== "ADMIN") {
        return NextResponse.json({ error: "Quản trị viên thông thường không được tự thay đổi vai trò của mình." }, { status: 400 });
      }
    }

    // 3. BẢO VỆ TÀI KHOẢN SUPER_ADMIN KHỎI CÁC TÁC ĐỘNG TỪ BÊN NGOÀI
    if (tgRole === "SUPER_ADMIN" && curRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có quyền thay đổi thông tin của Super Admin khác." }, { status: 403 });
    }

    // 4. CHẶN ADMIN THÔNG THƯỜNG CẤP QUYỀN TỐI CAO (SUPER_ADMIN)
    if (role === "SUPER_ADMIN" && curRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có thể chuyển nhượng quyền" }, { status: 403 });
    }

    // 5. KIỂM SOÁT QUYỀN HẠN CỦA ADMIN THÔNG THƯỜNG
    if (curRole === "ADMIN") {
      if (tgRole === "USER" && role === "ADMIN") {
        return NextResponse.json({ error: "Chỉ Super Admin mới có quyền nâng cấp thành Admin" }, { status: 403 });
      }
      if (role !== tgRole) {
        return NextResponse.json({ error: "Chỉ Super Admin mới có quyền thay đổi phân quyền" }, { status: 403 });
      }
    }

    // === TẤT CẢ LOGIC HỢP LỆ -> TIẾN HÀNH CẬP NHẬT DATABASE ===
    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: { id: true, name: true, email: true, role: true }
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
    const curRole = currentUser?.role as string;

    if (!currentUser || (curRole !== "ADMIN" && curRole !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Không có quyền xóa người dùng." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID người dùng." }, { status: 400 });
    }
    if (id === currentUser.id) {
      return NextResponse.json({ error: "Không thể tự xóa tài khoản của chính mình." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const tgRole = target.role as string;

    if (curRole === "ADMIN" && tgRole !== "USER") {
      return NextResponse.json({ error: "Admin chỉ có thể xóa tài khoản người dùng." }, { status: 403 });
    }
    if (curRole === "SUPER_ADMIN" && tgRole === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Không thể xóa tài khoản Super Admin." }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Không thể xóa người dùng." }, { status: 500 });
  }
}
