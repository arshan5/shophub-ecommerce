import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import CategoryCard from "../components/CategoryCard";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/categories`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load categories."
          );
        }

        setCategories(data);
      } catch (error) {
        console.error("Categories error:", error);
        setError(
          error.message || "Failed to load categories."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              {
                label: "Home",
                to: "/",
              },
              {
                label: "Categories",
              },
            ]}
          />

          <h1>All Categories</h1>
        </div>
      </div>

      <div className="container section">
        {loading && (
          <div className="text-center">
            <p>Loading categories...</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="form-error">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="text-center">
            <p className="text-muted">
              No categories found.
            </p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-3">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}