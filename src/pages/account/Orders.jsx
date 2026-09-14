import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Package } from "lucide-react";

import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";

import "./Account.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Orders() {
  const { user } = useAuth();

  const [searchParams] = useSearchParams();
  const filter = searchParams.get("status");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // Get Customer Orders
  // =========================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("shophub_token");

        const response = await fetch(
`${API_URL}/api/orders/my-orders`,          {
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
            data.message || "Failed to fetch orders"
          );
        }

        // Make sure response is an array
        const allOrders = Array.isArray(data)
          ? data
          : [];

        // Show only logged-in customer's orders
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
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  // =========================
  // Filter Orders
  // =========================

  const filteredOrders = orders.filter((order) => {
    const status = (
      order.status || "pending"
    ).toLowerCase();

    // Active / pending orders
    if (filter === "pending") {
      return [
        "pending",
        "confirmed",
        "processing",
        "shipped",
      ].includes(status);
    }

    // Completed orders
    if (filter === "completed") {
      return status === "delivered";
    }

    // All orders
    return true;
  });

  // =========================
  // Page Title
  // =========================

  const pageTitle =
    filter === "pending"
      ? "Pending Orders"
      : filter === "completed"
      ? "Completed Orders"
      : "My Orders";

  const pageDescription =
    filter === "pending"
      ? "Track your active and pending orders"
      : filter === "completed"
      ? "View your completed orders"
      : "Track and manage your order history";

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div>
        <div className="account-page-title">
          <h2>{pageTitle}</h2>

          <p>{pageDescription}</p>
        </div>

        <p>Loading orders...</p>
      </div>
    );
  }

  // =========================
  // Empty Orders
  // =========================

  if (filteredOrders.length === 0) {
    return (
      <div>
        <div className="account-page-title">
          <h2>{pageTitle}</h2>

          <p>{pageDescription}</p>
        </div>

        <EmptyState
          icon={<Package size={48} />}
          title={
            filter === "pending"
              ? "No pending orders"
              : filter === "completed"
              ? "No completed orders"
              : "No orders yet"
          }
          message={
            filter === "pending"
              ? "You don't have any active orders."
              : filter === "completed"
              ? "You don't have any completed orders yet."
              : "When you place an order, it will show up here."
          }
          actionLabel="Start Shopping"
          actionTo="/shop"
        />
      </div>
    );
  }

  // =========================
  // Render Orders
  // =========================

  return (
    <div>
      {/* Page Header */}

      <div className="account-page-title">
        <h2>{pageTitle}</h2>

        <p>{pageDescription}</p>
      </div>

      {/* Orders */}

      {filteredOrders.map((order) => {
        const status =
          order.status || "pending";

        const formattedStatus =
          status.charAt(0).toUpperCase() +
          status.slice(1);

        const orderDate = order.createdAt
          ? new Date(
              order.createdAt
            ).toLocaleDateString()
          : "-";

        return (
          <div
            key={order._id || order.id}
            className="card card-pad mb-16"
          >
            {/* =========================
                Order Header
            ========================= */}

            <div className="flex-between mb-16">
              <div>
                <strong>
                  #{order._id || order.id}
                </strong>

                <p
                  className="text-muted"
                  style={{
                    fontSize: "0.8rem",
                  }}
                >
                  Placed on {orderDate}
                </p>
              </div>

              <span
                className={`status-pill status-${status.toLowerCase()}`}
              >
                {formattedStatus}
              </span>
            </div>

            {/* =========================
                Product Images
            ========================= */}

            <div
              className="flex gap-8"
              style={{
                marginBottom: 16,
              }}
            >
              {Array.isArray(order.items) &&
                order.items.map(
                  (item, index) => {
                    let imageUrl =
                      "https://via.placeholder.com/100x100?text=Product";

                    if (item.image) {
                      if (
                        item.image.startsWith(
                          "http"
                        )
                      ) {
                        imageUrl =
                          item.image;
                      } else {
                        imageUrl = `${API_URL}${
                          item.image.startsWith(
                            "/"
                          )
                            ? item.image
                            : `/${item.image}`
                        }`;
                      }
                    }

                    return (
                      <img
                        key={`${item.productId || item._id || "product"}-${index}`}
                        src={imageUrl}
                        alt={
                          item.name ||
                          "Product"
                        }
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 8,
                          objectFit:
                            "cover",
                        }}
                        onError={(event) => {
                          event.currentTarget.src =
                            "https://via.placeholder.com/100x100?text=Product";
                        }}
                      />
                    );
                  }
                )}
            </div>

            {/* =========================
                Order Footer
            ========================= */}

            <div className="flex-between">
              <div>
                <span
                  className="text-muted"
                  style={{
                    fontSize: "0.82rem",
                  }}
                >
                  Payment:{" "}
                  {order.paymentMethod ===
                  "cod"
                    ? "Cash on Delivery"
                    : "Card"}

                  {" · Total: "}
                </span>

                <strong>
                  $
                  {Number(
                    order.total || 0
                  ).toFixed(2)}
                </strong>
              </div>

              <Link
                to={`/account/orders/${
                  order._id || order.id
                }`}
                className="btn btn-outline btn-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}