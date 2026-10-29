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
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
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
      data: { name, email, role, password: null },
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
    // Ép kiểu (as string) ở tầng kiểm tra đầu tiên để đảm bảo an toàn khi biên dịch
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

    // Tạo biến trung gian ép kiểu chuỗi để logic mạch lạc và sạch bóng lỗi TypeScript
    const curRole = currentUser.role as string;
    const tgRole = target.role as string;

    // 1. NGĂN CHẶN CÁC HÀNH VI TỰ THAY ĐỔI QUYỀN LỰC CHÍNH MÌNH
    if (target.id === currentUser.id) {
      // Super Admin không được tự hạ cấp mình (gây mất tài khoản tối cao của hệ thống)
      if (curRole === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Không thể tự hạ quyền của chính mình." }, { status: 400 });
      }
      // Admin bình thường không được tự nâng cấp mình lên Super Admin hoặc tự hạ quyền
      if (curRole === "ADMIN" && role !== "ADMIN") {
        return NextResponse.json({ error: "Quản trị viên thông thường không được tự thay đổi vai trò của mình." }, { status: 400 });
      }
    }

    // 2. BẢO VỆ TÀI KHOẢN SUPER_ADMIN KHỎI CÁC TÁC ĐỘNG TỪ BÊN NGOÀI
    // Bất kỳ ai (ngoại trừ một Super Admin khác) cố tình can thiệp vào tài khoản Super Admin đều bị chặn
    if (tgRole === "SUPER_ADMIN" && curRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có quyền thay đổi thông tin của Super Admin khác." }, { status: 403 });
    }

    // 3. CHẶN ADMIN THÔNG THƯỜNG CẤP QUYỀN TỐI CAO (SUPER_ADMIN)
    if (role === "SUPER_ADMIN" && curRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Chỉ Super Admin mới có thể chuyển nhượng quyền" }, { status: 403 });
    }

    // 4. KIỂM SOÁT QUYỀN HẠN CỦA ADMIN THÔNG THƯỜNG
    if (curRole === "ADMIN") {
      // Admin không được phép nâng cấp một USER bình thường lên thẳng ADMIN
      if (tgRole === "USER" && role === "ADMIN") {
        return NextResponse.json({ error: "Chỉ Super Admin mới có quyền nâng cấp thành Admin" }, { status: 403 });
      }
      // Admin không được phép can thiệp hoặc thay đổi bất cứ phân quyền nào khác
      if (role !== tgRole) {
        return NextResponse.json({ error: "Chỉ Super Admin mới có quyền thay đổi phân quyền" }, { status: 403 });
      }
    }

    // === TẤT CẢ LOGIC HỢP LỆ -> TIẾN HÀNH CẬP NHẬT DATABASE ===
    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as any }, // Thêm 'as any' để đồng bộ tuyệt đối với kiểu dữ liệu Prisma Client cục bộ
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
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
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
    if (currentUser.role === "ADMIN" && target.role !== "USER") {
      return NextResponse.json({ error: "Admin chỉ có thể xóa tài khoản người dùng." }, { status: 403 });
    }
    if (currentUser.role === "SUPER_ADMIN" && target.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Không thể xóa tài khoản Super Admin." }, { status: 403 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Không thể xóa người dùng." }, { status: 500 });
  }
}
