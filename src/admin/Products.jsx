import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import SearchBar from "../components/SearchBar";
import { useToast } from "../context/ToastContext";
import "./Admin.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("");

  const { showToast } = useToast();

  // =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token =
          localStorage.getItem(
            "shophub_token"
          );

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        // =========================
        // AUTHORIZATION ERROR
        // =========================

        if (response.status === 401) {
          showToast(
            "Your session has expired. Please login again.",
            "error"
          );

          localStorage.removeItem(
            "shophub_token"
          );

          localStorage.removeItem(
            "shophub_auth_user"
          );

          window.location.href =
            "/login";

          return;
        }

        if (response.status === 403) {
          showToast(
            "Admin access required.",
            "error"
          );

          window.location.href =
            "/account";

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch products"
          );
        }

        setProducts(data);
      } catch (error) {
        console.error(
          "Failed to fetch products:",
          error
        );

        showToast(
          error.message ||
            "Failed to load products",
          "error"
        );
      }
    };

    fetchProducts();
  }, [showToast]);

  // =========================
  // FETCH CATEGORIES
  // =========================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/categories`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const data =
          await response.json();

        setCategories(data);
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error
        );

        showToast(
          "Failed to load categories",
          "error"
        );
      }
    };

    fetchCategories();
  }, [showToast]);

  // =========================
  // FILTER PRODUCTS
  // =========================

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchesCategory =
      !categoryFilter ||
      p.category === categoryFilter;

    return (
      matchesSearch &&
      matchesCategory
    );
  });

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDelete = async (
    id,
    name
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${name}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "shophub_token"
        );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      // =========================
      // AUTHORIZATION ERROR
      // =========================

      if (response.status === 401) {
        showToast(
          "Your session has expired. Please login again.",
          "error"
        );

        localStorage.removeItem(
          "shophub_token"
        );

        localStorage.removeItem(
          "shophub_auth_user"
        );

        window.location.href =
          "/login";

        return;
      }

      if (response.status === 403) {
        showToast(
          "Admin access required.",
          "error"
        );

        window.location.href =
          "/account";

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete product"
        );
      }

      setProducts((prev) =>
        prev.filter(
          (p) => p._id !== id
        )
      );

      showToast(
        "Product deleted successfully",
        "success"
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      showToast(
        error.message ||
          "Failed to delete product",
        "error"
      );
    }
  };

  return (
    <div>
      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="admin-page-header">
        <div>
          <h1>Products</h1>

          <p>
            Manage your product catalog
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="btn btn-primary"
        >
          <Plus size={16} />

          Add Product
        </Link>
      </div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="admin-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />

        <select
          className="admin-filter-select"
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
        >
          <option value="">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category._id}
              value={category._id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* =========================
          PRODUCTS TABLE
      ========================= */}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const productCategory =
                categories.find(
                  (category) =>
                    category._id ===
                    p.category
                );

              return (
                <tr key={p._id}>
                  {/* IMAGE */}

                  <td>
                    <img
                      src={
                        p.image
                          ? `${import.meta.env.VITE_API_URL}${p.image}`
                          : "/placeholder.png"
                      }
                      alt={p.name}
                      className="table-thumb"
                    />
                  </td>

                  {/* NAME */}

                  <td>
                    {p.name}
                  </td>

                  {/* CATEGORY */}

                  <td
                    style={{
                      textTransform:
                        "capitalize",
                    }}
                  >
                    {productCategory
                      ? productCategory.name
                      : "Unknown"}
                  </td>

                  {/* PRICE */}

                  <td>
                    $
                    {Number(
                      p.price
                    ).toFixed(2)}
                  </td>

                  {/* STOCK */}

                  <td>
                    {p.stock}
                  </td>

                  {/* STATUS */}

                  <td>
                    <span
                      className={`status-pill ${
                        p.stock > 0
                          ? "status-active"
                          : "status-cancelled"
                      }`}
                    >
                      {p.stock > 0
                        ? "In Stock"
                        : "Out of Stock"}
                    </span>
                  </td>

                  {/* ACTIONS */}

                  <td>
                    <div className="table-actions">
                      {/* VIEW */}

                      <Link
                        to={`/product/${p._id}`}
                        title="View"
                      >
                        <Eye size={14} />
                      </Link>

                      {/* EDIT */}

                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>

                      {/* DELETE */}

                      <button
                        className="danger"
                        title="Delete"
                        onClick={() =>
                          handleDelete(
                            p._id,
                            p.name
                          )
                        }
                      >
                        <Trash2
                          size={14}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* NO PRODUCTS */}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}