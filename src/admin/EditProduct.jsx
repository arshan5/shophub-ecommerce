import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import ProductForm from "./ProductForm";
import "./Admin.css";

export default function EditProduct() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token =
          localStorage.getItem("shophub_token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("shophub_token");
          localStorage.removeItem(
            "shophub_auth_user"
          );

          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        setProduct(data);
      } catch (error) {
        console.error(
          "Failed to fetch product:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        Loading product...
      </div>
    );
  }

  // =========================
  // PRODUCT NOT FOUND
  // =========================

  if (!product) {
    return (
      <Navigate
        to="/admin/products"
        replace
      />
    );
  }

  // =========================
  // INITIAL FORM DATA
  // =========================

  const initialProduct = {
    _id: product._id,
    name: product.name || "",
    category:
      product.category || "",
    description:
      product.description || "",
    price: product.price ?? "",
    discount:
      product.discount ?? "",
    stock: product.stock ?? "",
    rating:
      product.rating ?? "",
    featured:
      product.featured || false,
    status:
      product.status ||
      (product.stock > 0
        ? "Active"
        : "Draft"),
    image:
      product.image || "",
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Edit Product</h1>

          <p>
            Update details for "
            {product.name}"
          </p>
        </div>
      </div>

      <ProductForm
        mode="edit"
        initialProduct={initialProduct}
      />
    </div>
  );
}