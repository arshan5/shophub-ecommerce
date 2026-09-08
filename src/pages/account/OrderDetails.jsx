import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./Account.css";

const API_URL = "http://localhost:5000";

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch Order
  // =========================

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("shophub_token");

        const response = await fetch(
          `${API_URL}/api/orders/${id}`,
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
            data.message ||
              "Failed to fetch order"
          );
        }

        // =========================
        // Check Customer
        // =========================

        const orderEmail =
          data.customer?.email?.toLowerCase();

        const userEmail =
          user?.email?.toLowerCase();

        if (
          !orderEmail ||
          !userEmail ||
          orderEmail !== userEmail
        ) {
          setOrder(null);
          return;
        }

        setOrder(data);
      } catch (error) {
        console.error(
          "Failed to fetch order:",
          error
        );

        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (id && user?.email) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [id, user]);

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div>
        <div className="account-page-title">
          <h2>Order Details</h2>

          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  // =========================
  // Order Not Found
  // =========================

  if (!order) {
    return (
      <Navigate
        to="/account/orders"
        replace
      />
    );
  }

  // =========================
  // Order Data
  // =========================

  const status = (
    order.status || "pending"
  ).toLowerCase();

  const formattedStatus =
    status.charAt(0).toUpperCase() +
    status.slice(1);

  const orderDate = order.createdAt
    ? new Date(
        order.createdAt
      ).toLocaleDateString()
    : "-";

  // =========================
  // Timeline
  // =========================

  const timelineSteps = [
    {
      key: "pending",
      label: "Pending",
      message: "Order placed",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      message: "Order confirmed",
    },
    {
      key: "processing",
      label: "Processing",
      message:
        "Order is being prepared",
    },
    {
      key: "shipped",
      label: "Shipped",
      message:
        "Order has been shipped",
    },
    {
      key: "delivered",
      label: "Delivered",
      message:
        "Order delivered",
    },
  ];

  const currentStatusIndex =
    timelineSteps.findIndex(
      (step) => step.key === status
    );

  return (
    <div>
      {/* =========================
          Page Header
      ========================= */}

      <div className="flex-between account-page-title">
        <div>
          <h2>
            Order #
            {order._id || order.id}
          </h2>

          <p>
            Placed on {orderDate}
          </p>
        </div>

        <span
          className={`status-pill status-${status}`}
        >
          {formattedStatus}
        </span>
      </div>

      {/* =========================
          Main Layout
      ========================= */}

      <div
        className="grid grid-2"
        style={{
          gridTemplateColumns:
            "1.4fr 1fr",
          alignItems: "start",
        }}
      >
        {/* =========================
            Left Side - Items
        ========================= */}

        <div className="card card-pad mb-16">
          <h3
            className="mb-16"
            style={{
              fontSize: "1rem",
            }}
          >
            Items
          </h3>

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
                  <div
                    key={`${
                      item.productId ||
                      item._id ||
                      "product"
                    }-${index}`}
                    className="flex"
                    style={{
                      gap: 14,
                      marginBottom: 16,
                    }}
                  >
                    {/* Product Image */}

                    <img
                      src={imageUrl}
                      alt={
                        item.name ||
                        "Product"
                      }
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        objectFit:
                          "cover",
                      }}
                      onError={(
                        event
                      ) => {
                        event.currentTarget.src =
                          "https://via.placeholder.com/100x100?text=Product";
                      }}
                    />

                    {/* Product Information */}

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <Link
                        to={`/product/${
                          item.productId ||
                          item._id
                        }`}
                        style={{
                          fontWeight: 600,
                          fontSize:
                            "0.9rem",
                        }}
                      >
                        {item.name}
                      </Link>

                      <p
                        className="text-muted"
                        style={{
                          fontSize:
                            "0.8rem",
                        }}
                      >
                        Qty:{" "}
                        {item.quantity}{" "}
                        × $
                        {Number(
                          item.price ||
                            0
                        ).toFixed(
                          2
                        )}
                      </p>

                      {item.color && (
                        <p
                          className="text-muted"
                          style={{
                            fontSize:
                              "0.8rem",
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
                              "0.8rem",
                          }}
                        >
                          Size:{" "}
                          {item.size}
                        </p>
                      )}
                    </div>

                    {/* Item Total */}

                    <strong>
                      $
                      {(
                        Number(
                          item.price ||
                            0
                        ) *
                        Number(
                          item.quantity ||
                            0
                        )
                      ).toFixed(2)}
                    </strong>
                  </div>
                );
              }
            )}

          {/* =========================
              Order Summary
          ========================= */}

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
            <span>Shipping</span>

            <span>
              {Number(
                order.delivery || 0
              ) === 0
                ? "Free"
                : `$${Number(
                    order.delivery ||
                      0
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

        {/* =========================
            Right Side
        ========================= */}

        <div>
          {/* =========================
              Order Timeline
          ========================= */}

          <div className="card card-pad mb-16">
            <h3
              className="mb-16"
              style={{
                fontSize: "1rem",
              }}
            >
              Order Timeline
            </h3>

            <div className="order-timeline">
              {timelineSteps.map(
                (step, index) => {
                  const done =
                    status !==
                      "cancelled" &&
                    currentStatusIndex >=
                      index;

                  return (
                    <div
                      key={step.key}
                      className={`timeline-step ${
                        done
                          ? "done"
                          : ""
                      }`}
                    >
                      <div className="timeline-dot" />

                      <div className="timeline-content">
                        <strong>
                          {step.label}
                        </strong>

                        <span>
                          {done
                            ? step.message
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}

              {/* Cancelled Order */}

              {status ===
                "cancelled" && (
                <div className="timeline-step done">
                  <div className="timeline-dot" />

                  <div className="timeline-content">
                    <strong>
                      Cancelled
                    </strong>

                    <span>
                      Order has been
                      cancelled
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cancellation Note */}

            {status ===
              "cancelled" &&
              order.note && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 8,
                    background:
                      "var(--color-bg-secondary)",
                  }}
                >
                  <strong
                    style={{
                      fontSize:
                        "0.85rem",
                    }}
                  >
                    Cancellation Note
                  </strong>

                  <p
                    className="text-muted"
                    style={{
                      marginTop: 5,
                      fontSize:
                        "0.82rem",
                    }}
                  >
                    {order.note}
                  </p>
                </div>
              )}
          </div>

          {/* =========================
              Shipping Address
          ========================= */}

          <div className="card card-pad mb-16">
            <h3
              className="mb-16"
              style={{
                fontSize: "1rem",
              }}
            >
              Shipping Address
            </h3>

            <p
              style={{
                fontSize: "0.88rem",
                lineHeight: 1.7,
              }}
              className="text-muted"
            >
              {
                order.customer
                  ?.firstName
              }{" "}
              {
                order.customer
                  ?.lastName
              }

              <br />

              {
                order.customer
                  ?.address
              }

              <br />

              {
                order.customer
                  ?.city
              }
              ,{" "}
              {
                order.customer
                  ?.country
              }{" "}
              {
                order.customer
                  ?.postalCode
              }

              <br />

              {
                order.customer
                  ?.phone
              }
            </p>
          </div>

          {/* =========================
              Payment Method
          ========================= */}

          <div className="card card-pad">
            <h3
              className="mb-16"
              style={{
                fontSize: "1rem",
              }}
            >
              Payment Method
            </h3>

            <p
              style={{
                fontSize: "0.88rem",
              }}
              className="text-muted"
            >
              {order.paymentMethod ===
              "cod"
                ? "Cash on Delivery"
                : "Credit / Debit Card"}
            </p>

            <p
              className="text-muted"
              style={{
                fontSize: "0.8rem",
                marginTop: 6,
              }}
            >
              Payment status:{" "}
              {order.paymentMethod ===
              "cod"
                ? "Pending"
                : "Paid"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}