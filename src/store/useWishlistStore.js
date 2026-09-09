import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const DEFAULT_WISHLIST = [
  {
    _id: "preview-liked-1",
    id: "preview-liked-1",
    name: "Pleated Linen Trouser",
    price: 5499,
    salePrice: 5499,
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    slug: "pleated-linen-trouser",
  },
];

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: DEFAULT_WISHLIST,
      wishlist: DEFAULT_WISHLIST,

      toggleWishlist: (product) => {
        if (!product) return;
        const pId = (product._id || product.id || "").toString();
        const currentList = get().items || [];
        const exists = currentList.some(
          (i) => (i._id || i.id || "").toString() === pId
        );

        let updated;
        if (exists) {
          updated = currentList.filter(
            (i) => (i._id || i.id || "").toString() !== pId
          );
        } else {
          updated = [
            ...currentList,
            {
              _id: pId,
              id: pId,
              name: product.name || "Haute Piece",
              category: product.category || "Atelier Silhouette",
              price: Number(product.price || 0),
              salePrice: Number(product.salePrice || product.price || 0),
              image:
                product.images?.[0] || product.image || "/placeholder.jpg",
              slug: product.slug || "",
            },
          ];
        }
        set({ items: updated, wishlist: updated });
      },

      isInWishlist: (productId) => {
        if (!productId) return false;
        const pId = productId.toString();
        return (get().items || []).some(
          (i) => (i._id || i.id || "").toString() === pId
        );
      },

      clearWishlist: () => set({ items: [], wishlist: [] }),
    }),
    {
      name: "radha-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useWishlistStore;