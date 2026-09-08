import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);

const STORAGE_KEY = "shophub_wishlist";
const API_URL = import.meta.env.VITE_API_URL;

function getProductId(product) {
  return product?._id || product?.id;
}

function getImageUrl(product) {
  const image = product?.image || product?.images?.[0];

  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  return `${API_URL}/${image}`;
}

function readStoredWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(readStoredWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isInWishlist = (id) => {
    return items.some(
      (item) => (item._id || item.id) === id
    );
  };

  const toggleWishlist = (product) => {
    const productId = getProductId(product);

    setItems((prev) => {
      const alreadyExists = prev.some(
        (item) => (item._id || item.id) === productId
      );

      if (alreadyExists) {
        return prev.filter(
          (item) => (item._id || item.id) !== productId
        );
      }

      return [
        ...prev,
        {
          id: productId,
          name: product.name || "",
          slug: product.slug || "",
          image: getImageUrl(product),
          price: Number(product.price || 0),
          originalPrice: Number(product.originalPrice || 0),
          colors: product.colors || [],
          sizes: product.sizes || [],
        },
      ];
    });
  };

  const removeFromWishlist = (id) => {
    setItems((prev) =>
      prev.filter(
        (item) => (item._id || item.id) !== id
      )
    );
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value = {
    items,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    wishlistCount: items.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);

  if (!ctx) {
    throw new Error(
      "useWishlist must be used within WishlistProvider"
    );
  }

  return ctx;
}