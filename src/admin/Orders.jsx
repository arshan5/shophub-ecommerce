import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";

import SearchBar from "../components/SearchBar";
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const navigate = useNavigate();

  // =========================
  // GET ORDERS
  // =========================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token =
          localStorage.getItem("shophub_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
            "Failed to fetch orders"
          );
        }

        const data =
          await response.json();

        setOrders(data);
      } catch (error) {
        console.error(
          "Failed to fetch orders:",
          error
        );

        showToast(
          "Failed to load orders.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, showToast]);





  const handleDelete = async (orderId) => {
  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this order?"
  );

  if (!confirmed) return;

  try {
    const token =
      localStorage.getItem("shophub_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete order."
      );
    }

    setOrders((prevOrders) =>
      prevOrders.filter(
        (order) => order._id !== orderId
      )
    );

    showToast(
      "Order deleted successfully.",
      "success"
    );
  } catch (error) {
    console.error(
      "Delete order error:",
      error
    );

    showToast(
      error.message || "Failed to delete order.",
      "error"
    );
  }
};
  // =========================
  // FILTER ORDERS
  // =========================

  const filtered = orders.filter(
    (order) => {
      const orderId =
        order._id?.toLowerCase() || "";

      const customerName =
        `${order.customer?.firstName || ""} ${
          order.customer?.lastName || ""
        }`.toLowerCase();

      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        orderId.includes(
          searchValue
        ) ||
        customerName.includes(
          searchValue
        );

      const rawStatus =
        order.status || "Pending";

      const orderStatus =
        rawStatus
          .charAt(0)
          .toUpperCase() +
        rawStatus.slice(1);

      const matchesStatus =
        !statusFilter ||
        orderStatus === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1>Orders</h1>

            <p>
              Manage and track customer
              orders
            </p>
          </div>
        </div>

        <p>Loading orders...</p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>

          <p>
            Manage and track customer
            orders
          </p>
        </div>
      </div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="admin-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by order ID or customer..."
        />

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option value="">
            All Statuses
          </option>

          {statuses.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}
        </select>
      </div>

      {/* =========================
          ORDERS TABLE
      ========================= */}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map(
                (order) => {
                  const customerName =
                    `${order.customer?.firstName || ""} ${
                      order.customer?.lastName || ""
                    }`.trim();

                  const rawStatus =
                    order.status ||
                    "Pending";

                  const status =
                    rawStatus
                      .charAt(0)
                      .toUpperCase() +
                    rawStatus.slice(1);

                  return (
                    <tr
                      key={order._id}
                    >
                      {/* ORDER ID */}

                      <td>
                        {order._id}
                      </td>

                      {/* CUSTOMER */}

                      <td>
                        {customerName ||
                          "Guest Customer"}
                      </td>

                      {/* DATE */}

                      <td>
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* TOTAL */}

                      <td>
                        $
                        {Number(
                          order.total || 0
                        ).toFixed(2)}
                      </td>

                      {/* PAYMENT */}

                      <td>
                        {order.paymentMethod ===
                        "cod"
                          ? "Cash on Delivery"
                          : "Card"}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`status-pill status-${rawStatus.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <div className="table-actions">
                          <Link
  to={`/admin/orders/${order._id}`}
  title="View"
>
  <Eye size={14} />
</Link>

<button
  type="button"
  title="Delete"
  onClick={() => handleDelete(order._id)}
  className="delete-order-btn"
>
  <Trash2 size={14} />
</button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "30px",
                  }}
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}