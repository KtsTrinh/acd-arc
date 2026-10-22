"use client";

import { useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: string;
  avatar?: string | null;
}

/**
 * Lấy thông tin khách đang đăng nhập.
 * Dùng để bắt buộc đăng nhập trước khi thêm sản phẩm vào giỏ hàng.
 */
export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (active) setUser(data.user || null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { user, loading, isLoggedIn: Boolean(user) };
}
