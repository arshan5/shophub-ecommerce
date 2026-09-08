import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Logged in but not admin
  if (user.role !== "admin") {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }

  // Admin
  return <Outlet />;
}