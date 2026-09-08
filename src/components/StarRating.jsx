import { Star, StarHalf } from "lucide-react";

// Renders a 5-star rating display. Purely presentational.
export default function StarRating({ rating = 0, reviews, size = 14 }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="star-rating">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} size={size} fill="#fca311" stroke="#fca311" />;
        }
        if (i === fullStars && hasHalf) {
          return <StarHalf key={i} size={size} fill="#fca311" stroke="#fca311" />;
        }
        return <Star key={i} size={size} stroke="#d1d5db" />;
      })}
      {reviews !== undefined && <span className="rating-count">({reviews})</span>}
    </div>
  );
}
