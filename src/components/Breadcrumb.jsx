import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// items: [{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: "Product" }]
export default function Breadcrumb({ items }) {
  return (
    <div className="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex" style={{ alignItems: "center", gap: 6 }}>
            {item.to && !isLast ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span className={isLast ? "current" : ""}>{item.label}</span>
            )}
            {!isLast && <ChevronRight size={14} className="sep" />}
          </span>
        );
      })}
    </div>
  );
}
