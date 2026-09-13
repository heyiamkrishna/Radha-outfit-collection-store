import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isDrawerOpen: false,

      // Getter alias for backwards compatibility with previous components
      get items() {
        return get().cart || [];
      },

      // Drawer Actions
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      // Computed Calculation Getters
      getTotalItems: () => {
        const list = get().cart || [];
        return list.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
      },

      getSubtotal: () => {
        const list = get().cart || [];
        return list.reduce(
          (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );
      },

      // Cart Mutation Actions
      addToCart: (product, size = "M", quantity = 1) => {
        set((state) => {
          const list = state.cart || [];
          const rawId = product._id || product.id || product.product;
          const pId = String(rawId);

          const existingIndex = list.findIndex(
            (i) => String(i.id || i._id || i.product) === pId && i.size === size
          );

          let updated;
          if (existingIndex > -1) {
            updated = list.map((item, idx) =>
              idx === existingIndex
                ? { ...item, quantity: item.quantity + Number(quantity) }
                : item
            );
          } else {
            updated = [
              ...list,
              {
                id: pId,
                _id: pId,
                product: pId,
                name: product.name,
                price: Number(product.salePrice || product.price || 0),
                image: product.image || product.images?.[0] || "/placeholder.jpg",
                size,
                quantity: Number(quantity) || 1,
                slug: product.slug || "",
              },
            ];
          }

          return { cart: updated, isDrawerOpen: true };
        });
      },

      removeFromCart: (id, size) => {
        set((state) => {
          const list = state.cart || [];
          const targetId = String(id);
          const updated = list.filter(
            (i) => !(String(i.id || i._id || i.product) === targetId && i.size === size)
          );
          return { cart: updated };
        });
      },

      updateQuantity: (id, size, delta) => {
        set((state) => {
          const list = state.cart || [];
          const targetId = String(id);
          const updated = list
            .map((item) => {
              if (String(item.id || item._id || item.product) === targetId && item.size === size) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean);
          return { cart: updated };
        });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "radha-cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && !state.cart && state.items) {
          state.cart = state.items;
        }
      },
    }
  )
);

export default useCartStore;