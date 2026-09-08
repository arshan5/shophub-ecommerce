import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "shophub_cart";

// Read cart from localStorage
function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const cart = JSON.parse(raw);

    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

// Create a unique key for each cart item
// Product + color + size
function lineKey(item) {
  return `${item.id}__${item.color || ""}__${item.size || ""}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  // Save cart whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // =========================
  // Add Product To Cart
  // =========================

  const addToCart = (
    product,
    quantity = 1,
    options = {}
  ) => {
    const {
      color = "",
      size = "",
    } = options;

    if (!product?.id) {
      console.error("Product ID is missing");
      return;
    }

    if (quantity < 1) {
      return;
    }

    setItems((prev) => {
      const key = lineKey({
        id: product.id,
        color,
        size,
      });

      const existingItem = prev.find(
        (item) => lineKey(item) === key
      );

      // If product already exists
      if (existingItem) {
        return prev.map((item) =>
          lineKey(item) === key
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        );
      }

      // Add new product
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,

          // MongoDB product does not currently have slug
          slug: product.slug || "",

          // ProductDetails converts image into images[]
          image:
            product.images?.[0] || "",

          price: Number(product.price) || 0,

          color,
          size,

          quantity,
        },
      ];
    });
  };

  // =========================
  // Remove From Cart
  // =========================

  const removeFromCart = (
    id,
    color = "",
    size = ""
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          lineKey(item) !==
          lineKey({
            id,
            color,
            size,
          })
      )
    );
  };

  // =========================
  // Update Quantity
  // =========================

  const updateQuantity = (
    id,
    color = "",
    size = "",
    quantity
  ) => {
    if (quantity < 1) {
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        lineKey(item) ===
        lineKey({
          id,
          color,
          size,
        })
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  // =========================
  // Clear Cart
  // =========================

  const clearCart = () => {
    setItems([]);
  };

  // =========================
  // Subtotal
  // =========================

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );
  }, [items]);

  // =========================
  // Cart Count
  // =========================

  const cartCount = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [items]);

  // =========================
  // Context Value
  // =========================

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    cartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// =========================
// useCart Hook
// =========================

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return context;
}