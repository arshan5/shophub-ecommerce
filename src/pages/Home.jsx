import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Quote,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock3,
  ShoppingBag,
} from "lucide-react";

import Hero from "../components/Hero";
import CategoryCard from "../components/CategoryCard";
import ProductGrid from "../components/ProductGrid";

import "./Home.css";

const API_URL = import.meta.env.VITE_API_URL;

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    text: "On all orders over $50",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    text: "100% secure checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    text: "30-day return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    text: "Dedicated customer care",
  },
];

const reviews = [
  {
    name: "Sara Khan",
    text: "The quality exceeded my expectations and shipping was faster than expected. Definitely shopping here again.",
    rating: 5,
  },
  {
    name: "James Wilson",
    text: "Great selection and the product descriptions are spot on. Everything arrived exactly as expected.",
    rating: 5,
  },
  {
    name: "Fatima Noor",
    text: "Love the packaging and attention to detail. My go-to store for gifts now.",
    rating: 4,
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [featuredIndex, setFeaturedIndex] =
    useState(0);

  const [subscribeMessage, setSubscribeMessage] =
    useState("");

  const [subscribeError, setSubscribeError] =
    useState("");

  const [subscribing, setSubscribing] =
    useState(false);

  // =========================
  // FETCH HOME DATA
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          productsResponse,
          newArrivalsResponse,
          bestSellersResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/products`),

          fetch(
            `${API_URL}/api/products/new-arrivals`
          ),

          fetch(
            `${API_URL}/api/products/best-sellers`
          ),

          fetch(`${API_URL}/api/categories`),
        ]);

        if (
          !productsResponse.ok ||
          !newArrivalsResponse.ok ||
          !bestSellersResponse.ok ||
          !categoriesResponse.ok
        ) {
          throw new Error(
            "Home page data request failed"
          );
        }

        const [
          productsData,
          newArrivalsData,
          bestSellersData,
          categoriesData,
        ] = await Promise.all([
          productsResponse.json(),
          newArrivalsResponse.json(),
          bestSellersResponse.json(),
          categoriesResponse.json(),
        ]);

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : []
        );

        setNewArrivals(
          Array.isArray(newArrivalsData)
            ? newArrivalsData
            : []
        );

        setBestSellers(
          Array.isArray(bestSellersData)
            ? bestSellersData
            : []
        );

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : []
        );
      } catch (error) {
        console.error(
          "Home page error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =========================
  // FEATURED PRODUCTS
  // =========================
  // Featured products are selected
  // separately from New Arrivals
  // and Best Sellers.

  const bestSellerIds = new Set(
    bestSellers.map(
      (product) =>
        product._id || product.id
    )
  );

  const newArrivalIds = new Set(
    newArrivals.map(
      (product) =>
        product._id || product.id
    )
  );

  let featuredProducts =
    products.filter((product) => {
      const id =
        product._id || product.id;

      return (
        !bestSellerIds.has(id) &&
        !newArrivalIds.has(id)
      );
    });

  // If there are not enough different
  // products, use highly rated products
  // as fallback.

  if (featuredProducts.length < 4) {
    featuredProducts = [...products]
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
      .slice(0, 8);
  }

  // Maximum 8 featured products
  featuredProducts =
    featuredProducts.slice(0, 8);

  // =========================
  // FEATURED SLIDER
  // =========================

  const featuredVisible =
    featuredProducts.slice(
      featuredIndex,
      featuredIndex + 4
    );

  const canGoNext =
    featuredIndex + 4 <
    featuredProducts.length;

  const canGoPrevious =
    featuredIndex > 0;

  const handleFeaturedNext = () => {
    if (canGoNext) {
      setFeaturedIndex(
        (current) => current + 1
      );
    }
  };

  const handleFeaturedPrevious = () => {
    if (canGoPrevious) {
      setFeaturedIndex(
        (current) => current - 1
      );
    }
  };

  // =========================
  // NEWSLETTER
  // =========================

  const handleNewsletter = async (e) => {
    e.preventDefault();

    const email =
      e.target.email.value.trim();

    setSubscribeMessage("");
    setSubscribeError("");
    setSubscribing(true);

    try {
      const response = await fetch(
        `${API_URL}/api/newsletter/subscribe`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setSubscribeError(
          data.message ||
            "Subscription failed."
        );

        return;
      }

      setSubscribeMessage(
        data.message ||
          "Thanks for subscribing!"
      );

      e.target.reset();
    } catch (error) {
      console.error(
        "Newsletter error:",
        error
      );

      setSubscribeError(
        "Unable to subscribe. Please try again."
      );
    } finally {
      setSubscribing(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="home-page">
        <Hero />

        <section className="section container">
          <div className="home-loading">
            <div className="home-loading-spinner" />

            <p>
              Preparing your shopping
              experience...
            </p>
          </div>
        </section>
      </div>
    );
  }

  // =========================
  // HOME
  // =========================

  return (
    <div className="home-page">

      {/* =========================
          HERO
      ========================= */}

      <Hero />

      {/* =========================
          SHOP BY CATEGORY
      ========================= */}

      <section className="section container home-section">
        <div className="premium-section-header">
          <div>
            <span className="section-eyebrow">
              Explore Collection
            </span>

            <h2 className="section-title">
              Shop by Category
            </h2>

            <p className="section-subtitle">
              Discover products curated for
              every style and lifestyle.
            </p>
          </div>

          <Link
            to="/categories"
            className="premium-text-link"
          >
            View All Categories
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="home-category-grid">
          {categories.length === 0 ? (
            <div className="empty-home-state">
              No categories available.
            </div>
          ) : (
            categories
              .slice(0, 6)
              .map((category) => (
                <CategoryCard
                  key={
                    category._id ||
                    category.id
                  }
                  category={category}
                />
              ))
          )}
        </div>
      </section>

      {/* =========================
          FEATURED PRODUCTS
      ========================= */}

      <section className="section container home-section featured-section">
        <div className="premium-section-header">
          <div>
            <span className="section-eyebrow">
              <Sparkles size={15} />
              Curated For You
            </span>

            <h2 className="section-title">
              Featured Products
            </h2>

            <p className="section-subtitle">
              Hand-picked pieces worth
              discovering.
            </p>
          </div>

          <div className="featured-controls">
            <button
              type="button"
              className="slider-arrow"
              onClick={
                handleFeaturedPrevious
              }
              disabled={!canGoPrevious}
              aria-label="Previous products"
            >
              <ArrowLeft size={19} />
            </button>

            <button
              type="button"
              className="slider-arrow"
              onClick={handleFeaturedNext}
              disabled={!canGoNext}
              aria-label="Next products"
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="empty-home-state">
            No featured products available.
          </div>
        ) : (
          <div className="featured-slider">
            <ProductGrid
              products={featuredVisible}
            />
          </div>
        )}
      </section>

      {/* =========================
          PREMIUM PROMO
      ========================= */}

      <section className="premium-promo">
        <div className="container premium-promo-inner">
          <div className="premium-promo-content">
            <span className="promo-eyebrow">
              <Sparkles size={15} />
              Limited Time Collection
            </span>

            <h2>
              Elevate Your Everyday
            </h2>

            <p>
              Discover premium essentials
              selected to bring more style,
              comfort and value to your day.
            </p>

            <Link
              to="/shop?filter=sale"
              className="premium-promo-button"
            >
              Shop the Collection
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="promo-decoration">
            <ShoppingBag size={100} />
          </div>
        </div>
      </section>
{/* =========================
    PREMIUM BRAND STATEMENT
========================= */}

<section className="premium-brand-section">
  <div className="container">
    <div className="premium-brand-content">
      <span className="section-eyebrow">
        The ShopHub Experience
      </span>

      <h2>
        More Than Shopping.
        <br />
        It's Your Lifestyle.
      </h2>

      <p>
        Discover thoughtfully selected products
        designed to bring quality, style and
        value into your everyday life.
      </p>

      <Link
        to="/shop"
        className="premium-brand-link"
      >
        Discover Our Collection
        <ArrowRight size={17} />
      </Link>
    </div>
  </div>
</section>


{/* =========================
    SHOP THE COLLECTION
========================= */}

<section className="section container collection-section">
  <div className="premium-section-header centered-header">
    <div>
      <span className="section-eyebrow">
        Curated Collections
      </span>

      <h2 className="section-title">
        Shop the Collection
      </h2>

      <p className="section-subtitle">
        Find something made for every moment,
        mood and lifestyle.
      </p>
    </div>
  </div>

  <div className="collection-grid">

    <Link
      to="/shop"
      className="collection-card collection-card-large"
    >
      <div className="collection-card-content">
        <span>01</span>

        <h3>
          Everyday Essentials
        </h3>

        <p>
          Simple pieces you'll love using
          every day.
        </p>

        <strong>
          Explore Collection
          <ArrowRight size={16} />
        </strong>
      </div>
    </Link>


    <Link
      to="/shop"
      className="collection-card"
    >
      <div className="collection-card-content">
        <span>02</span>

        <h3>
          Modern Lifestyle
        </h3>

        <p>
          Designed for the way you live.
        </p>

        <strong>
          Shop Now
          <ArrowRight size={16} />
        </strong>
      </div>
    </Link>


    <Link
      to="/shop"
      className="collection-card"
    >
      <div className="collection-card-content">
        <span>03</span>

        <h3>
          Premium Picks
        </h3>

        <p>
          Hand-selected favorites worth
          discovering.
        </p>

        <strong>
          Discover More
          <ArrowRight size={16} />
        </strong>
      </div>
    </Link>

  </div>
</section>
      {/* =========================
          NEW ARRIVALS
      ========================= */}

      <section className="section container home-section">
        <div className="premium-section-header">
          <div>
            <span className="section-eyebrow">
              <Clock3 size={15} />
              Just Added
            </span>

            <h2 className="section-title">
              New Arrivals
            </h2>

            <p className="section-subtitle">
              The latest additions to our
              collection.
            </p>
          </div>

          <Link
            to="/shop?filter=new"
            className="premium-text-link"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>

        {newArrivals.length === 0 ? (
          <div className="empty-home-state">
            No new arrivals available.
          </div>
        ) : (
          <ProductGrid
            products={newArrivals.slice(0, 4)}
          />
        )}
      </section>

      {/* =========================
          BEST SELLERS
      ========================= */}

      <section className="section container home-section best-seller-section">
        <div className="premium-section-header">
          <div>
            <span className="section-eyebrow">
              <TrendingUp size={15} />
              Customer Favorites
            </span>

            <h2 className="section-title">
              Best Sellers
            </h2>

            <p className="section-subtitle">
              The products our customers are
              buying the most.
            </p>
          </div>

          <Link
            to="/shop?filter=bestseller"
            className="premium-text-link"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>

        {bestSellers.length === 0 ? (
          <div className="best-seller-empty">
            <TrendingUp size={28} />

            <h3>
              Your next favorite might be
              here.
            </h3>

            <p>
              Best sellers will appear here
              as customers place orders.
            </p>
          </div>
        ) : (
          <ProductGrid
            products={bestSellers.slice(0, 4)}
          />
        )}
      </section>

      {/* =========================
          WHY SHOP WITH US
      ========================= */}

      <section className="section why-us premium-why-us">
        <div className="container">
          <div className="premium-section-header centered-header">
            <div>
              <span className="section-eyebrow">
                Shop With Confidence
              </span>

              <h2 className="section-title">
                Why Shop With Us?
              </h2>

              <p className="section-subtitle">
                Everything you need for a
                simple and secure shopping
                experience.
              </p>
            </div>
          </div>

          <div className="premium-features-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="premium-feature-card"
                >
                  <div className="premium-feature-icon">
                    <Icon size={23} />
                  </div>

                  <h4>
                    {feature.title}
                  </h4>

                  <p>
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================
          REVIEWS
      ========================= */}

      <section className="section container home-section reviews-section">
        <div className="premium-section-header centered-header">
          <div>
            <span className="section-eyebrow">
              Customer Stories
            </span>

            <h2 className="section-title">
              What Our Customers Say
            </h2>

            <p className="section-subtitle">
              Real feedback from shoppers
              who chose ShopHub.
            </p>
          </div>
        </div>

        <div className="premium-reviews-grid">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="premium-review-card"
            >
              <Quote
                size={24}
                className="review-quote-icon"
              />

              <div className="review-stars">
                {"★".repeat(
                  review.rating
                )}

                {"☆".repeat(
                  5 - review.rating
                )}
              </div>

              <p>
                "{review.text}"
              </p>

              <div className="review-footer">
                <div className="review-avatar">
                  {review.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {review.name}
                  </strong>

                  <span>
                    Verified Customer
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          NEWSLETTER
      ========================= */}

      <section className="premium-newsletter">
        <div className="container">
          <div className="premium-newsletter-box">
            <div className="newsletter-copy">
              <span className="section-eyebrow">
                Stay in the Loop
              </span>

              <h2>
                Get 10% Off Your First Order
              </h2>

              <p>
                Subscribe for new arrivals,
                exclusive offers and special
                updates.
              </p>
            </div>

            <form
              onSubmit={handleNewsletter}
              className="premium-newsletter-form"
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />

              <button
                type="submit"
                disabled={subscribing}
              >
                {subscribing
                  ? "Subscribing..."
                  : "Subscribe"}
              </button>
            </form>

            {subscribeMessage && (
              <p className="newsletter-success">
                {subscribeMessage}
              </p>
            )}

            {subscribeError && (
              <p className="newsletter-error">
                {subscribeError}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}