import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
} from "lucide-react";

import Breadcrumb from "../components/Breadcrumb";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";

import "./Shop.css";

const API_URL = "http://localhost:5000";

const PAGE_SIZE = 8;

const priceRanges = [
  {
    label: "All Prices",
    min: 0,
    max: Infinity,
  },
  {
    label: "Under $50",
    min: 0,
    max: 50,
  },
  {
    label: "$50 - $100",
    min: 50,
    max: 100,
  },
  {
    label: "$100 - $200",
    min: 100,
    max: 200,
  },
  {
    label: "Over $200",
    min: 200,
    max: Infinity,
  },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState("grid");

  // URL filters
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const priceIndex = Number(
    searchParams.get("price") || 0
  );

  const minRating = Number(
    searchParams.get("rating") || 0
  );

  const sort =
    searchParams.get("sort") || "default";

  const filter =
    searchParams.get("filter") || "";

  const page = Number(
    searchParams.get("page") || 1
  );

  // =====================================================
  // FETCH PRODUCTS + CATEGORIES
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/products`),
            fetch(`${API_URL}/api/categories`),
          ]);

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const productsData =
          await productsResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : []
        );

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : []
        );
      } catch (err) {
        console.error(
          "Shop page error:",
          err
        );

        setError(
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =====================================================
  // UPDATE URL PARAMETER
  // =====================================================

  const updateParam = (key, value) => {
    const next = new URLSearchParams(
      searchParams
    );

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    // Reset pagination whenever a filter changes
    if (key !== "page") {
      next.delete("page");
    }

    setSearchParams(next);
  };

  // =====================================================
  // CONVERT BACKEND PRODUCTS
  // =====================================================

  const normalizedProducts = useMemo(() => {
    return products.map((product) => {
      let image = "";

      if (product.image) {
        if (
          product.image.startsWith("http")
        ) {
          image = product.image;
        } else {
          image = `${API_URL}${
            product.image.startsWith("/")
              ? product.image
              : `/${product.image}`
          }`;
        }
      }

      return {
        ...product,

        // MongoDB ID
        id: product._id || product.id,

        // Backend image
        image,

        // Safe defaults
        price: Number(product.price || 0),

        originalPrice: Number(
          product.originalPrice ||
            product.price ||
            0
        ),

        rating: Number(
          product.rating || 0
        ),

        reviews: Number(
          product.reviews || 0
        ),

        discount: Number(
          product.discount || 0
        ),

        newArrival:
          Boolean(product.newArrival),

        bestSeller:
          Boolean(product.bestSeller),

        colors: Array.isArray(
          product.colors
        )
          ? product.colors
          : [],

        sizes: Array.isArray(
          product.sizes
        )
          ? product.sizes
          : [],
      };
    });
  }, [products]);

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filtered = useMemo(() => {
    let list = [...normalizedProducts];

    // ---------------------------------------------------
    // SEARCH
    // ---------------------------------------------------

    if (search.trim()) {
      const query =
        search.toLowerCase().trim();

      list = list.filter((product) => {
        const name = String(
          product.name || ""
        ).toLowerCase();

        const categoryName =
          String(
            product.categoryName ||
              product.category ||
              ""
          ).toLowerCase();

        const description =
          String(
            product.description || ""
          ).toLowerCase();

        return (
          name.includes(query) ||
          categoryName.includes(query) ||
          description.includes(query)
        );
      });
    }

    // ---------------------------------------------------
    // CATEGORY
    // ---------------------------------------------------

    if (category) {
      list = list.filter((product) => {
        const productCategory =
          product.category;

        // Product category may be MongoDB ID
        if (
          String(productCategory) ===
          String(category)
        ) {
          return true;
        }

        // Product may contain category object
        if (
          productCategory &&
          typeof productCategory ===
            "object"
        ) {
          return (
            String(
              productCategory._id
            ) === String(category) ||
            String(
              productCategory.id
            ) === String(category) ||
            String(
              productCategory.slug
            ) === String(category)
          );
        }

        // Check categoryName
        if (
          product.categoryName &&
          String(
            product.categoryName
          ).toLowerCase() ===
            String(category).toLowerCase()
        ) {
          return true;
        }

        return false;
      });
    }

    // ---------------------------------------------------
    // QUICK FILTERS
    // ---------------------------------------------------

    if (filter === "new") {
      list = list.filter(
        (product) =>
          product.newArrival === true
      );
    }

    if (filter === "sale") {
      list = list.filter(
        (product) =>
          product.discount > 0
      );
    }

    if (filter === "bestseller") {
      list = list.filter(
        (product) =>
          product.bestSeller === true
      );
    }

    // ---------------------------------------------------
    // PRICE
    // ---------------------------------------------------

    const range =
      priceRanges[priceIndex] ||
      priceRanges[0];

    list = list.filter(
      (product) =>
        product.price >= range.min &&
        product.price <= range.max
    );

    // ---------------------------------------------------
    // RATING
    // ---------------------------------------------------

    if (minRating > 0) {
      list = list.filter(
        (product) =>
          product.rating >= minRating
      );
    }

    // ---------------------------------------------------
    // SORT
    // ---------------------------------------------------

    switch (sort) {
      case "price-asc":
        list.sort(
          (a, b) =>
            a.price - b.price
        );
        break;

      case "price-desc":
        list.sort(
          (a, b) =>
            b.price - a.price
        );
        break;

      case "newest":
        list.sort(
          (a, b) => {
            const dateA =
              new Date(
                a.createdAt || 0
              ).getTime();

            const dateB =
              new Date(
                b.createdAt || 0
              ).getTime();

            return dateB - dateA;
          }
        );
        break;

      case "popular":
        list.sort(
          (a, b) =>
            b.reviews - a.reviews
        );
        break;

      default:
        break;
    }

    return list;
  }, [
    normalizedProducts,
    search,
    category,
    filter,
    priceIndex,
    minRating,
    sort,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    Math.max(page, 1),
    totalPages
  );

  const paginated = filtered.slice(
    (currentPage - 1) *
      PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // =====================================================
  // SCROLL TO TOP
  // =====================================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearchParams({});
  };

  // =====================================================
  // ACTIVE FILTER COUNT
  // =====================================================

  const activeFilterCount = [
    category,
    priceIndex > 0,
    minRating > 0,
    filter,
  ].filter(Boolean).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div>
      {/* ================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              {
                label: "Home",
                to: "/",
              },
              {
                label: "Shop",
              },
            ]}
          />

          <h1>
            Shop All Products
          </h1>
        </div>
      </div>

      {/* ================================================
          SHOP LAYOUT
      ================================================= */}

      <div className="container shop-layout">
        {/* ==============================================
            SIDEBAR
        =============================================== */}

        <aside
          className={`shop-filters ${
            filtersOpen
              ? "open"
              : ""
          }`}
        >
          <div className="shop-filters-header">
            <h3>Filters</h3>

            <button
              className="btn-icon"
              onClick={() =>
                setFiltersOpen(false)
              }
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>

          {/* ============================================
              CATEGORY
          ============================================= */}

          <div className="filter-group">
            <h4>
              Category
            </h4>

            <label className="filter-radio">
              <input
                type="radio"
                name="category"
                checked={!category}
                onChange={() =>
                  updateParam(
                    "category",
                    ""
                  )
                }
              />

              All Categories
            </label>

            {categories.map(
              (item) => {
                const categoryId =
                  item._id ||
                  item.id ||
                  item.slug;

                return (
                  <label
                    key={categoryId}
                    className="filter-radio"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={
                        String(
                          category
                        ) ===
                        String(
                          categoryId
                        )
                      }
                      onChange={() =>
                        updateParam(
                          "category",
                          String(
                            categoryId
                          )
                        )
                      }
                    />

                    {item.name}
                  </label>
                );
              }
            )}
          </div>

          {/* ============================================
              PRICE
          ============================================= */}

          <div className="filter-group">
            <h4>
              Price Range
            </h4>

            {priceRanges.map(
              (range, index) => (
                <label
                  key={
                    range.label
                  }
                  className="filter-radio"
                >
                  <input
                    type="radio"
                    name="price"
                    checked={
                      priceIndex ===
                      index
                    }
                    onChange={() =>
                      updateParam(
                        "price",
                        String(
                          index
                        )
                      )
                    }
                  />

                  {range.label}
                </label>
              )
            )}
          </div>

          {/* ============================================
              RATING
          ============================================= */}

          <div className="filter-group">
            <h4>
              Rating
            </h4>

            {[4, 3, 2, 1].map(
              (rating) => (
                <label
                  key={rating}
                  className="filter-radio"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={
                      minRating ===
                      rating
                    }
                    onChange={() =>
                      updateParam(
                        "rating",
                        String(
                          rating
                        )
                      )
                    }
                  />

                  {rating}★ & up
                </label>
              )
            )}

            <label className="filter-radio">
              <input
                type="radio"
                name="rating"
                checked={
                  minRating === 0
                }
                onChange={() =>
                  updateParam(
                    "rating",
                    ""
                  )
                }
              />

              Any Rating
            </label>
          </div>

          {/* ============================================
              CLEAR FILTERS
          ============================================= */}

          {activeFilterCount >
            0 && (
            <button
              className="btn btn-outline btn-sm btn-block"
              onClick={
                clearFilters
              }
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ==============================================
            MAIN SHOP CONTENT
        =============================================== */}

        <div className="shop-main">
          {/* ============================================
              TOOLBAR
          ============================================= */}

          <div className="shop-toolbar">
            <SearchBar
              value={search}
              onChange={(value) =>
                updateParam(
                  "search",
                  value
                )
              }
            />

            <button
              className="btn btn-outline btn-sm shop-filter-toggle"
              onClick={() =>
                setFiltersOpen(
                  true
                )
              }
            >
              <SlidersHorizontal
                size={15}
              />

              Filters{" "}
              {activeFilterCount >
                0 &&
                `(${activeFilterCount})`}
            </button>

            <select
              className="admin-filter-select"
              value={sort}
              onChange={(event) =>
                updateParam(
                  "sort",
                  event.target
                    .value
                )
              }
            >
              <option value="default">
                Sort: Default
              </option>

              <option value="price-asc">
                Price: Low to High
              </option>

              <option value="price-desc">
                Price: High to Low
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="popular">
                Popular
              </option>
            </select>

            <div className="view-toggle">
              <button
                className={
                  view ===
                  "grid"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView(
                    "grid"
                  )
                }
                aria-label="Grid view"
              >
                <LayoutGrid
                  size={16}
                />
              </button>

              <button
                className={
                  view ===
                  "list"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setView(
                    "list"
                  )
                }
                aria-label="List view"
              >
                <List
                  size={16}
                />
              </button>
            </div>
          </div>

          {/* ============================================
              PRODUCT COUNT
          ============================================= */}

          <p className="shop-count text-muted">
            {filtered.length}{" "}
            products found
          </p>

          {/* ============================================
              ERROR
          ============================================= */}

          {error && (
            <div className="empty-state">
              <h3>
                Something went wrong
              </h3>

              <p>
                {error}
              </p>

              <button
                className="btn btn-primary"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>
            </div>
          )}

          {/* ============================================
              LOADING
          ============================================= */}

          {!error &&
            loading && (
              <p>
                Loading products...
              </p>
            )}

          {/* ============================================
              PRODUCTS
          ============================================= */}

          {!error &&
            !loading &&
            paginated.length >
              0 && (
              <div
                className={
                  view ===
                  "grid"
                    ? "grid grid-4"
                    : "shop-list"
                }
              >
                {paginated.map(
                  (product) => (
                    <ProductCard
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                    />
                  )
                )}
              </div>
            )}

          {/* ============================================
              EMPTY
          ============================================= */}

          {!error &&
            !loading &&
            paginated.length ===
              0 && (
              <EmptyState
                title="No products found"
                message="Try adjusting your search or filters."
                actionLabel="Clear Filters"
                actionTo="/shop"
              />
            )}

          {/* ============================================
              PAGINATION
          ============================================= */}

          {!error &&
            !loading &&
            filtered.length >
              0 && (
              <Pagination
                page={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                onPageChange={(
                  newPage
                ) =>
                  updateParam(
                    "page",
                    String(
                      newPage
                    )
                  )
                }
              />
            )}
        </div>
      </div>

      {/* ================================================
          MOBILE FILTER OVERLAY
      ================================================= */}

      <div
        className={`shop-filters-overlay ${
          filtersOpen
            ? "open"
            : ""
        }`}
        onClick={() =>
          setFiltersOpen(
            false
          )
        }
      />
    </div>
  );
}