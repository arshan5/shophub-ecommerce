import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "shophub_cart";

// =========================
// READ CART FROM LOCALSTORAGE
// =========================

function readStoredCart() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const cart = JSON.parse(raw);

    return Array.isArray(cart)
      ? cart
      : [];
  } catch {
    return [];
  }
}

// =========================
// UNIQUE CART ITEM KEY
// Product + color + size
// =========================

function lineKey(item) {
  return `${item.id}__${item.color || ""}__${item.size || ""}`;
}

export function CartProvider({
  children,
}) {
  const [items, setItems] = useState(
    readStoredCart
  );

  // =========================
  // SAVE CART
  // =========================

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items]);

// =========================
// ADD PRODUCT TO CART
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
    console.error(
      "Product ID is missing"
    );

    return false;
  }

  if (quantity < 1) {
    return false;
  }

  // =========================
  // FIND SELECTED COLOR VARIANT
  // =========================

  const selectedVariant =
    Array.isArray(product.variants)
      ? product.variants.find(
          (variant) =>
            variant.color === color
        )
      : null;

  // =========================
  // USE VARIANT STOCK
  // FALL BACK TO PRODUCT STOCK
  // =========================

  const stock = Number(
    selectedVariant?.stock ??
      product.stock ??
      0
  );

  if (stock <= 0) {
    return false;
  }

  let addedSuccessfully = false;

  setItems((prev) => {
    const key = lineKey({
      id: product.id,
      color,
      size,
    });

    const existingItem = prev.find(
      (item) =>
        lineKey(item) === key
    );

    // =========================
    // PRODUCT ALREADY IN CART
    // =========================

    if (existingItem) {
      const currentQuantity =
        Number(
          existingItem.quantity || 0
        );

      const newQuantity = Math.min(
        currentQuantity +
          Number(quantity),
        stock
      );

      if (
        newQuantity ===
        currentQuantity
      ) {
        return prev;
      }

      addedSuccessfully = true;

      return prev.map((item) =>
        lineKey(item) === key
          ? {
              ...item,
              quantity:
                newQuantity,
              stock,
            }
          : item
      );
    }

    // =========================
    // NEW PRODUCT
    // =========================

    const safeQuantity =
      Math.min(
        Number(quantity),
        stock
      );

    if (safeQuantity <= 0) {
      return prev;
    }

    addedSuccessfully = true;

    const regularPrice =
      Number(product.price || 0);

    const discount =
      Number(
        product.discount || 0
      );

    const salePrice =
      regularPrice -
      (regularPrice * discount) /
        100;

    // =========================
    // CART IMAGE
    // USE SELECTED VARIANT IMAGE
    // WHEN AVAILABLE
    // =========================

    const cartImage =
      selectedVariant?.images?.[0] ||
      product.images?.[0] ||
      product.image ||
      "";

    return [
      ...prev,
      {
        id: product.id,

        name: product.name,

        // MongoDB product does not
        // currently have slug
        slug:
          product.slug || "",

        image: cartImage,

        // Actual customer price
        price: salePrice,

        // Original product price
        originalPrice:
          regularPrice,

        // Discount percentage
        discount,

        color,
        size,

        quantity: safeQuantity,

        // Save selected variant stock
        stock,
      },
    ];
  });

  return addedSuccessfully;
};

  // =========================
  // REMOVE FROM CART
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
  // UPDATE QUANTITY
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
      prev.map((item) => {
        if (
          lineKey(item) !==
          lineKey({
            id,
            color,
            size,
          })
        ) {
          return item;
        }

        const stock = Number(
          item.stock || 0
        );

        const safeQuantity =
          Math.min(
            Number(quantity),
            stock
          );

        return {
          ...item,
          quantity: safeQuantity,
        };
      })
    );
  };

  // =========================
  // CLEAR CART
  // =========================

  const clearCart = () => {
    setItems([]);
  };

  // =========================
  // SUBTOTAL
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
  // CART COUNT
  // =========================

  const cartCount = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );
  }, [items]);

  // =========================
  // CONTEXT VALUE
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
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

// =========================
// USE CART HOOK
// =========================

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return context;
}