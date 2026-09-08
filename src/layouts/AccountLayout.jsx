import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  User,
  Package,
  Heart,
  MapPin,
  Lock,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

import Breadcrumb from "../components/Breadcrumb";

import "./AccountLayout.css";

const links = [
  {
    to: "/account",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/account/profile",
    label: "Profile",
    icon: User,
  },
  {
    to: "/account/orders",
    label: "My Orders",
    icon: Package,
  },
  {
    to: "/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    to: "/account/addresses",
    label: "Saved Addresses",
    icon: MapPin,
  },
  {
    to: "/account/change-password",
    label: "Change Password",
    icon: Lock,
  },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  const navigate = useNavigate();

  const getAvatarUrl = () => {
    if (!user?.avatar) {
      return "https://i.pravatar.cc/80";
    }

    if (user.avatar.startsWith("http")) {
      return user.avatar;
    }

    return `http://localhost:5000${
      user.avatar.startsWith("/")
        ? user.avatar
        : `/${user.avatar}`
    }`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container">
      <Breadcrumb
        items={[
          {
            label: "Home",
            to: "/",
          },
          {
            label: "My Account",
          },
        ]}
      />

      <div className="account-layout">
        {/* Sidebar */}
        <aside className="account-sidebar">
          <div className="account-sidebar-user">
            <img
              src={getAvatarUrl()}
              alt="Profile"
              onError={(e) => {
                e.currentTarget.src =
                  "https://i.pravatar.cc/80";
              }}
            />

            <div>
              <strong>
                {user
                  ? `${user.firstName || ""} ${
                      user.lastName || ""
                    }`.trim() || "User"
                  : "Guest"}
              </strong>

              <span>
                {user?.email || ""}
              </span>
            </div>
          </div>

          <nav>
            {links.map(
              ({
                to,
                label,
                icon: Icon,
                end,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? "active" : ""
                  }
                >
                  <Icon size={17} />

                  <span>{label}</span>

                  {label === "Wishlist" &&
                    wishlistCount > 0 && (
                      <span className="account-nav-count">
                        {wishlistCount}
                      </span>
                    )}
                </NavLink>
              )
            )}

            <button
              type="button"
              className="account-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />

              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Account Content */}
        <main className="account-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}