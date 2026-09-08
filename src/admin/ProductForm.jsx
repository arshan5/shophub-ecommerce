import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { useToast } from "../context/ToastContext";

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  price: "",
  discount: "",
  stock: "",
  rating: "",
  featured: false,
  status: "Active",
};

export default function ProductForm({
  initialProduct,
  mode = "add",
}) {
  const [form, setForm] = useState(
    initialProduct || emptyProduct
  );

  const [categories, setCategories] =
    useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [errors, setErrors] = useState({});

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // =========================
  // FETCH CATEGORIES
  // =========================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/categories"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const data = await response.json();

        setCategories(data);

        // For ADD mode, select first category
        // if no category is selected yet
        if (
          mode === "add" &&
          !initialProduct?.category &&
          data.length > 0
        ) {
          setForm((prev) => ({
            ...prev,
            category:
              data[0]._id,
          }));
        }
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
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [mode, initialProduct, showToast]);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name =
        "Product name is required";
    }

    if (!form.description.trim()) {
      errs.description =
        "Description is required";
    }

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      errs.price =
        "Enter a valid price";
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      errs.stock =
        "Enter a valid stock quantity";
    }

    if (!form.category) {
      errs.category =
        "Please select a category";
    }

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  // =========================
  // SUBMIT PRODUCT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const token =
        localStorage.getItem(
          "shophub_token"
        );

      // Make sure admin is logged in
      if (!token) {
        showToast(
          "Please login as admin.",
          "error"
        );

        navigate("/login");
        return;
      }

      const isEdit =
        mode === "edit";

      const url = isEdit
        ? `http://localhost:5000/api/products/${form._id}`
        : "http://localhost:5000/api/products";

      // =========================
      // FORM DATA
      // =========================

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "price",
        Number(form.price)
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "stock",
        Number(form.stock)
      );

      if (selectedImage) {
        formData.append(
          "image",
          selectedImage
        );
      }

      // =========================
      // API REQUEST
      // =========================

      const response =
        await fetch(url, {
          method: isEdit
            ? "PUT"
            : "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        });

      const data =
        await response.json();

      // =========================
      // AUTHORIZATION ERROR
      // =========================

      if (
        response.status === 401
      ) {
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

        navigate("/login");

        return;
      }

      if (
        response.status === 403
      ) {
        showToast(
          "Admin access required.",
          "error"
        );

        navigate("/account");

        return;
      }

      // =========================
      // OTHER ERRORS
      // =========================

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEdit
              ? "Failed to update product"
              : "Failed to add product")
        );
      }

      console.log(
        isEdit
          ? "Product updated:"
          : "Product created:",
        data
      );

      // =========================
      // SUCCESS
      // =========================

      showToast(
        isEdit
          ? "Product updated successfully"
          : "Product added successfully",
        "success"
      );

      navigate(
        "/admin/products"
      );
    } catch (error) {
      console.error(
        "Product save error:",
        error
      );

      showToast(
        error.message ||
          (mode === "edit"
            ? "Failed to update product"
            : "Failed to add product"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <form
      className="admin-form-card"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* PRODUCT NAME */}

      <div className="form-group">
        <label className="form-label">
          Product Name
        </label>

        <input
          className={`form-control ${
            errors.name
              ? "has-error"
              : ""
          }`}
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        {errors.name && (
          <p className="form-error">
            {errors.name}
          </p>
        )}
      </div>

      {/* DESCRIPTION */}

      <div className="form-group">
        <label className="form-label">
          Description
        </label>

        <textarea
          className={`form-control ${
            errors.description
              ? "has-error"
              : ""
          }`}
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
        />

        {errors.description && (
          <p className="form-error">
            {errors.description}
          </p>
        )}
      </div>

      {/* CATEGORY + STATUS */}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Category
          </label>

          <select
            className={`form-control ${
              errors.category
                ? "has-error"
                : ""
            }`}
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={
              categoriesLoading
            }
          >
            {categoriesLoading ? (
              <option value="">
                Loading categories...
              </option>
            ) : categories.length ===
              0 ? (
              <option value="">
                No categories available
              </option>
            ) : (
              <>
                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </>
            )}
          </select>

          {errors.category && (
            <p className="form-error">
              {errors.category}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Status
          </label>

          <select
            className="form-control"
            name="status"
            value={
              form.status ||
              "Active"
            }
            onChange={handleChange}
          >
            <option value="Active">
              Active
            </option>

            <option value="Draft">
              Draft
            </option>

            <option value="Archived">
              Archived
            </option>
          </select>
        </div>
      </div>

      {/* PRICE + DISCOUNT */}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Price ($)
          </label>

          <input
            className={`form-control ${
              errors.price
                ? "has-error"
                : ""
            }`}
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
          />

          {errors.price && (
            <p className="form-error">
              {errors.price}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Discount (%)
          </label>

          <input
            className="form-control"
            name="discount"
            type="number"
            min="0"
            max="100"
            value={form.discount}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* STOCK + RATING */}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Stock Quantity
          </label>

          <input
            className={`form-control ${
              errors.stock
                ? "has-error"
                : ""
            }`}
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
          />

          {errors.stock && (
            <p className="form-error">
              {errors.stock}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Rating (0-5)
          </label>

          <input
            className="form-control"
            name="rating"
            type="number"
            step="0.1"
            max="5"
            min="0"
            value={form.rating}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* IMAGE UPLOAD */}

      <div className="form-group">
        <label className="form-label">
          Product Images
        </label>

        <div
          className="image-upload-box"
          onClick={() =>
            document
              .getElementById(
                "product-image-input"
              )
              .click()
          }
        >
          <ImagePlus
            size={26}
            style={{
              margin:
                "0 auto 8px",
            }}
          />

          Click to upload or
          drag and drop

          <br />

          PNG, JPG up to 5MB

          <input
            id="product-image-input"
            type="file"
            accept=".png,.jpg,.jpeg"
            style={{
              display: "none",
            }}
            onChange={(e) => {
              const file =
                e.target.files[0];

              if (!file) {
                return;
              }

              if (
                file.size >
                5 * 1024 * 1024
              ) {
                showToast(
                  "Image must be less than 5MB.",
                  "error"
                );

                e.target.value = "";

                return;
              }

              setSelectedImage(
                file
              );

              console.log(
                "Selected image:",
                file
              );
            }}
          />
        </div>

        {selectedImage && (
          <p>
            Selected:{" "}
            {selectedImage.name}
          </p>
        )}

        {!selectedImage &&
          mode === "edit" &&
          form.image && (
            <p>
              Current image:{" "}
              {form.image}
            </p>
          )}
      </div>

      {/* FEATURED */}

      <div className="form-group">
        <label className="checkbox-row">
          <input
            type="checkbox"
            name="featured"
            checked={
              !!form.featured
            }
            onChange={handleChange}
          />

          Feature this product
          on the homepage
        </label>
      </div>

      {/* BUTTONS */}

      <div className="flex gap-12 mt-16">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            loading ||
            categoriesLoading ||
            categories.length === 0
          }
        >
          {loading
            ? "Saving..."
            : mode === "add"
            ? "Add Product"
            : "Save Changes"}
        </button>

        <button
          type="button"
          className="btn btn-outline"
          disabled={loading}
          onClick={() =>
            navigate(
              "/admin/products"
            )
          }
        >
          Cancel
        </button>
      </div>
    </form>
  );
}