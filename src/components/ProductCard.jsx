import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye } from "lucide-react";

import StarRating from "./StarRating";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

import "./ProductCard.css";

const API_URL = import.meta.env.VITE_API_URL;

const badgeClassMap = {
  New: "badge-new",
  Sale: "badge-sale",
  "Best Seller": "badge-best",
};

export default function ProductCard({
  product,
  onQuickView,
}) {
  const { addToCart } = useCart();

  const {
    isInWishlist,
    toggleWishlist,
  } = useWishlist();

  const { showToast } = useToast();

  // =========================
  // PRODUCT ID
  // =========================

  const productId =
    product?._id || product?.id;

  // =========================
  // WISHLIST
  // =========================

  const inWishlist =
    isInWishlist(productId);

  // =========================
  // PRODUCT IMAGE
  // =========================

  const imageUrl = product?.image
    ? product.image.startsWith("http")
      ? product.image
      : `${API_URL}${product.image}`
    : "https://via.placeholder.com/400x300?text=No+Image";

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, 1, {
      color:
        product.colors?.[0] || "",

      size:
        product.sizes?.[0] || "",
    });

    showToast(
      `${product.name} added to cart`,
      "success"
    );
  };

  // =========================
  // WISHLIST
  // =========================

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product);

    showToast(
      inWishlist
        ? "Removed from wishlist"
        : "Added to wishlist",
      inWishlist
        ? "info"
        : "success"
    );
  };

  return (
    <div className="product-card">

      {/* =========================
          PRODUCT IMAGE
      ========================= */}

      <Link
        to={`/product/${productId}`}
        className="product-card-media"
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
        />

        {/* BADGES */}

        <div className="product-card-badges">
          {product.badge && (
            <span
              className={`badge ${
                badgeClassMap[
                  product.badge
                ] || "badge-muted"
              }`}
            >
              {product.badge}
            </span>
          )}

          {product.discount > 0 && (
            <span className="badge badge-sale">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* ACTIONS */}

        <div className="product-card-actions">

          {/* WISHLIST */}

          <button
            type="button"
            className={`btn-icon ${
              inWishlist ? "active" : ""
            }`}
            onClick={handleWishlist}
            aria-label={
              inWishlist
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <Heart
              size={16}
              fill={
                inWishlist
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          {/* QUICK VIEW */}

          {onQuickView && (
            <button
              type="button"
              className="btn-icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                onQuickView(product);
              }}
              aria-label="Quick view"
            >
              <Eye size={16} />
            </button>
          )}
        </div>

        {/* ADD TO CART */}

        <button
          type="button"
          className="add-to-cart-overlay"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </Link>

      {/* =========================
          PRODUCT INFORMATION
      ========================= */}

      <div className="product-card-body">

        <span className="product-card-category">
          {product.category}
        </span>

        <Link
          to={`/product/${productId}`}
        >
          <h3 className="product-card-name">
            {product.name}
          </h3>
        </Link>

        <StarRating
          rating={product.rating || 0}
          reviews={product.reviews || 0}
          size={13}
        />

        <div className="product-card-price">

  <span className="price-current">
    $
    {(
      Number(product.price || 0) -
      (Number(product.price || 0) *
        Number(product.discount || 0)) /
        100
    ).toFixed(2)}
  </span>

  {Number(product.discount || 0) > 0 && (
    <span className="price-original">
      $
      {Number(
        product.price || 0
      ).toFixed(2)}
    </span>
  )}

</div>
      </div>
    </div>
  );
}