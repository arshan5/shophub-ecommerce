import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";
import Loader from "./Loader";

// Reusable grid that renders a list of products with loading/empty states.
export default function ProductGrid({ products, loading, columns = 4 }) {
  if (loading) return <Loader />;

  if (!products || products.length === 0) {
    return <EmptyState title="No products found" message="Try adjusting your filters or search." />;
  }

  return (
    <div className={`grid grid-${columns}`}>
      {products.map((product) => (
  <ProductCard
    key={product.id || product._id}
    product={product}
  />
))}
    </div>
  );
}
