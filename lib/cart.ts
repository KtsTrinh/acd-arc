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
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      clearCart: () => {
        set({ items: [] });
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

