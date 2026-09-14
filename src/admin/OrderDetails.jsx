import { useEffect, useState } from "react";
import {
  useParams,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { useToast } from "../context/ToastContext";
import "./Admin.css";

const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // =========================
  // GET ORDER
  // =========================

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token =
          localStorage.getItem("shophub_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("shophub_token");
          localStorage.removeItem("shophub_auth_user");

          navigate("/login");
          return;
        }

        if (response.status === 403) {
          showToast(
            "Admin access required.",
            "error"
          );

          navigate("/account");
          return;
        }

        if (!response.ok) {
          throw new Error("Order not found");
        }

        const data = await response.json();

        setOrder(data);

        const currentStatus =
          data.status
            ?.charAt(0)
            .toUpperCase() +
          data.status?.slice(1);

        setStatus(
          currentStatus || "Pending"
        );

        setNote(data.note || "");
      } catch (error) {
        console.error(
          "Failed to fetch order:",
          error
        );

        showToast(
          "Failed to load order.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, showToast]);

  // =========================
  // CHANGE STATUS
  // =========================

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const handleUpdateStatus = async () => {
    if (
      status === "Cancelled" &&
      !note.trim()
    ) {
      showToast(
        "Please enter a cancellation reason",
        "error"
      );

      return;
    }

    setUpdating(true);

    try {
      const token =
        localStorage.getItem("shophub_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: status.toLowerCase(),
            note: note.trim(),
          }),
        }
      );

      const data = await response.json();

      // Unauthorized
      if (response.status === 401) {
        localStorage.removeItem(
          "shophub_token"
        );

        localStorage.removeItem(
          "shophub_auth_user"
        );

        navigate("/login");
        return;
      }

      // Not admin
      if (response.status === 403) {
        showToast(
          "Admin access required.",
          "error"
        );

        navigate("/account");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      // Update local order
      setOrder((prev) => ({
        ...prev,
        status: status.toLowerCase(),
        note: note.trim(),
      }));

      showToast(
        `Order status updated to ${status}`,
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error
      );

      showToast(
        error.message ||
          "Failed to update order status",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1>Order Details</h1>
            <p>Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // ORDER NOT FOUND
  // =========================

  if (!order) {
    return (
      <Navigate
        to="/admin/orders"
        replace
      />
    );
  }

  const customerName =
    `${order.customer?.firstName || ""} ${
      order.customer?.lastName || ""
    }`.trim();

  const customer =
    order.customer || {};

  // =========================
  // UI
  // =========================

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="admin-page-header">
        <div>
          <h1>
            Order {order._id}
          </h1>

          <p>
            Placed on{" "}
            {new Date(
              order.createdAt
            ).toLocaleDateString()}{" "}
            by{" "}
            {customerName ||
              "Guest Customer"}
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="btn btn-outline btn-sm"
        >
          Back to Orders
        </Link>
      </div>

      {/* MAIN GRID */}

      <div
        className="grid grid-2"
        style={{
          gridTemplateColumns:
            "1.4fr 1fr",
          alignItems: "start",
        }}
      >
        {/* LEFT SIDE */}

        <div className="chart-placeholder">
          <h3
            style={{
              fontSize: "1rem",
              marginBottom: 14,
            }}
          >
            Items
          </h3>

          {order.items?.map(
            (item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex"
                style={{
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <img
                  src={
  item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${import.meta.env.VITE_API_URL}${item.image}`
    : "https://via.placeholder.com/56"
}
                  alt={item.name}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <strong
                    style={{
                      fontSize:
                        "0.9rem",
                    }}
                  >
                    {item.name}
                  </strong>

                  <p
                    className="text-muted"
                    style={{
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    Qty:{" "}
                    {item.quantity} × $
                    {Number(
                      item.price
                    ).toFixed(2)}
                  </p>

                  {item.color && (
                    <p
                      className="text-muted"
                      style={{
                        fontSize:
                          "0.75rem",
                      }}
                    >
                      Color:{" "}
                      {item.color}
                    </p>
                  )}

                  {item.size && (
                    <p
                      className="text-muted"
                      style={{
                        fontSize:
                          "0.75rem",
                      }}
                    >
                      Size: {item.size}
                    </p>
                  )}
                </div>

                <strong>
                  $
                  {(
                    Number(
                      item.price
                    ) *
                    Number(
                      item.quantity
                    )
                  ).toFixed(2)}
                </strong>
              </div>
            )
          )}

          <hr />

          <div className="summary-row">
            <span>Subtotal</span>

            <span>
              $
              {Number(
                order.subtotal || 0
              ).toFixed(2)}
            </span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>

            <span>
              {Number(
                order.delivery || 0
              ) === 0
                ? "Free"
                : `$${Number(
                    order.delivery
                  ).toFixed(2)}`}
            </span>
          </div>

          <div className="summary-row">
            <span>Tax</span>

            <span>
              $
              {Number(
                order.tax || 0
              ).toFixed(2)}
            </span>
          </div>

          <div className="summary-row summary-total">
            <span>Total</span>

            <span>
              $
              {Number(
                order.total || 0
              ).toFixed(2)}
            </span>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div>
          {/* UPDATE STATUS */}

          <div className="chart-placeholder mb-16">
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: 14,
              }}
            >
              Update Status
            </h3>

            <select
              className="form-control"
              value={status}
              onChange={
                handleStatusChange
              }
              disabled={updating}
            >
              {statuses.map(
                (s) => (
                  <option
                    key={s}
                    value={s}
                  >
                    {s}
                  </option>
                )
              )}
            </select>

            {/* CANCELLATION NOTE */}

            {status ===
              "Cancelled" && (
              <div
                className="form-group"
                style={{
                  marginTop: 16,
                }}
              >
                <label className="form-label">
                  Cancellation Note
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  value={note}
                  onChange={(e) =>
                    setNote(
                      e.target.value
                    )
                  }
                  placeholder="Enter the reason for cancelling this order..."
                  disabled={updating}
                />

                <p className="form-hint">
                  This note can later
                  be sent to the customer
                  by email.
                </p>
              </div>
            )}

            {/* UPDATE BUTTON */}

            <button
              className="btn btn-primary"
              onClick={
                handleUpdateStatus
              }
              disabled={updating}
              style={{
                marginTop: 16,
              }}
            >
              {updating
                ? "Updating..."
                : "Update Status"}
            </button>

            <p className="form-hint mt-16">
              Current:{" "}
              <span
                className={`status-pill status-${status.toLowerCase()}`}
              >
                {updating
                  ? "Updating..."
                  : status}
              </span>
            </p>
          </div>

          {/* CUSTOMER */}

          <div className="chart-placeholder mb-16">
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: 10,
              }}
            >
              Customer
            </h3>

            <p
              style={{
                fontSize:
                  "0.88rem",
              }}
              className="text-muted"
            >
              {customerName ||
                "Guest Customer"}
              <br />

              {customer.email ||
                "-"}
              <br />

              {customer.phone ||
                "-"}
            </p>
          </div>

          {/* SHIPPING ADDRESS */}

          <div className="chart-placeholder mb-16">
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: 10,
              }}
            >
              Shipping Address
            </h3>

            <p
              style={{
                fontSize:
                  "0.88rem",
              }}
              className="text-muted"
            >
              {customer.address ||
                "-"}
              <br />

              {customer.city || "-"}
              ,{" "}
              {customer.country ||
                "-"}{" "}
              {customer.postalCode ||
                ""}
              <br />

              {customer.phone ||
                "-"}
            </p>
          </div>

          {/* PAYMENT */}

          <div className="chart-placeholder">
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: 10,
              }}
            >
              Payment
            </h3>

            <p
              style={{
                fontSize:
                  "0.88rem",
              }}
              className="text-muted"
            >
              {order.paymentMethod ===
              "cod"
                ? "Cash on Delivery"
                : "Credit / Debit Card"}
            </p>

            <p
              style={{
                fontSize:
                  "0.88rem",
              }}
              className="text-muted"
            >
              Payment Status:{" "}
              {order.paymentStatus ||
                "Pending"}
            </p>

            <p
              style={{
                fontSize:
                  "0.88rem",
              }}
              className="text-muted"
            >
              Delivery:{" "}
              {order.deliveryMethod ===
              "standard"
                ? "Standard Delivery"
                : "Express Delivery"}
            </p>
          </div>

          {/* SAVED NOTE */}

          {order.note && (
            <div
              className="chart-placeholder"
              style={{
                marginTop: 16,
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: 10,
                }}
              >
                Order Note
              </h3>

              <p
                className="text-muted"
                style={{
                  fontSize:
                    "0.88rem",
                }}
              >
                {order.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}