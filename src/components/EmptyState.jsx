import { PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ icon, title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      {icon || <PackageOpen size={48} />}
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary mt-16">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
