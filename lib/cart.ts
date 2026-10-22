import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // product id
  name: string;
  slug: string;
  price: number;
  type: string;
  fileFormat?: string | null;
  fileSize?: string | null;
  thumbnail?: string | null;
  quantity: number;
}

/** Ghi nhận thao tác giỏ hàng để CMS hiển thị "khách đã thêm sản phẩm nào vào giỏ" */
function trackCartEvent(payload: {
  action: "add" | "remove" | "clear" | "checkout";
  productId?: string;
  productName?: string;
  productSlug?: string;
  price?: number;
}) {
  if (typeof window === "undefined") return;

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track/cart",
        new Blob([body], { type: "application/json" })
      );
      return;
    }

    fetch("/api/track/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* theo dõi không được thì không ảnh hưởng luồng mua hàng */
  }
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const existing = currentItems.find((i) => i.id === item.id);
        if (existing) {
          // For digital products, quantity is typically 1
          return;
        }
        set({ items: [...currentItems, { ...item, quantity: 1 }] });
        trackCartEvent({
          action: "add",
          productId: item.id,
          productName: item.name,
          productSlug: item.slug,
          price: item.price,
        });
      },
      removeItem: (id) => {
        const removed = get().items.find((i) => i.id === id);
        set({ items: get().items.filter((i) => i.id !== id) });
        if (removed) {
          trackCartEvent({
            action: "remove",
            productId: removed.id,
            productName: removed.name,
            productSlug: removed.slug,
            price: removed.price,
          });
        }
      },
      clearCart: () => {
        const items = get().items;
        set({ items: [] });
        items.forEach((item) => {
          trackCartEvent({
            action: "clear",
            productId: item.id,
            productName: item.name,
            productSlug: item.slug,
            price: item.price,
          });
        });
      },
      totalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
      totalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: "acd-cart-storage",
    }
  )
);
