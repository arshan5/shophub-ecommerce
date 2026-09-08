import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";
import "./Footer.css";

// Facebook icon
function Facebook(props) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12" />
    </svg>
  );
}

// Instagram icon
function Instagram(props) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

// Twitter icon
function Twitter(props) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M18.9 3H21l-6.55 7.49L22.5 21h-6.62l-4.63-6.06L5.94 21H3.8l7.03-8.03L2.5 3h6.78l4.18 5.54L18.9 3zm-1.16 16.17h1.17L7.34 4.75H6.08l11.66 14.42z" />
    </svg>
  );
}

// YouTube icon
function Youtube(props) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M23.5 6.5s-.23-1.64-.94-2.36c-.9-.95-1.9-.95-2.36-1C16.9 3 12 3 12 3h-.01s-4.9 0-8.2.14c-.46.05-1.46.05-2.36 1C.73 4.86.5 6.5.5 6.5S.27 8.4.27 10.3v1.4C.27 13.6.5 15.5.5 15.5s.23 1.64.93 2.36c.9.95 2.08.92 2.6 1.02C5.9 19 12 19 12 19s4.9-.01 8.2-.15c.46-.06 1.46-.06 2.36-1.01.71-.72.94-2.36.94-2.36s.23-1.9.23-3.8v-1.4c0-1.9-.23-3.8-.23-3.8zM9.7 14.2V8.4l6.1 2.9-6.1 2.9z" />
    </svg>
  );
}

export default function Footer() {
  // =========================
  // STORE SETTINGS
  // =========================

  const [storeName, setStoreName] = useState("ShopHub");

  const [storeEmail, setStoreEmail] =
    useState("support@shophub.com");

  // =========================
  // CATEGORIES
  // =========================

  const [categories, setCategories] = useState([]);

  // =========================
  // NEWSLETTER STATES
  // =========================

  const [subscribeMessage, setSubscribeMessage] =
    useState("");

  const [subscribeError, setSubscribeError] =
    useState("");

  const [subscribing, setSubscribing] =
    useState(false);

  // =========================
  // GET PUBLIC SETTINGS
  // =========================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/settings/public"
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.storeName) {
          setStoreName(data.storeName);
        }

        if (data.storeEmail) {
          setStoreEmail(data.storeEmail);
        }
      } catch (error) {
        console.error(
          "Failed to fetch store settings:",
          error
        );
      }
    };

    fetchSettings();
  }, []);

  // =========================
  // GET CATEGORIES FROM BACKEND
  // =========================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/categories"
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setCategories(data);
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error
        );
      }
    };

    fetchCategories();
  }, []);

  // =========================
  // NEWSLETTER
  // =========================

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;

    setSubscribeMessage("");
    setSubscribeError("");
    setSubscribing(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/newsletter/subscribe",
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

      const data = await response.json();

      if (!response.ok) {
        setSubscribeError(
          data.message || "Subscription failed."
        );

        return;
      }

      setSubscribeMessage(
        data.message || "Thanks for subscribing!"
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

  return (
    <footer className="footer">
      <div className="container footer-grid">

        {/* BRAND */}

        <div className="footer-col footer-brand">
          <Link
            to="/"
            className="navbar-logo"
          >
            {storeName}
          </Link>

          <p>
            Premium products curated for modern
            living. Quality you can trust, delivered
            right to your door.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <Facebook size={17} />
            </a>

            <a href="#" aria-label="Instagram">
              <Instagram size={17} />
            </a>

            <a href="#" aria-label="Twitter">
              <Twitter size={17} />
            </a>

            <a href="#" aria-label="Youtube">
              <Youtube size={17} />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}

        <div className="footer-col">
          <h4>Quick Links</h4>

          <Link to="/shop">
            Shop
          </Link>

          <Link to="/categories">
            Categories
          </Link>

          <Link to="/about">
            About Us
          </Link>

          <Link to="/contact">
            Contact
          </Link>

          <Link to="/faq">
            FAQ
          </Link>
        </div>

        {/* CUSTOMER SERVICE */}

        <div className="footer-col">
          <h4>Customer Service</h4>

          <Link to="/account">
            My Account
          </Link>

          <Link to="/account/orders">
            Track Order
          </Link>

          <Link to="/wishlist">
            Wishlist
          </Link>

          <Link to="/cart">
            Shopping Cart
          </Link>

          <Link to="/faq">
            Shipping & Returns
          </Link>
        </div>

        {/* CATEGORIES */}

        <div className="footer-col">
          <h4>Categories</h4>

          {categories.slice(0, 5).map((category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category._id}`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* NEWSLETTER */}

        <div className="footer-col footer-newsletter">
          <h4>Stay Updated</h4>

          <p>
            Subscribe for exclusive deals and new
            arrivals.
          </p>

          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              required
            />

            <button
              type="submit"
              className="btn btn-accent btn-sm"
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

          {/* CONTACT INFORMATION */}

          <div className="footer-contact">
            <span>
              <MapPin size={14} />
              221 Maple Street, Lahore, PK
            </span>

            <span>
              <Phone size={14} />
              +92 300 1234567
            </span>

            <span>
              <Mail size={14} />
              {storeEmail}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}

      <div className="footer-bottom">
        <div className="container flex-between">
          <span>
            © {new Date().getFullYear()}{" "}
            {storeName}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}