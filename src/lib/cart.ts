import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (i: CartItem) => void;
  remove: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (i) =>
        set((s) => {
          const existing = s.items.find((x) => x.id === i.id && x.size === i.size);
          if (existing) {
            return {
              items: s.items.map((x) =>
                x.id === i.id && x.size === i.size ? { ...x, qty: x.qty + i.qty } : x
              ),
            };
          }
          return { items: [...s.items, i] };
        }),
      remove: (id, size) =>
        set((s) => ({ items: s.items.filter((x) => !(x.id === id && x.size === size)) })),
      setQty: (id, size, qty) =>
        set((s) => ({
          items: s.items
            .map((x) => (x.id === id && x.size === size ? { ...x, qty } : x))
            .filter((x) => x.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "ariomac-cart" }
  )
);

export const calcTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 79;
  const discount = subtotal >= 2999 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total, itemCount };
};

export const formatINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN");