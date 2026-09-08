import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminProtectedRoute() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Logged in but not admin
  if (user?.role !== "admin") {
    return <Navigate to="/account" replace />;
  }

  // Admin
  return <Outlet />;
}