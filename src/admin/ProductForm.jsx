import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ImagePlus,
  X,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  price: "",
  discount: 0,
  stock: "",
  featured: false,
  status: "Active",
  images: [],
  variants: [],
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

  const [errors, setErrors] =
    useState({});

  const [selectedImages, setSelectedImages] =
    useState([]);
  const [variantColor, setVariantColor] =
    useState("");

  const [variantImages, setVariantImages] =
    useState([]);
    const [variantStock, setVariantStock] =
  useState("");
  const [additionalVariantImages, setAdditionalVariantImages] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  useEffect(() => {
    if (initialProduct) {
      setForm(initialProduct);
    }
  }, [initialProduct]);

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

        if (
          mode === "add" &&
          !initialProduct?.category &&
          data.length > 0
        ) {
          setForm((prev) => ({
            ...prev,
            category: data[0]._id,
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
  }, [
    mode,
    initialProduct,
    showToast,
  ]);

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
  // CALCULATE SALE PRICE
  // =========================

  const price =
    Number(form.price) || 0;

  const discount =
    Math.min(
      Math.max(
        Number(form.discount) || 0,
        0
      ),
      100
    );

  const salePrice =
    price -
    (price * discount) / 100;

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name =
        "Product name is required.";
    }

    if (!form.description.trim()) {
      errs.description =
        "Description is required.";
    }

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      errs.price =
        "Enter a valid price.";
    }

    if (
      Number(form.discount) < 0 ||
      Number(form.discount) > 100
    ) {
      errs.discount =
        "Discount must be between 0% and 100%.";
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      errs.stock =
        "Enter a valid stock quantity.";
    }

    if (!form.category) {
      errs.category =
        "Please select a category.";
    }

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  // =========================
  // HANDLE IMAGE SELECTION
  // =========================

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (
        file.size >
        5 * 1024 * 1024
      ) {
        showToast(
          `${file.name} is larger than 5MB.`,
          "error"
        );

        continue;
      }

      if (
        ![
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ].includes(file.type)
      ) {
        showToast(
          `${file.name} is not a supported image.`,
          "error"
        );

        continue;
      }

      validFiles.push(file);
    }

    setSelectedImages((prev) => {
      const combined = [
        ...prev,
        ...validFiles,
      ];

      if (combined.length > 10) {
        showToast(
          "You can upload a maximum of 10 images.",
          "error"
        );

        return combined.slice(0, 10);
      }

      return combined;
    });

    e.target.value = "";
  };

  // =========================
// ADD COLOR VARIANT
// =========================

const addVariant = () => {
  const color = variantColor.trim();

  const stock = Number(
    variantStock
  );

  if (!color) {
    showToast(
      "Please enter a color.",
      "error"
    );
    return;
  }

  if (
    variantStock === "" ||
    stock < 0
  ) {
    showToast(
      "Please enter a valid stock quantity.",
      "error"
    );
    return;
  }

  if (variantImages.length === 0) {
    showToast(
      "Please select at least one image for this color.",
      "error"
    );
    return;
  }

  const newVariant = {
    color,
    stock,
    images: variantImages,
  };

  setForm((prev) => ({
    ...prev,

    variants: [
      ...(prev.variants || []),
      newVariant,
    ],
  }));

  setVariantColor("");
  setVariantStock("");
  setVariantImages([]);

  showToast(
    `${color} variant added.`,
    "success"
  );
};

  // =========================
  // REMOVE IMAGE FROM VARIANT
  // =========================

  const removeVariantImage = (
    variantIndex,
    imageIndex
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).map(
        (variant, index) => {
          if (index !== variantIndex) {
            return variant;
          }

          return {
            ...variant,
            images: (variant.images || []).filter(
              (_, imgIndex) =>
                imgIndex !== imageIndex
            ),
          };
        }
      ),
    }));
  };

  const handleAdditionalVariantImages = (
    variantIndex,
    e
  ) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    setAdditionalVariantImages((prev) => ({
      ...prev,
      [variantIndex]: [
        ...(prev[variantIndex] || []),
        ...files,
      ],
    }));

    e.target.value = "";
  };

  // =========================
  // REMOVE COLOR VARIANT
  // =========================

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter(
        (_, variantIndex) =>
          variantIndex !== index
      ),
    }));
  };

  // =========================
  // REMOVE NEW IMAGE
  // =========================

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) =>
      prev.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
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
        ? `${import.meta.env.VITE_API_URL}/api/products/${form._id}`
        : `${import.meta.env.VITE_API_URL}/api/products`;

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
        "discount",
        Number(form.discount) || 0
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

      // =========================
      // MULTIPLE IMAGES
      // =========================

      selectedImages.forEach(
        (image) => {
          formData.append(
            "images",
            image
          );
        }
      );

     // =========================
// COLOR VARIANTS
// =========================

(form.variants || []).forEach(
  (variant, index) => {

    // Color
    formData.append(
      `variantColor_${index}`,
      variant.color
    );

    // Variant stock
    formData.append(
      `variantStock_${index}`,
      Number(variant.stock) || 0
    );

    // Existing variant images
    (variant.images || []).forEach(
      (image) => {
        formData.append(
          `variantImages_${index}`,
          image
        );
      }
    );

    // Newly added variant images
    (
      additionalVariantImages[index] ||
      []
    ).forEach((image) => {
      formData.append(
        `variantImages_${index}`,
        image
      );
    });
  }
);

// Total variants
formData.append(
  "variantCount",
  (form.variants || []).length
);
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

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEdit
              ? "Failed to update product."
              : "Failed to add product.")
        );
      }

      showToast(
        isEdit
          ? "Product updated successfully."
          : "Product added successfully.",
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
            ? "Failed to update product."
            : "Failed to add product."),
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
          placeholder="Enter product name"
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
          rows={5}
          value={form.description}
          onChange={handleChange}
          placeholder="Enter product description"
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
            Regular Price ($)
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
            placeholder="0.00"
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
            className={`form-control ${
              errors.discount
                ? "has-error"
                : ""
            }`}
            name="discount"
            type="number"
            min="0"
            max="100"
            value={form.discount}
            onChange={handleChange}
            placeholder="0"
          />

          {errors.discount && (
            <p className="form-error">
              {errors.discount}
            </p>
          )}
        </div>
      </div>

      {/* SALE PRICE PREVIEW */}

      {price > 0 && (
        <div
          style={{
            padding: "14px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            background:
              "var(--color-bg-soft)",
            border:
              "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color:
                "var(--color-text-muted)",
              marginBottom: "5px",
            }}
          >
            Customer pays
          </div>

          <strong
            style={{
              fontSize: "20px",
            }}
          >
            ${salePrice.toFixed(2)}
          </strong>

          {discount > 0 && (
            <span
              style={{
                marginLeft: "10px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {discount}% OFF
            </span>
          )}
        </div>
      )}

      {/* STOCK */}

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
          placeholder="0"
        />

        {errors.stock && (
          <p className="form-error">
            {errors.stock}
          </p>
        )}
      </div>

      {/* IMAGE UPLOAD */}

      <div className="form-group">
        <label className="form-label">
          Product Gallery
        </label>

        <div
          className="image-upload-box"
          onClick={() =>
            document
              .getElementById(
                "product-images-input"
              )
              .click()
          }
        >
          <ImagePlus
            size={30}
            style={{
              margin:
                "0 auto 10px",
            }}
          />

          <strong>
            Click to upload images
          </strong>

          <br />

          <span
            style={{
              fontSize: "13px",
            }}
          >
            PNG, JPG, JPEG or WEBP
            <br />
            Maximum 10 images • 5MB each
          </span>

          <input
            id="product-images-input"
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            multiple
            style={{
              display: "none",
            }}
            onChange={
              handleImageChange
            }
          />
        </div>

        {/* NEW IMAGE PREVIEWS */}

        {selectedImages.length >
          0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(110px, 1fr))",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {selectedImages.map(
              (file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    position:
                      "relative",
                    border:
                      "1px solid var(--color-border)",
                    borderRadius: "8px",
                    overflow:
                      "hidden",
                  }}
                >
                  <img
                    src={URL.createObjectURL(
                      file
                    )}
                    alt={
                      file.name
                    }
                    style={{
                      width: "100%",
                      height: "110px",
                      objectFit:
                        "cover",
                      display:
                        "block",
                    }}
                  />

                  {index === 0 && (
                    <span
                      style={{
                        position:
                          "absolute",
                        left: "6px",
                        bottom: "6px",
                        padding:
                          "4px 7px",
                        borderRadius:
                          "4px",
                        background:
                          "rgba(0,0,0,0.7)",
                        color:
                          "#fff",
                        fontSize:
                          "11px",
                        fontWeight:
                          "700",
                      }}
                    >
                      Main Image
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      removeSelectedImage(
                        index
                      )
                    }
                    style={{
                      position:
                        "absolute",
                      top: "5px",
                      right: "5px",
                      width: "26px",
                      height: "26px",
                      border: "none",
                      borderRadius:
                        "50%",
                      background:
                        "rgba(0,0,0,0.7)",
                      color: "#fff",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* EXISTING IMAGES IN EDIT MODE */}

        {mode === "edit" &&
          form.images?.length >
            0 && (
            <div
              style={{
                marginTop:
                  "20px",
              }}
            >
              <p
                style={{
                  fontWeight:
                    "700",
                  marginBottom:
                    "10px",
                }}
              >
                Existing Gallery
              </p>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(110px, 1fr))",
                  gap: "12px",
                }}
              >
                {form.images.map(
                  (
                    image,
                    index
                  ) => (
                    <div
                      key={
                        `${image}-${index}`
                      }
                      style={{
                        border:
                          "1px solid var(--color-border)",
                        borderRadius:
                          "8px",
                        overflow:
                          "hidden",
                      }}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}${image}`}
                        alt={`${form.name} ${index + 1}`}
                        style={{
                          width:
                            "100%",
                          height:
                            "110px",
                          objectFit:
                            "cover",
                          display:
                            "block",
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </div>

   {/* COLOR VARIANTS */}

<div className="form-group">
  <label className="form-label">
    Color Variants
  </label>

  <div
    style={{
      padding: "16px",
      border: "1px solid var(--color-border)",
      borderRadius: "8px",
    }}
  >
    {/* ADD NEW VARIANT */}

    <div className="form-row">

      {/* COLOR */}

      <div className="form-group">
        <label className="form-label">
          Color
        </label>

        <input
          type="text"
          className="form-control"
          value={variantColor}
          onChange={(e) =>
            setVariantColor(e.target.value)
          }
          placeholder="e.g. Black"
        />
      </div>

      {/* STOCK */}

      <div className="form-group">
        <label className="form-label">
          Stock
        </label>

        <input
          type="number"
          className="form-control"
          min="0"
          value={variantStock}
          onChange={(e) =>
            setVariantStock(
              e.target.value
            )
          }
          placeholder="e.g. 20"
        />
      </div>

      {/* IMAGES */}

      <div className="form-group">
        <label className="form-label">
          Color Images
        </label>

        <input
          type="file"
          className="form-control"
          accept=".png,.jpg,.jpeg,.webp"
          multiple
          onChange={(e) => {
            const files = Array.from(
              e.target.files || []
            );

            setVariantImages(files);

            e.target.value = "";
          }}
        />
      </div>
    </div>

    {/* SELECTED IMAGE COUNT */}

    {variantImages.length > 0 && (
      <p
        style={{
          marginTop: "8px",
          fontSize: "13px",
          color:
            "var(--color-text-muted)",
        }}
      >
        {variantImages.length} image
        {variantImages.length > 1
          ? "s"
          : ""}{" "}
        selected
      </p>
    )}

    {/* ADD VARIANT */}

    <button
      type="button"
      className="btn btn-outline"
      onClick={addVariant}
      style={{
        marginTop: "12px",
      }}
    >
      Add Color Variant
    </button>
  </div>

  {/* ========================= */}
  {/* ADDED VARIANTS */}
  {/* ========================= */}

  {form.variants?.length > 0 && (
    <div
      style={{
        marginTop: "16px",
        display: "grid",
        gap: "12px",
      }}
    >
      {form.variants.map(
        (variant, index) => (
          <div
            key={`${variant.color}-${index}`}
            style={{
              padding: "14px",
              border:
                "1px solid var(--color-border)",
              borderRadius: "8px",
            }}
          >

            {/* ========================= */}
            {/* VARIANT HEADER */}
            {/* ========================= */}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent:
                  "space-between",
                gap: "12px",
              }}
            >
              <div
                style={{
                  flex: 1,
                }}
              >
                <strong>
                  {variant.color}
                </strong>

                <div
                  style={{
                    fontSize: "13px",
                    color:
                      "var(--color-text-muted)",
                    marginTop: "4px",
                  }}
                >
                  {variant.images?.length || 0}{" "}
                  image
                  {(variant.images?.length || 0) !==
                  1
                    ? "s"
                    : ""}
                </div>
              </div>

              {/* REMOVE VARIANT */}

              <button
                type="button"
                onClick={() =>
                  removeVariant(index)
                }
                style={{
                  width: "32px",
                  height: "32px",
                  border: "none",
                  borderRadius: "50%",
                  background:
                    "rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  flexShrink: 0,
                }}
                aria-label={`Remove ${variant.color}`}
              >
                <X size={16} />
              </button>
            </div>

            {/* ========================= */}
            {/* VARIANT STOCK */}
            {/* ========================= */}

            <div
              style={{
                marginTop: "12px",
                maxWidth: "220px",
              }}
            >
              <label
                className="form-label"
              >
                Stock
              </label>

              <input
                type="number"
                className="form-control"
                min="0"
                value={
                  variant.stock ?? 0
                }
                onChange={(e) => {
                  const value =
                    e.target.value;

                  setForm((prev) => ({
                    ...prev,

                    variants: (
                      prev.variants || []
                    ).map(
                      (
                        currentVariant,
                        variantIndex
                      ) => {
                        if (
                          variantIndex !==
                          index
                        ) {
                          return currentVariant;
                        }

                        return {
                          ...currentVariant,

                          stock:
                            value === ""
                              ? ""
                              : Number(
                                  value
                                ),
                        };
                      }
                    ),
                  }));
                }}
              />
            </div>

            {/* ========================= */}
            {/* VARIANT IMAGES */}
            {/* ========================= */}

            <div
              style={{
                marginTop: "14px",
              }}
            >

              {/* EXISTING IMAGES */}

              {variant.images?.length >
                0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(90px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {variant.images.map(
                    (
                      image,
                      imageIndex
                    ) => (
                      <div
                        key={`${image}-${imageIndex}`}
                        style={{
                          position:
                            "relative",
                          border:
                            "1px solid var(--color-border)",
                          borderRadius:
                            "8px",
                          overflow:
                            "hidden",
                        }}
                      >
                        <img
                          src={
                            image.startsWith(
                              "http"
                            )
                              ? image
                              : `${import.meta.env.VITE_API_URL}${image}`
                          }
                          alt={`${variant.color} ${
                            imageIndex + 1
                          }`}
                          style={{
                            width:
                              "100%",
                            height:
                              "90px",
                            objectFit:
                              "cover",
                            display:
                              "block",
                          }}
                        />

                        {/* REMOVE IMAGE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeVariantImage(
                              index,
                              imageIndex
                            )
                          }
                          style={{
                            position:
                              "absolute",
                            top: "5px",
                            right: "5px",
                            width:
                              "26px",
                            height:
                              "26px",
                            border:
                              "none",
                            borderRadius:
                              "50%",
                            background:
                              "rgba(0,0,0,0.75)",
                            color:
                              "#fff",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            cursor:
                              "pointer",
                          }}
                          aria-label={`Remove ${variant.color} image ${
                            imageIndex + 1
                          }`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ========================= */}
              {/* ADD MORE IMAGES */}
              {/* ========================= */}

              <div
                style={{
                  marginTop: "12px",
                }}
              >
                <label
                  className="btn btn-outline"
                  style={{
                    display:
                      "inline-block",
                    cursor:
                      "pointer",
                  }}
                >
                  Add More Images

                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    multiple
                    style={{
                      display:
                        "none",
                    }}
                    onChange={(e) =>
                      handleAdditionalVariantImages(
                        index,
                        e
                      )
                    }
                  />
                </label>
              </div>

              {/* ========================= */}
              {/* NEW IMAGES SELECTED */}
              {/* ========================= */}

              {additionalVariantImages[
                index
              ]?.length > 0 && (
                <div
                  style={{
                    marginTop: "12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight:
                        "600",
                      marginBottom:
                        "8px",
                    }}
                  >
                    New images selected:{" "}
                    {
                      additionalVariantImages[
                        index
                      ].length
                    }
                  </p>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(90px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {additionalVariantImages[
                      index
                    ].map(
                      (
                        file,
                        fileIndex
                      ) => (
                        <div
                          key={`${file.name}-${fileIndex}`}
                          style={{
                            border:
                              "1px solid var(--color-border)",
                            borderRadius:
                              "8px",
                            overflow:
                              "hidden",
                          }}
                        >
                          <img
                            src={URL.createObjectURL(
                              file
                            )}
                            alt={
                              file.name
                            }
                            style={{
                              width:
                                "100%",
                              height:
                                "90px",
                              objectFit:
                                "cover",
                              display:
                                "block",
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
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