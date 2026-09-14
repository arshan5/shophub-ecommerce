import { useEffect, useState } from "react";
import {
  useParams,
  Link,
  Navigate,
} from "react-router-dom";

import {
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Star,
} from "lucide-react";

import Breadcrumb from "../components/Breadcrumb";
import StarRating from "../components/StarRating";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

import "./ProductDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [color, setColor] = useState("");

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const galleryImages =
    selectedVariant?.images?.length
      ? selectedVariant.images
      : product?.images || [];

  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("description");

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewText, setReviewText] =
    useState("");

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const [canReview, setCanReview] =
    useState(false);

  const [reviewChecking, setReviewChecking] =
    useState(false);

  const [reviewMessage, setReviewMessage] =
    useState("");

  const { addToCart } = useCart();

  const {
    isInWishlist,
    toggleWishlist,
  } = useWishlist();

  const { showToast } = useToast();

  const { user, isAuthenticated } =
    useAuth();

  // =====================================================
  // GET PRODUCT
  // =====================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "Product not found"
          );
        }

        const data = await response.json();

        // Product image
        let imageUrl = "";

        if (data.image) {
          if (
            data.image.startsWith("http")
          ) {
            imageUrl = data.image;
          } else {
            imageUrl = `${API_URL}${
              data.image.startsWith("/")
                ? data.image
                : `/${data.image}`
            }`;
          }
        }

        // Category
        let categoryName = "";

        if (
          data.category &&
          typeof data.category === "object"
        ) {
          categoryName =
            data.category.name ||
            data.category.title ||
            "";
        } else if (data.category) {
          // Backend is returning category ID
          try {
            const categoryResponse = await fetch(
              `${API_URL}/api/categories`
            );

            const categories =
              await categoryResponse.json();

            const matchedCategory =
              Array.isArray(categories)
                ? categories.find(
                    (category) =>
                      String(
                        category._id || category.id
                      ) === String(data.category)
                  )
                : null;

            categoryName =
              matchedCategory?.name ||
              matchedCategory?.title ||
              data.category;
          } catch (categoryError) {
            console.error(
              "Failed to fetch category:",
              categoryError
            );

            categoryName = data.category;
          }
        }

        // Product data for frontend
        const formattedProduct = {
          ...data,

          id: data._id || data.id,

          image: imageUrl,

          images: Array.isArray(data.images)
            ? data.images.map((image) => {
                if (image.startsWith("http")) {
                  return image;
                }

                return `${API_URL}${
                  image.startsWith("/")
                    ? image
                    : `/${image}`
                }`;
              })
            : imageUrl
            ? [imageUrl]
            : [],

          variants: Array.isArray(data.variants)
            ? data.variants.map((variant) => ({
                ...variant,

                images: Array.isArray(variant.images)
                  ? variant.images.map((image) => {
                      if (image.startsWith("http")) {
                        return image;
                      }

                      return `${API_URL}${
                        image.startsWith("/")
                          ? image
                          : `/${image}`
                      }`;
                    })
                  : [],
              }))
            : [],

          category:
            categoryName,

          price: Number(
            data.price || 0
          ),

          originalPrice: Number(
            data.originalPrice ||
              data.price ||
              0
          ),

          stock: Number(
            data.stock || 0
          ),

          rating: Number(
            data.rating || 0
          ),

          reviews: Number(
            data.reviews || 0
          ),

          discount: Number(
            data.discount || 0
          ),

          shortDescription:
            data.description || "",

          colors: Array.isArray(
            data.colors
          )
            ? data.colors
            : [],

          sizes: Array.isArray(
            data.sizes
          )
            ? data.sizes
            : [],

          specifications: {
            Category:
              categoryName,

            Stock:
              Number(
                data.stock || 0
              ),
          },
        };

        setProduct(
          formattedProduct
        );

        // NOTE: initial color/variant selection is handled in the
        // dedicated "SELECT FIRST COLOR VARIANT" effect below, which
        // runs whenever `product` changes — avoids setting it twice.

        setSize(
          formattedProduct
            .sizes?.[0] || ""
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "Failed to fetch product:",
          error
        );

        setProduct(null);
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // =====================================================
  // GET REVIEWS
  // =====================================================

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await fetch(
          `${API_URL}/api/reviews/${id}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch reviews"
          );
        }

        setReviews(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to fetch reviews:",
          error
        );

        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  // =====================================================
  // CHECK REVIEW ELIGIBILITY
  // =====================================================

  useEffect(() => {
    const checkReviewEligibility =
      async () => {
        if (
          !isAuthenticated ||
          !user?.id
        ) {
          setCanReview(false);

          setReviewMessage(
            "Please login to write a review."
          );

          return;
        }

        try {
          setReviewChecking(true);

          const token =
            localStorage.getItem(
              "shophub_token"
            );

          const response =
            await fetch(
              `${API_URL}/api/orders`,
              {
                headers: token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {},
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to check orders"
            );
          }

          const customerOrders =
            Array.isArray(data)
              ? data.filter(
                  (order) =>
                    order.customer?.email
                      ?.toLowerCase() ===
                    user.email?.toLowerCase()
                )
              : [];

          // Check if product was purchased
          const purchasedOrder =
            customerOrders.find(
              (order) =>
                order.items?.some(
                  (item) =>
                    String(
                      item.productId
                    ) === String(id)
                )
            );

          if (!purchasedOrder) {
            setCanReview(false);

            setReviewMessage(
              "You can only review products you have purchased."
            );

            return;
          }

          // Check delivered order
          const deliveredOrder =
            customerOrders.find(
              (order) =>
                order.status
                  ?.toLowerCase() ===
                  "delivered" &&
                order.items?.some(
                  (item) =>
                    String(
                      item.productId
                    ) === String(id)
                )
            );

          if (!deliveredOrder) {
            setCanReview(false);

            setReviewMessage(
              "You can write a review after your order is delivered."
            );

            return;
          }

          // Check duplicate review
          const alreadyReviewed =
            reviews.some(
              (review) =>
                String(
                  review.userId
                ) ===
                String(user.id)
            );

          if (alreadyReviewed) {
            setCanReview(false);

            setReviewMessage(
              "You have already reviewed this product."
            );

            return;
          }

          setCanReview(true);
          setReviewMessage("");
        } catch (error) {
          console.error(
            "Review eligibility error:",
            error
          );

          setCanReview(false);

          setReviewMessage(
            "Unable to check review eligibility."
          );
        } finally {
          setReviewChecking(false);
        }
      };

    checkReviewEligibility();
  }, [
    id,
    user,
    isAuthenticated,
    reviews,
  ]);

  // =====================================================
  // SELECT FIRST COLOR VARIANT
  // (Moved above the early `return`s below — hooks must run in the
  // same order on every render, so this can never live after a
  // conditional return.)
  // =====================================================

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstVariant = product.variants[0];

      setSelectedVariant(firstVariant);
      setColor(firstVariant.color || "");
    }
  }, [product]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="container">
        <p>Loading product...</p>
      </div>
    );
  }

  // =====================================================
  // PRODUCT NOT FOUND
  // =====================================================

  if (!product) {
    return (
      <Navigate
        to="/404"
        replace
      />
    );
  }

  const inWishlist =
    isInWishlist(product.id);

  const regularPrice =
    Number(product.price || 0);

  const discount =
    Number(product.discount || 0);

  const salePrice =
    regularPrice -
    (regularPrice * discount) / 100;

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview = async (
    event
  ) => {
    event.preventDefault();

    if (!isAuthenticated) {
      showToast(
        "Please login to write a review.",
        "error"
      );

      return;
    }

    if (reviewRating === 0) {
      showToast(
        "Please select a rating.",
        "error"
      );

      return;
    }

    if (!reviewText.trim()) {
      showToast(
        "Please write your review.",
        "error"
      );

      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/reviews`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId: id,

            userId: user.id,

            customerName:
              `${user.firstName || ""} ${
                user.lastName || ""
              }`.trim() ||
              user.name ||
              user.email,

            rating: reviewRating,

            text: reviewText.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit review"
        );
      }

      const newReview =
        data.review || data;

      setReviews(
        (previousReviews) => [
          newReview,
          ...previousReviews,
        ]
      );

      setReviewRating(0);
      setReviewText("");

      setCanReview(false);

      // The "already reviewed" message will also be recomputed by the
      // review-eligibility effect once `reviews` updates above, but we
      // set it immediately here too so the UI doesn't flash the old
      // "you can review" state before that effect re-runs.
      setReviewMessage(
        "You have already reviewed this product."
      );

      // Update displayed review count
      setProduct(
        (previousProduct) => {
          if (!previousProduct) {
            return previousProduct;
          }

          return {
            ...previousProduct,

            reviews:
              Number(
                previousProduct.reviews ||
                  0
              ) + 1,
          };
        }
      );

      showToast(
        "Review submitted successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Submit review error:",
        error
      );

      showToast(
        error.message ||
          "Failed to submit review.",
        "error"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
  // =========================
  // CHECK SELECTED VARIANT STOCK
  // =========================

  const availableStock =
    selectedVariant?.stock ?? product.stock ?? 0;

  // =========================
  // OUT OF STOCK
  // =========================

  if (availableStock <= 0) {
    showToast(
      selectedVariant
        ? `${selectedVariant.color} is out of stock.`
        : "This product is out of stock.",
      "error"
    );

    return;
  }

  // =========================
  // QUANTITY EXCEEDS STOCK
  // =========================

  if (quantity > availableStock) {
    showToast(
      `Only ${availableStock} item${
        availableStock !== 1 ? "s" : ""
      } available.`,
      "error"
    );

    return;
  }

  // =========================
  // ADD TO CART
  // =========================

  addToCart(
    product,
    quantity,
    {
      color,
      size,
    }
  );

  // =========================
  // SUCCESS
  // =========================

  showToast(
    `${product.name} added to cart`,
    "success"
  );
};

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleWishlist = () => {
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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="container">
      {/* Breadcrumb */}

      <Breadcrumb
        items={[
          {
            label: "Home",
            to: "/",
          },
          {
            label: "Shop",
            to: "/shop",
          },
          {
            label: product.name,
          },
        ]}
      />

      {/* =================================================
          PRODUCT DETAILS
      ================================================= */}

      <div className="product-details">
        {/* Product Gallery */}

        <div className="product-gallery">
          <div className="product-main-image">
            <img
              src={
                galleryImages[activeImage] ||
                "https://via.placeholder.com/600x600?text=No+Image"
              }
              alt={product.name}
              onClick={() => setIsImageZoomed(true)}
              style={{
                cursor: "zoom-in",
              }}
            />
          </div>

          {galleryImages.length > 0 && (
            <div className="product-thumbnails">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={`product-thumb ${
                    index === activeImage ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}

        <div className="product-info">
          <span className="product-card-category">
            {product.category}
          </span>

          <h1>
            {product.name}
          </h1>

          <StarRating
            rating={
              product.rating
            }
            reviews={
              product.reviews
            }
            size={16}
          />

          {/* Price */}

          <div className="product-price-row">
            <span
              className="price-current"
              style={{
                fontSize: "1.6rem",
              }}
            >
              ${salePrice.toFixed(2)}
            </span>

            {discount > 0 && (
              <>
                <span
                  className="price-original"
                  style={{
                    fontSize: "1.1rem",
                  }}
                >
                  ${regularPrice.toFixed(2)}
                </span>

                <span className="badge badge-sale">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          
          {/* Description */}

          <p className="product-short-desc">
            {product.shortDescription}
          </p>

          {/* Color */}

{product.variants?.length > 0 && (
  <div className="option-group">
    <span className="form-label">
      Color: {color}
    </span>

    <div className="option-row">
      {product.variants.map(
        (variant) => (
          <button
            key={variant.color}
            type="button"
            className={`option-pill ${
              color === variant.color
                ? "active"
                : ""
            }`}
            onClick={() => {
              setColor(
                variant.color
              );

              setSelectedVariant(
                variant
              );

              setActiveImage(0);

              setQuantity(1);
            }}
          >
            {variant.color}
          </button>
        )
      )}
    </div>

    {/* Selected Color Stock */}

    <p
      className={`stock-status ${
        (selectedVariant?.stock ??
          product.stock ??
          0) > 0
          ? "in-stock"
          : "out-stock"
      }`}
      style={{
        marginTop: "10px",
      }}
    >
      {(selectedVariant?.stock ??
        product.stock ??
        0) > 0
        ? `In Stock (${
            selectedVariant?.stock ??
            product.stock ??
            0
          } available)`
        : "Out of Stock"}
    </p>
  </div>
)}
          {/* Size */}

          {product.sizes?.length >
            0 && (
            <div className="option-group">
              <span className="form-label">
                Size: {size}
              </span>

              <div className="option-row">
                {product.sizes.map(
                  (item) => (
                    <button
                      key={item}
                      className={`option-pill ${
                        size ===
                        item
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSize(
                          item
                        )
                      }
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Quantity */}

<div className="option-group">
  <span className="form-label">
    Quantity
  </span>

  <div className="quantity-control">
    <button
      onClick={() =>
        setQuantity((current) =>
          Math.max(1, current - 1)
        )
      }
      aria-label="Decrease quantity"
    >
      <Minus size={14} />
    </button>

    <span>
      {quantity}
    </span>

    <button
      onClick={() => {
        const availableStock =
          selectedVariant?.stock ??
          product.stock ??
          0;

        setQuantity((current) =>
          Math.min(
            availableStock,
            current + 1
          )
        );
      }}
      aria-label="Increase quantity"
      disabled={
        (selectedVariant?.stock ??
          product.stock ??
          0) === 0 ||
        quantity >=
          (selectedVariant?.stock ??
            product.stock ??
            0)
      }
    >
      <Plus size={14} />
    </button>
  </div>
</div>

          {/* Actions */}

          <div className="product-actions-row">
            <button
              className="btn btn-primary btn-lg"
              disabled={
  (selectedVariant?.stock ??
    product.stock ??
    0) <= 0
}
              onClick={
                handleAddToCart
              }
            >
              Add to Cart
            </button>

            <Link
              to="/checkout"
              className="btn btn-accent btn-lg"
              onClick={(event) => {
  const availableStock =
    selectedVariant?.stock ??
    product.stock ??
    0;

  if (availableStock <= 0) {
    event.preventDefault();

    showToast(
      selectedVariant
        ? `${selectedVariant.color} is out of stock.`
        : "This product is out of stock.",
      "error"
    );

    return;
  }

  handleAddToCart();
}}
            >
              Buy Now
            </Link>

            <button
              className={`btn-icon btn-lg-icon ${
                inWishlist
                  ? "active"
                  : ""
              }`}
              onClick={
                handleWishlist
              }
            >
              <Heart
                size={18}
                fill={
                  inWishlist
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          </div>

          {/* Product Perks */}

          <div className="product-perks">
            <span>
              <Truck size={16} />
              Free shipping on
              orders over $50
            </span>

            <span>
              <RotateCcw
                size={16}
              />
              30-day easy returns
            </span>

            <span>
              <ShieldCheck
                size={16}
              />
              2-year warranty
              included
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          PRODUCT TABS
      ================================================= */}

      <div className="product-tabs">
        <div className="product-tabs-nav">
          <button
            className={
              tab ===
              "description"
                ? "active"
                : ""
            }
            onClick={() =>
              setTab(
                "description"
              )
            }
          >
            Description
          </button>

          <button
            className={
              tab === "specs"
                ? "active"
                : ""
            }
            onClick={() =>
              setTab("specs")
            }
          >
            Specifications
          </button>

          <button
            className={
              tab === "reviews"
                ? "active"
                : ""
            }
            onClick={() =>
              setTab("reviews")
            }
          >
            Reviews (
            {reviews.length})
          </button>
        </div>

        <div className="product-tabs-panel">
          {/* Description */}

          {tab ===
            "description" && (
            <p>
              {product.description ||
                "No description available for this product."}
            </p>
          )}

          {/* Specifications */}

          {tab === "specs" && (
            <table className="specs-table">
              <tbody>
                {Object.entries(
                  product.specifications
                ).map(
                  ([
                    key,
                    value,
                  ]) => (
                    <tr
                      key={key}
                    >
                      <td>
                        {key}
                      </td>

                      <td>
                        {value}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}

          {/* Reviews */}

          {tab === "reviews" && (
            <div>
              {/* Write Review */}

              <div
                className="card card-pad"
                style={{
                  marginBottom: 24,
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  Write a Review
                </h3>

                {reviewChecking ? (
                  <p className="text-muted">
                    Checking review
                    eligibility...
                  </p>
                ) : !canReview ? (
                  <p className="text-muted">
                    {reviewMessage}
                  </p>
                ) : (
                  <form
                    onSubmit={
                      handleSubmitReview
                    }
                  >
                    {/* Rating */}

                    <div
                      style={{
                        marginBottom: 16,
                      }}
                    >
                      <span className="form-label">
                        Your Rating
                      </span>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: 6,
                          marginTop: 8,
                        }}
                      >
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <button
                              key={
                                star
                              }
                              type="button"
                              onClick={() =>
                                setReviewRating(
                                  star
                                )
                              }
                              style={{
                                border:
                                  "none",
                                background:
                                  "none",
                                padding: 2,
                                cursor:
                                  "pointer",
                                color:
                                  star <=
                                  reviewRating
                                    ? "#f59e0b"
                                    : "#d1d5db",
                              }}
                              aria-label={`Rate ${star} stars`}
                            >
                              <Star
                                size={
                                  24
                                }
                                fill={
                                  star <=
                                  reviewRating
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Review Text */}

                    <div
                      style={{
                        marginBottom: 16,
                      }}
                    >
                      <label className="form-label">
                        Your Review
                      </label>

                      <textarea
                        value={
                          reviewText
                        }
                        onChange={(
                          event
                        ) =>
                          setReviewText(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Share your experience with this product..."
                        rows={5}
                        style={{
                          width:
                            "100%",
                          marginTop: 8,
                          padding: 12,
                          border:
                            "1px solid var(--color-border)",
                          borderRadius: 8,
                          resize:
                            "vertical",
                          fontFamily:
                            "inherit",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        reviewSubmitting
                      }
                    >
                      {reviewSubmitting
                        ? "Submitting..."
                        : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>

              {/* Existing Reviews */}

              <div className="reviews-list">
                {reviewsLoading ? (
                  <p>
                    Loading reviews...
                  </p>
                ) : reviews.length ===
                  0 ? (
                  <p className="text-muted">
                    No reviews yet for
                    this product.
                  </p>
                ) : (
                  reviews.map(
                    (review) => (
                      <div
                        key={
                          review._id ||
                          review.id
                        }
                        className="review-item"
                      >
                        <div className="flex-between">
                          <strong>
                            {
                              review.customerName
                            }
                          </strong>

                          <span
                            className="text-muted"
                            style={{
                              fontSize:
                                "0.78rem",
                            }}
                          >
                            {review.createdAt
                              ? new Date(
                                  review.createdAt
                                ).toLocaleDateString()
                              : ""}
                          </span>
                        </div>

                        <StarRating
                          rating={
                            review.rating
                          }
                          size={13}
                        />

                        <p>
                          {review.text}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isImageZoomed && (
        <div
          className="product-image-modal"
          onClick={() =>
            setIsImageZoomed(false)
          }
        >
          <button
            className="product-image-modal-close"
            onClick={(event) => {
              event.stopPropagation();
              setIsImageZoomed(false);
            }}
            aria-label="Close image"
          >
            ×
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                className="product-image-modal-prev"
                onClick={(event) => {
                  event.stopPropagation();

                  setActiveImage((current) =>
                    current === 0
                      ? galleryImages.length - 1
                      : current - 1
                  );
                }}
                aria-label="Previous image"
              >
                ‹
              </button>

              <button
                className="product-image-modal-next"
                onClick={(event) => {
                  event.stopPropagation();

                  setActiveImage((current) =>
                    current === galleryImages.length - 1
                      ? 0
                      : current + 1
                  );
                }}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          <img
            src={galleryImages[activeImage]}
            alt={product.name}
            className="product-image-modal-image"
            onClick={(event) =>
              event.stopPropagation()
            }
          />
        </div>
      )}
    </div>
  );
}