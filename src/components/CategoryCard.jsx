import { Link } from "react-router-dom";
import "./CategoryCard.css";

export default function CategoryCard({ category }) {
  return (
    <Link to={`/shop?category=${category.id}`} className="category-card">
      <div className="category-card-image">
        <img src={category.image} alt={category.name} loading="lazy" />
      </div>
      <div className="category-card-label">
        <h3>{category.name}</h3>
        <p>{category.description}</p>
      </div>
    </Link>
  );
}
