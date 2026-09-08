import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container">
      <div className="order-success">
        <h1 style={{ fontSize: "4.5rem", color: "var(--color-primary)" }}>404</h1>
        <h2 className="mb-16">Page Not Found</h2>
        <p className="text-muted mb-16">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
