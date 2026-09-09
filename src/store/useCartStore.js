import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      items: [], // compatibility fallback
      isDrawerOpen: false,

      // Drawer Actions
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      // Cart Actions
      addToCart: (product, size = "M", quantity = 1) => {
        set((state) => {
          const list = state.cart || state.items || [];
          const pId = (product._id || product.id).toString();
          const existing = list.find((i) => (i.id || i._id).toString() === pId && i.size === size);

          let updated;
          if (existing) {
            updated = list.map((i) =>
              (i.id || i._id).toString() === pId && i.size === size
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          } else {
            updated = [
              ...list,
              {
                id: pId,
                _id: pId,
                name: product.name,
                price: Number(product.salePrice || product.price || 0),
                image: product.images?.[0] || product.image || "/placeholder.jpg",
                size,
                quantity,
                slug: product.slug,
              },
            ];
          }
          return { cart: updated, items: updated, isDrawerOpen: true };
        });
      },

      removeFromCart: (id, size) => {
        set((state) => {
          const list = state.cart || state.items || [];
          const updated = list.filter(
            (i) => !((i.id || i._id).toString() === id.toString() && i.size === size)
          );
          return { cart: updated, items: updated };
        });
      },

      clearCart: () => set({ cart: [], items: [] }),
    }),
    {
      name: "radha-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Support both default and named imports
export default useCartStore;