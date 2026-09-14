import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      isWishlistOpen: false,

      // ── Drawer Controls (Stable references) ──
      openWishlist: () => set({ isWishlistOpen: true }),
      closeWishlist: () => set({ isWishlistOpen: false }),
      toggleWishlistDrawer: () =>
        set((state) => ({ isWishlistOpen: !state.isWishlistOpen })),

      // ── Backward-compatible Getter ──
      get wishlist() {
        return get().items || [];
      },

      // ── Toggle Item In / Out of Wishlist ──
      toggleWishlist: (product) => {
        if (!product) return;
        const rawId = product._id || product.id;
        if (!rawId) return;

        const pId = String(rawId);
        const currentList = get().items || [];
        const exists = currentList.some(
          (item) => String(item._id || item.id) === pId
        );

        let updatedList;
        if (exists) {
          updatedList = currentList.filter(
            (item) => String(item._id || item.id) !== pId
          );
        } else {
          updatedList = [
            ...currentList,
            {
              _id: pId,
              id: pId,
              name: product.name || "Haute Piece",
              category: product.category || "Atelier Silhouette",
              price: Number(product.price || 0),
              salePrice: Number(product.salePrice || product.price || 0),
              image:
                product.image ||
                product.images?.[0] ||
                "/placeholder.jpg",
              slug: product.slug || pId,
            },
          ];
        }

        set({ items: updatedList });
      },

      // ── Check if item is already saved ──
      isInWishlist: (productId) => {
        if (!productId) return false;
        const pId = String(productId);
        return (get().items || []).some(
          (item) => String(item._id || item.id) === pId
        );
      },

      // ── Clear All Items ──
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "radha-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
      // Prevent SSR hydration state collisions
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useWishlistStore;