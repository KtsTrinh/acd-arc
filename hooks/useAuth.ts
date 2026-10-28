"use client";

import { useState, useEffect } from "react";

export interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    role: "SUPER_ADMIN" | "ADMIN" | "USER";
    avatar?: string | null;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user || null);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return {
        user,
        loading,
    };
}
