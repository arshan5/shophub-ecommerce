import {
  Link,
} from "react-router-dom";

import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingBag,
} from "lucide-react";

import Breadcrumb from "../components/Breadcrumb";
import EmptyState from "../components/EmptyState";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

import { getProductById } from "../data/products";

import "./Cart.css";

export default function Cart() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  const {
    toggleWishlist,
  } = useWishlist();

  const {
    showToast,
  } = useToast();

  // =========================
  // ORDER CALCULATIONS
  // =========================

  const shipping =
    items.length === 0
      ? 0
      : subtotal > 50
      ? 0
      : 5.99;

  const tax =
    subtotal * 0.05;

  const total =
    subtotal +
    shipping +
    tax;

  // =========================
  // MOVE TO WISHLIST
  // =========================

  const handleMoveToWishlist = (
    item
  ) => {
    const product =
      getProductById(item.id);

    if (product) {
      toggleWishlist(product);
    }

    removeFromCart(
      item.id,
      item.color,
      item.size
    );

    showToast(
      `${item.name} moved to wishlist`,
      "success"
    );
  };

  // =========================
  // DECREASE QUANTITY
  // =========================

  const handleDecrease = (
    item
  ) => {
    const newQuantity =
      Number(item.quantity || 0) - 1;

    if (newQuantity < 1) {
      return;
    }

    updateQuantity(
      item.id,
      item.color,
      item.size,
      newQuantity
    );
  };

  // =========================
  // INCREASE QUANTITY
  // =========================

  const handleIncrease = (
    item
  ) => {
    const availableStock =
      Number(item.stock || 0);

    const currentQuantity =
      Number(item.quantity || 0);

    // No stock
    if (availableStock <= 0) {
      showToast(
        "This item is out of stock.",
        "error"
      );

      return;
    }

    // Already reached stock
    if (
      currentQuantity >=
      availableStock
    ) {
      showToast(
        `Only ${availableStock} item${
          availableStock !== 1
            ? "s"
            : ""
        } available.`,
        "error"
      );

      return;
    }

    updateQuantity(
      item.id,
      item.color,
      item.size,
      currentQuantity + 1
    );
  };

  return (
    <div className="container">

      {/* =========================
          BREADCRUMB
      ========================= */}

      <Breadcrumb
        items={[
          {
            label: "Home",
            to: "/",
          },
          {
            label: "Cart",
          },
        ]}
      />

      {/* =========================
          TITLE
      ========================= */}

      <h1 className="mb-16">
        Shopping Cart
      </h1>

      {/* =========================
          EMPTY CART
      ========================= */}

      {items.length === 0 ? (
        <EmptyState
          icon={
            <ShoppingBag
              size={48}
            />
          }
          title="Your cart is empty"
          message="Looks like you haven't added anything yet."
          actionLabel="Continue Shopping"
          actionTo="/shop"
        />
      ) : (

        /* =========================
           CART LAYOUT
        ========================= */

        <div className="cart-layout section">

          {/* =========================
              CART ITEMS
          ========================= */}

          <div className="cart-items">

            {items.map((item) => {

              const availableStock =
                Number(
                  item.stock || 0
                );

              const currentQuantity =
                Number(
                  item.quantity || 0
                );

              const isAtStockLimit =
                availableStock <= 0 ||
                currentQuantity >=
                  availableStock;

              return (
                <div
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="cart-item"
                >

                  {/* =========================
                      PRODUCT IMAGE
                  ========================= */}

                  <Link
                    to={`/product/${item.id}`}
                    className="cart-item-image"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  </Link>

                  {/* =========================
                      PRODUCT INFORMATION
                  ========================= */}

                  <div className="cart-item-info">

                    <Link
                      to={`/product/${item.id}`}
                    >
                      <h3>
                        {item.name}
                      </h3>
                    </Link>

                    {/* COLOR / SIZE */}

                    <p className="text-muted">

                      {item.color &&
                        `Color: ${item.color}`}

                      {item.size &&
                        ` · Size: ${item.size}`}

                    </p>

                    {/* =========================
                        PRICE
                    ========================= */}

                    <div className="cart-item-price">

                      <span className="price-current">
                        $
                        {Number(
                          item.price || 0
                        ).toFixed(2)}
                      </span>

                      {Number(
                        item.discount || 0
                      ) > 0 && (
                        <>
                          <span className="price-original">
                            $
                            {Number(
                              item.originalPrice ||
                                0
                            ).toFixed(2)}
                          </span>

                          <span className="badge badge-sale">
                            -
                            {
                              item.discount
                            }
                            %
                          </span>
                        </>
                      )}

                    </div>

                    {/* =========================
                        AVAILABLE STOCK
                    ========================= */}

                    <p
                      className="text-muted"
                      style={{
                        marginTop:
                          "6px",
                        fontSize:
                          "13px",
                      }}
                    >
                      {availableStock > 0
                        ? `${availableStock} item${
                            availableStock !==
                            1
                              ? "s"
                              : ""
                          } available`
                        : "Out of stock"}
                    </p>

                    {/* =========================
                        MOBILE QUANTITY
                    ========================= */}

                    <div className="cart-item-mobile-controls">

                      <div className="quantity-control">

                        {/* MINUS */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDecrease(
                              item
                            )
                          }
                          disabled={
                            currentQuantity <=
                            1
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus
                            size={13}
                          />
                        </button>

                        {/* QUANTITY */}

                        <span>
                          {
                            currentQuantity
                          }
                        </span>

                        {/* PLUS */}

                        <button
                          type="button"
                          onClick={() =>
                            handleIncrease(
                              item
                            )
                          }
                          disabled={
                            isAtStockLimit
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus
                            size={13}
                          />
                        </button>

                      </div>

                    </div>

                    {/* =========================
                        ACTIONS
                    ========================= */}

                    <div className="cart-item-actions">

                      <button
                        type="button"
                        onClick={() =>
                          handleMoveToWishlist(
                            item
                          )
                        }
                      >
                        <Heart
                          size={14}
                        />

                        Move to Wishlist
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item.id,
                            item.color,
                            item.size
                          )
                        }
                        className="danger-link"
                      >
                        <Trash2
                          size={14}
                        />

                        Remove
                      </button>

                    </div>

                  </div>

                  {/* =========================
                      DESKTOP QUANTITY
                  ========================= */}

                  <div className="cart-item-quantity">

                    <div className="quantity-control">

                      {/* MINUS */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDecrease(
                            item
                          )
                        }
                        disabled={
                          currentQuantity <=
                          1
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus
                          size={13}
                        />
                      </button>

                      {/* QUANTITY */}

                      <span>
                        {
                          currentQuantity
                        }
                      </span>

                      {/* PLUS */}

                      <button
                        type="button"
                        onClick={() =>
                          handleIncrease(
                            item
                          )
                        }
                        disabled={
                          isAtStockLimit
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus
                          size={13}
                        />
                      </button>

                    </div>

                  </div>

                  {/* =========================
                      ITEM SUBTOTAL
                  ========================= */}

                  <div className="cart-item-subtotal">

                    $
                    {(
                      Number(
                        item.price || 0
                      ) *
                      currentQuantity
                    ).toFixed(2)}

                  </div>

                </div>
              );
            })}

            {/* =========================
                CONTINUE SHOPPING
            ========================= */}

            <Link
              to="/shop"
              className="text-link"
            >
              ← Continue Shopping
            </Link>

          </div>

          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <aside className="cart-summary card card-pad">

            <h3 className="mb-16">
              Order Summary
            </h3>

            {/* SUBTOTAL */}

            <div className="summary-row">
              <span>
                Subtotal
              </span>

              <span>
                $
                {subtotal.toFixed(
                  2
                )}
              </span>
            </div>

            {/* SHIPPING */}

            <div className="summary-row">
              <span>
                Shipping
              </span>

              <span>
                {shipping === 0
                  ? "Free"
                  : `$${shipping.toFixed(
                      2
                    )}`}
              </span>
            </div>

            {/* TAX */}

            <div className="summary-row">
              <span>
                Tax (5%)
              </span>

              <span>
                $
                {tax.toFixed(2)}
              </span>
            </div>

            {/* TOTAL */}

            <div className="summary-row summary-total">
              <span>
                Total
              </span>

              <span>
                $
                {total.toFixed(2)}
              </span>
            </div>

            {/* CHECKOUT */}

            <Link
              to="/checkout"
              className="btn btn-primary btn-block btn-lg mt-16"
            >
              Proceed to Checkout
            </Link>

          </aside>

        </div>
      )}
    </div>
  );
}