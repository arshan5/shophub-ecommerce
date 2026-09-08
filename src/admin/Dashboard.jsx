import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";
import "./Admin.css";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("shophub_token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          ordersResponse,
          productsResponse,
          usersResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch("http://localhost:5000/api/orders", {
            headers,
          }),

          fetch("http://localhost:5000/api/products", {
            headers,
          }),

          fetch("http://localhost:5000/api/auth/users", {
            headers,
          }),

          fetch("http://localhost:5000/api/categories"),
        ]);

        if (
          ordersResponse.status === 401 ||
          productsResponse.status === 401 ||
          usersResponse.status === 401
        ) {
          window.location.href = "/login";
          return;
        }

        if (
          ordersResponse.status === 403 ||
          productsResponse.status === 403 ||
          usersResponse.status === 403
        ) {
          window.location.href = "/account";
          return;
        }

        const ordersData = await ordersResponse.json();
        const productsData = await productsResponse.json();
        const usersData = await usersResponse.json();
        const categoriesData = await categoriesResponse.json();

        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setCategories(
          Array.isArray(categoriesData) ? categoriesData : []
        );
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order.total || 0);
  }, 0);

  // Get top products based on quantity sold
  const productSales = {};

  orders.forEach((order) => {
    if (!order.items) return;

    order.items.forEach((item) => {
      const productId =
        item.product?._id ||
        item.product?.id ||
        item.product ||
        item.productId;

      if (!productId) return;

      if (!productSales[productId]) {
        productSales[productId] = 0;
      }

      productSales[productId] += Number(item.quantity || 1);
    });
  });

  const topProducts = [...products]
    .map((product) => ({
      ...product,
      sold: productSales[product._id] || 0,
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Last 6 months sales
  const now = new Date();

  const monthlySales = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const monthName = date.toLocaleString("en-US", {
      month: "short",
    });

    const month = date.getMonth();
    const year = date.getFullYear();

    const monthRevenue = orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt || order.date);

        return (
          orderDate.getMonth() === month &&
          orderDate.getFullYear() === year
        );
      })
      .reduce((sum, order) => {
        return sum + Number(order.total || 0);
      }, 0);

    monthlySales.push({
      month: monthName,
      value: monthRevenue,
    });
  }

  const maxSales = Math.max(
    ...monthlySales.map((m) => m.value),
    1
  );

  const stats = [
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      color: "green",
    },
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: orders.length,
      color: "blue",
    },
    {
      icon: Users,
      label: "Total Customers",
      value: users.filter(
        (user) => user.role !== "admin"
      ).length,
      color: "amber",
    },
    {
      icon: Package,
      label: "Total Products",
      value: products.length,
      color: "red",
    },
  ];

  const getCustomerName = (order) => {
    if (order.customer) {
      if (typeof order.customer === "string") {
        return order.customer;
      }

      return (
        order.customer.name ||
        order.customer.email ||
        "Customer"
      );
    }

    if (order.user) {
      if (typeof order.user === "string") {
        return order.user;
      }

      return (
        order.user.name ||
        order.user.email ||
        "Customer"
      );
    }

    return "Customer";
  };

  const getOrderDate = (order) => {
    const date = new Date(
      order.createdAt || order.date
    );

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString();
  };

  const getPayment = (order) => {
    return (
      order.paymentMethod ||
      order.payment ||
      "N/A"
    );
  };

  const getStatus = (order) => {
    const status = order.status || "Pending";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your store's performance</p>
          </div>
        </div>

        <div className="chart-placeholder">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your store's performance</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="stat-cards">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
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
          </div>
        ))}
      </div>

      {/* Sales + Top Products */}
      <div
        className="grid grid-2"
        style={{
          gridTemplateColumns: "1.4fr 1fr",
          alignItems: "start",
          marginBottom: 24,
        }}
      >
        {/* Sales Overview */}
        <div className="chart-placeholder">
          <h3 style={{ fontSize: "1rem" }}>
            Sales Overview (last 6 months)
          </h3>

          <div className="bar-chart">
            {monthlySales.map((m) => (
              <div
                key={m.month}
                className="bar-chart-col"
              >
                <div
                  className="bar-chart-bar"
                  style={{
                    height: `${
                      (m.value / maxSales) * 100
                    }%`,
                  }}
                  title={`$${m.value.toFixed(2)}`}
                />

                <span className="bar-chart-label">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="chart-placeholder">
          <h3
            style={{
              fontSize: "1rem",
              marginBottom: 14,
            }}
          >
            Top Products
          </h3>

          {topProducts.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
              }}
            >
              No products available.
            </p>
          ) : (
            topProducts.map((p) => (
              <div
                key={p._id}
                className="flex-between"
                style={{
                  padding: "10px 0",
                  borderBottom:
                    "1px solid var(--color-border)",
                }}
              >
                <div
                  className="flex"
                  style={{
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <img
  src={
    p.image
      ? p.image.startsWith("http")
        ? p.image
        : `http://localhost:5000${p.image}`
      : "https://via.placeholder.com/36"
  }
  alt={p.name}
  style={{
    width: 36,
    height: 36,
    borderRadius: 6,
    objectFit: "cover",
  }}
/>

                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {p.name}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: "0.8rem",
                    color:
                      "var(--color-text-muted)",
                  }}
                >
                  {p.sold} sold
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="chart-placeholder">
        <div
          className="flex-between"
          style={{ marginBottom: 16 }}
        >
          <h3 style={{ fontSize: "1rem" }}>
            Recent Orders
          </h3>

          <Link
            to="/admin/orders"
            className="text-link"
          >
            View All
          </Link>
        </div>

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
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: 20,
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((o) => {
                  const status = getStatus(o);

                  return (
                    <tr key={o._id}>
                      <td>
                        <Link
                          to={`/admin/orders/${o._id}`}
                          className="text-link"
                        >
                          {o._id}
                        </Link>
                      </td>

                      <td>
                        {getCustomerName(o)}
                      </td>

                      <td>
                        {getOrderDate(o)}
                      </td>

                      <td>
                        $
                        {Number(
                          o.total || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {getPayment(o)}
                      </td>

                      <td>
                        <span
                          className={`status-pill status-${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}