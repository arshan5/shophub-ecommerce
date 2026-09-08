import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL;

const emptyForm = {
  name: "",
  description: "",
  image: "",
  status: "Active",
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/categories`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch categories"
        );
      }

      const data = await response.json();

      setCategories(data);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      showToast(
        "Failed to load categories.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // ADD CATEGORY
  // =========================

  const openAdd = () => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setModalOpen(true);
  };

  // =========================
  // EDIT CATEGORY
  // =========================

  const openEdit = (category) => {
    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      status: category.status || "Active",
    });

    setEditingId(category._id);
    setModalOpen(true);
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SAVE CATEGORY
  // =========================

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast(
        "Category name is required.",
        "error"
      );

      return;
    }

    setSaving(true);

    try {
      const token =
        localStorage.getItem(
          "shophub_token"
        );

      if (!token) {
        showToast(
          "Please login as admin.",
          "error"
        );

        return;
      }

      const isEdit = !!editingId;

      const url = isEdit
        ? `${API_URL}/api/categories/${editingId}`
        : `${API_URL}/api/categories`;

      const response = await fetch(url, {
        method: isEdit
          ? "PUT"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          name:
            form.name.trim(),

          description:
            form.description.trim(),

          image:
            form.image.trim(),

          status:
            form.status,
        }),
      });

      const data =
        await response.json();

      // SESSION EXPIRED

      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          "shophub_token"
        );

        localStorage.removeItem(
          "shophub_auth_user"
        );

        showToast(
          "Your session has expired.",
          "error"
        );

        window.location.href =
          "/login";

        return;
      }

      // NOT ADMIN

      if (
        response.status === 403
      ) {
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
            "Failed to save category."
        );
      }

      if (isEdit) {
        setCategories(
          (prev) =>
            prev.map((category) =>
              category._id ===
              editingId
                ? data
                : category
            )
        );

        showToast(
          "Category updated successfully.",
          "success"
        );
      } else {
        setCategories(
          (prev) => [
            data,
            ...prev,
          ]
        );

        showToast(
          "Category added successfully.",
          "success"
        );
      }

      setModalOpen(false);

      setForm({
        ...emptyForm,
      });

      setEditingId(null);
    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      showToast(
        error.message ||
          "Failed to save category.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE CATEGORY
  // =========================

  const handleDelete = async (
    id,
    name
  ) => {
    if (
      !window.confirm(
        `Delete category "${name}"?`
      )
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "shophub_token"
        );

      if (!token) {
        showToast(
          "Please login as admin.",
          "error"
        );

        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/categories/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        response.status === 401
      ) {
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

      if (
        response.status === 403
      ) {
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
            "Failed to delete category."
        );
      }

      setCategories(
        (prev) =>
          prev.filter(
            (category) =>
              category._id !== id
          )
      );

      showToast(
        "Category deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      showToast(
        error.message ||
          "Failed to delete category.",
        "error"
      );
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
            <h1>
              Categories
            </h1>

            <p>
              Organize your product
              categories
            </p>
          </div>
        </div>

        <p>
          Loading categories...
        </p>
      </div>
    );
  }

  return (
    <div>

      {/* HEADER */}

      <div className="admin-page-header">

        <div>
          <h1>
            Categories
          </h1>

          <p>
            Organize your product
            categories
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAdd}
        >
          <Plus size={16} />

          Add Category
        </button>

      </div>

      {/* TABLE */}

      <div className="table-wrap">

        <table>

          <thead>
            <tr>

              <th>
                Image
              </th>

              <th>
                Name
              </th>

              <th>
                Products
              </th>

              <th>
                Status
              </th>

              <th>
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {categories.length > 0 ? (

              categories.map(
                (category) => (
                  <tr
                    key={
                      category._id
                    }
                  >

                    <td>
                      {category.image ? (
                        <img
                          src={
                            category.image.startsWith(
                              "http"
                            )
                              ? category.image
                              : `${API_URL}${category.image}`
                          }
                          alt={
                            category.name
                          }
                          className="table-thumb"
                        />
                      ) : (
                        <div
                          className="table-thumb"
                          style={{
                            background:
                              "#f1f5f9",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </td>

                    <td>
                      {category.name}
                    </td>

                    <td>
                      {category.productCount ||
                        0}
                    </td>

                    <td>

                      <span
                        className={`status-pill ${
                          category.status ===
                          "Inactive"
                            ? "status-inactive"
                            : "status-active"
                        }`}
                      >
                        {
                          category.status
                        }
                      </span>

                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          title="Edit"
                          onClick={() =>
                            openEdit(
                              category
                            )
                          }
                        >
                          <Pencil
                            size={14}
                          />
                        </button>

                        <button
                          className="danger"
                          title="Delete"
                          onClick={() =>
                            handleDelete(
                              category._id,
                              category.name
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
                )
              )

            ) : (

              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "40px",
                  }}
                >
                  No categories found.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
          }
        }}
        title={
          editingId
            ? "Edit Category"
            : "Add Category"
        }
      >

        <form
          onSubmit={
            handleSave
          }
        >

          <div className="form-group">

            <label className="form-label">
              Category Name
            </label>

            <input
              className="form-control"
              name="name"
              value={
                form.name
              }
              onChange={
                handleChange
              }
              placeholder="e.g. Electronics"
              required
            />

          </div>

          <div className="form-group">

            <label className="form-label">
              Description
            </label>

            <textarea
              className="form-control"
              name="description"
              rows={3}
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Category description"
            />

          </div>

          <div className="form-group">

            <label className="form-label">
              Image URL
            </label>

            <input
              className="form-control"
              name="image"
              value={
                form.image
              }
              onChange={
                handleChange
              }
              placeholder="https://..."
            />

          </div>

          <div className="form-group">

            <label className="form-label">
              Status
            </label>

            <select
              className="form-control"
              name="status"
              value={
                form.status
              }
              onChange={
                handleChange
              }
            >

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Category"}
          </button>

        </form>

      </Modal>

    </div>
  );
}