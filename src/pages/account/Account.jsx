import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  Heart,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

import "./Account.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Account() {
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("shophub_token");

        const response = await fetch(
          `${API_URL}/api/orders`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load orders"
          );
        }

        const allOrders = Array.isArray(data)
          ? data
          : [];

        const customerOrders = allOrders.filter(
          (order) =>
            order.customer?.email?.toLowerCase() ===
            user?.email?.toLowerCase()
        );

        setOrders(customerOrders);
      } catch (error) {
        console.error(
          "Failed to fetch orders:",
          error
        );
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const pending = orders.filter((order) =>
    [
      "pending",
      "processing",
      "confirmed",
      "shipped",
    ].includes(
      (order.status || "pending").toLowerCase()
    )
  ).length;

  const completed = orders.filter(
    (order) =>
      (order.status || "").toLowerCase() ===
      "delivered"
  ).length;

  const stats = [
    {
      icon: Package,
      label: "Total Orders",
      value: orders.length,
      color: "blue",
      link: "/account/orders",
    },
    {
      icon: Clock,
      label: "Pending Orders",
      value: pending,
      color: "amber",
      link: "/account/orders?status=pending",
    },
    {
      icon: CheckCircle2,
      label: "Completed Orders",
      value: completed,
      color: "green",
      link: "/account/orders?status=completed",
    },
    {
      icon: Heart,
      label: "Wishlist Items",
      value: wishlistCount,
      color: "red",
      link: "/wishlist",
    },
  ];

  return (
    <div>
      <div className="account-page-title">
        <h2>
          Welcome back,{" "}
          {user?.firstName || "Guest"}
        </h2>

        <p>
          Here's an overview of your account activity.
        </p>
      </div>

      <div className="stat-cards dashboard-stats">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.link}
            className="stat-card"
            style={{
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <div
              className={`stat-card-icon ${s.color}`}
            >
              <s.icon size={20} />
            </div>

            <div>
              <div className="stat-card-value">
                {s.value}
              </div>

              <div className="stat-card-label">
                {s.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-recent">
        <h3>Recent Orders</h3>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>
            You haven't placed any orders yet.
          </p>
        ) : (
          orders
            .slice(0, 3)
            .map((order) => {
              const orderId =
                order._id || order.id;

              const orderDate = order.createdAt
                ? new Date(
                    order.createdAt
                  ).toLocaleDateString()
                : "-";

              const status =
                order.status || "Pending";

              return (
                <div
                  key={orderId}
                  className="order-row"
                >
                  <div>
                    <div className="order-row-label">
                      Order ID
                    </div>

                    <Link
                      to={`/account/orders/${orderId}`}
                      className="text-link"
                    >
                      #{String(orderId).slice(-8)}
                    </Link>
                  </div>

                  <div>
                    <div className="order-row-label">
                      Date
                    </div>

                    <span>
                      {orderDate}
                    </span>
                  </div>

                  <div>
                    <div className="order-row-label">
                      Total
                    </div>

                    <span>
                      $
                      {Number(
                        order.total || 0
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <div className="order-row-label">
                      Status
                    </div>

                    <span
                      className={`status-pill status-${status.toLowerCase()}`}
                    >
                      {status}
                    </span>
                  </div>

                  <Link
                    to={`/account/orders/${orderId}`}
                    className="btn btn-outline btn-sm"
                  >
                    View
                  </Link>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}