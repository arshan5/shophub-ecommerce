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
  const [color, setColor] = useState("");
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

          images: imageUrl
            ? [imageUrl]
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

        setColor(
          formattedProduct
            .colors?.[0] || ""
        );

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

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast(
        "This product is out of stock.",
        "error"
      );

      return;
    }

    addToCart(
      product,
      quantity,
      {
        color,
        size,
      }
    );

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
                product.images[
                  activeImage
                ] ||
                "https://via.placeholder.com/600x600?text=No+Image"
              }
              alt={product.name}
            />
          </div>

          {product.images.length >
            0 && (
            <div className="product-thumbnails">
              {product.images.map(
                (image, index) => (
                  <button
                    key={`${image}-${index}`}
                    className={`product-thumb ${
                      index ===
                      activeImage
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveImage(
                        index
                      )
                    }
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${
                        index + 1
                      }`}
                    />
                  </button>
                )
              )}
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
              $
              {Number(
                product.price
              ).toFixed(2)}
            </span>

            {product.originalPrice >
              product.price && (
              <>
                <span
                  className="price-original"
                  style={{
                    fontSize: "1.1rem",
                  }}
                >
                  $
                  {Number(
                    product.originalPrice
                  ).toFixed(2)}
                </span>

                <span className="badge badge-sale">
                  -{product.discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock */}

          <p
            className={`stock-status ${
              product.stock > 0
                ? "in-stock"
                : "out-stock"
            }`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock} available)`
              : "Out of Stock"}
          </p>

          {/* Description */}

          <p className="product-short-desc">
            {product.shortDescription}
          </p>

          {/* Color */}

          {product.colors?.length >
            0 && (
            <div className="option-group">
              <span className="form-label">
                Color: {color}
              </span>

              <div className="option-row">
                {product.colors.map(
                  (item) => (
                    <button
                      key={item}
                      className={`option-pill ${
                        color ===
                        item
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setColor(
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
                  setQuantity(
                    (current) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
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
                onClick={() =>
                  setQuantity(
                    (current) =>
                      Math.min(
                        product.stock,
                        current +
                          1
                      )
                  )
                }
                aria-label="Increase quantity"
                disabled={
                  product.stock ===
                    0 ||
                  quantity >=
                    product.stock
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
                product.stock ===
                0
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
              onClick={
                handleAddToCart
              }
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
    </div>
  );
}