"use client";

import { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu cho User để TypeScript hiểu thuộc tính .role
export interface User {
    name: string;
    role: "SUPER_ADMIN" | "ADMIN" | "USER";
}

export function useAuth() {
    // Thay đổi giá trị role ở đây để test giao diện hiển thị ẩn/hiện menu thanh toán
    const [user, setUser] = useState<User | null>({
        name: "Quản trị viên",
        role: "SUPER_ADMIN",
    });

    const [loading, setLoading] = useState(false);

    return {
        user,
        loading,
    };
}
