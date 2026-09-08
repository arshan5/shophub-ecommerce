import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import EmptyState from "../components/EmptyState";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import "./Wishlist.css";

const API_URL = import.meta.env.VITE_API_URL;

function getImageUrl(image) {
  if (!image) {
    return "https://via.placeholder.com/400x300?text=No+Image";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  return `${API_URL}/${image}`;
}

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = (item) => {
    const productId = item._id || item.id;

    addToCart(item, 1, {
      color: item.colors?.[0] || "",
      size: item.sizes?.[0] || "",
    });

    removeFromWishlist(productId);

    showToast(
      `${item.name} moved to cart`,
      "success"
    );
  };

  const handleRemove = (item) => {
    const productId = item._id || item.id;

    removeFromWishlist(productId);

    showToast(
      `${item.name} removed from wishlist`,
      "info"
    );
  };

  return (
    <div className="container">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Wishlist" },
        ]}
      />

      <h1 className="mb-16">
        My Wishlist ({items.length})
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={48} />}
          title="Your wishlist is empty"
          message="Save items you love so you can find them later."
          actionLabel="Continue Shopping"
          actionTo="/shop"
        />
      ) : (
        <div className="wishlist-grid section">
          {items.map((item) => {
            const productId = item._id || item.id;
            const imageUrl = getImageUrl(item.image);

            return (
              <div
                key={productId}
                className="wishlist-card card"
              >
                <Link
                  to={`/product/${productId}`}
                >
                  <img
                    src={imageUrl}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                </Link>

                <div className="wishlist-card-body">
                  <Link
                    to={`/product/${productId}`}
                  >
                    <h3>{item.name}</h3>
                  </Link>

                  <div className="product-card-price">
                    <span className="price-current">
                      $
                      {Number(
                        item.price || 0
                      ).toFixed(2)}
                    </span>

                    {Number(
                      item.originalPrice || 0
                    ) > Number(item.price || 0) && (
                      <span className="price-original">
                        $
                        {Number(
                          item.originalPrice
                        ).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="wishlist-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        handleMoveToCart(item)
                      }
                    >
                      <ShoppingCart size={14} />
                      Move to Cart
                    </button>

                    <button
                      className="btn-icon"
                      onClick={() =>
                        handleRemove(item)
                      }
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}