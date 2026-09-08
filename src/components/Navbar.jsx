import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

import "./Navbar.css";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Store settings
  const [storeName, setStoreName] = useState("ShopHub");

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const navigate = useNavigate();

  // =========================
  // GET STORE SETTINGS
  // =========================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
const token = localStorage.getItem("shophub_token");
        if (!token) {
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/settings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.storeName) {
          setStoreName(data.storeName);
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
  // MOBILE MENU
  // =========================

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // =========================
  // SEARCH
  // =========================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(
        `/shop?search=${encodeURIComponent(
          searchTerm.trim()
        )}`
      );

      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <>
      {/* =========================
          ANNOUNCEMENT BAR
      ========================= */}

      <div className="announcement-bar">
        Free shipping on orders over $50 — Shop the new
        arrivals today
      </div>

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="navbar">
        <div className="container navbar-inner">

          {/* Mobile Menu Button */}

          <button
            className="hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* =========================
              DYNAMIC LOGO
          ========================= */}

          <Link to="/" className="navbar-logo">
            {storeName}
          </Link>

          {/* =========================
              DESKTOP NAVIGATION
          ========================= */}

          <nav className="navbar-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
                end={link.to === "/"}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* =========================
              NAVBAR ACTIONS
          ========================= */}

          <div className="navbar-actions">

            {/* Search */}

            <button
              className="icon-btn"
              onClick={() =>
                setSearchOpen((v) => !v)
              }
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}

            <Link
              to="/wishlist"
              className="icon-btn"
              aria-label="Wishlist"
            >
              <Heart size={20} />

              {wishlistCount > 0 && (
                <span className="icon-badge">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}

            <Link
              to="/cart"
              className="icon-btn"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="icon-badge">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}

            <Link
              to={
                isAuthenticated
                  ? "/account"
                  : "/login"
              }
              className="icon-btn"
              aria-label="Account"
            >
              {isAuthenticated &&
              user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="navbar-avatar"
                />
              ) : (
                <User size={20} />
              )}
            </Link>

          </div>
        </div>

        {/* =========================
            SEARCH PANEL
        ========================= */}

        {searchOpen && (
          <div className="navbar-search-panel">
            <form
              className="container"
              onSubmit={handleSearchSubmit}
            >
              <Search size={18} />

              <input
                autoFocus
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              <button
                type="button"
                onClick={() =>
                  setSearchOpen(false)
                }
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* =========================
          MOBILE DRAWER OVERLAY
      ========================= */}

      <div
        className={`mobile-drawer-overlay ${
          menuOpen ? "open" : ""
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* =========================
          MOBILE DRAWER
      ========================= */}

      <div
        className={`mobile-drawer ${
          menuOpen ? "open" : ""
        }`}
      >
        <div className="mobile-drawer-header">

          {/* Dynamic Mobile Logo */}

          <Link
            to="/"
            className="navbar-logo"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            {storeName}
          </Link>

          <button
            className="icon-btn"
            onClick={() =>
              setMenuOpen(false)
            }
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Mobile Navigation */}

        <nav className="mobile-drawer-links">

          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() =>
                setMenuOpen(false)
              }
              end={link.to === "/"}
            >
              {link.label}
            </NavLink>
          ))}

          <NavLink
            to={
              isAuthenticated
                ? "/account"
                : "/login"
            }
            onClick={() =>
              setMenuOpen(false)
            }
          >
            {isAuthenticated
              ? "My Account"
              : "Login / Register"}
          </NavLink>

        </nav>
      </div>
    </>
  );
}