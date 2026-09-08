import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Quote,
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
    text: "Great selection and the product descriptions are spot on.",
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
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [subscribeMessage, setSubscribeMessage] =
    useState("");

  const [subscribeError, setSubscribeError] =
    useState("");

  const [subscribing, setSubscribing] =
    useState(false);

  // =========================
  // FETCH PRODUCTS + CATEGORIES
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsResponse = await fetch(
          `${API_URL}/api/products`
        );

        const categoriesResponse = await fetch(
          `${API_URL}/api/categories`
        );

        if (!productsResponse.ok) {
          throw new Error("Products request failed");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Categories request failed");
        }

        const productsData =
          await productsResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        setProducts(
          Array.isArray(productsData)
            ? productsData
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
  // PRODUCTS
  // =========================

  const featuredProducts =
    products.slice(0, 4);

  const newArrivals =
    products.slice(0, 4);

  const bestSellers =
    products.slice(0, 4);

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
      <div>
        <Hero />

        <section className="section container">
          <div className="chart-placeholder">
            Loading store...
          </div>
        </section>
      </div>
    );
  }

  // =========================
  // HOME
  // =========================

  return (
    <div>
      <Hero />

      {/* Categories */}

      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Shop by Category
            </h2>

            <p className="section-subtitle">
              Find exactly what you're looking for
            </p>
          </div>

          <Link
            to="/categories"
            className="text-link"
          >
            View All Categories
          </Link>
        </div>

        <div className="grid grid-3 category-grid">
          {categories.length === 0 ? (
            <p>No categories available.</p>
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

      {/* Featured Products */}

      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Featured Products
            </h2>

            <p className="section-subtitle">
              Hand-picked items our customers love
            </p>
          </div>

          <Link
            to="/shop"
            className="text-link"
          >
            View All
          </Link>
        </div>

        <ProductGrid
          products={featuredProducts}
        />
      </section>

      {/* Promo */}

      <section className="promo-banner">
        <div className="container promo-banner-content">
          <span className="promo-eyebrow">
            Limited Time Offer
          </span>

          <h2>
            Up to 40% Off Selected Items
          </h2>

          <p>
            Refresh your wardrobe and home with
            our seasonal sale.
          </p>

          <Link
            to="/shop?filter=sale"
            className="btn btn-accent btn-lg"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* New Arrivals */}

      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              New Arrivals
            </h2>

            <p className="section-subtitle">
              The latest additions to our catalog
            </p>
          </div>

          <Link
            to="/shop?filter=new"
            className="text-link"
          >
            View All
          </Link>
        </div>

        <ProductGrid
          products={newArrivals}
        />
      </section>

      {/* Best Sellers */}

      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Best Sellers
            </h2>

            <p className="section-subtitle">
              Most loved by our customers
            </p>
          </div>

          <Link
            to="/shop?filter=bestseller"
            className="text-link"
          >
            View All
          </Link>
        </div>

        <ProductGrid
          products={bestSellers}
        />
      </section>

      {/* Why Us */}

      <section className="section why-us">
        <div className="container">
          <div className="grid grid-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-item"
              >
                <div className="feature-icon">
                  <feature.icon size={22} />
                </div>

                <h4>
                  {feature.title}
                </h4>

                <p>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}

      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              What Our Customers Say
            </h2>

            <p className="section-subtitle">
              Real feedback from real shoppers
            </p>
          </div>
        </div>

        <div className="grid grid-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="review-card card card-pad"
            >
              <Quote
                size={22}
                className="review-quote-icon"
              />

              <p>
                {review.text}
              </p>

              <div className="review-footer">
                <strong>
                  {review.name}
                </strong>

                <span>
                  {"★".repeat(
                    review.rating
                  )}

                  {"☆".repeat(
                    5 - review.rating
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}

      <section className="newsletter-section">
        <div className="container newsletter-content">
          <h2>
            Join Our Newsletter
          </h2>

          <p>
            Get 10% off your first order plus
            updates on new arrivals and exclusive
            offers.
          </p>

          <form
            onSubmit={handleNewsletter}
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />

            <button
              type="submit"
              className="btn btn-accent"
              disabled={subscribing}
            >
              {subscribing
                ? "Subscribing..."
                : "Subscribe"}
            </button>
          </form>

          {subscribeMessage && (
            <p
              style={{
                marginTop: 12,
                color: "green",
              }}
            >
              {subscribeMessage}
            </p>
          )}

          {subscribeError && (
            <p
              style={{
                marginTop: 12,
                color: "#dc2626",
              }}
            >
              {subscribeError}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}