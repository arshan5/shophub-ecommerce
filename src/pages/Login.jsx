import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear field error while typing
    setErrors({
      ...errors,
      [name]: "",
      general: "",
    });
  };

  // Validate form
  const validate = () => {
    const errs = {};

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Enter a valid email";
    }

    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });

      showToast("Logged in successfully", "success");

      // Return user to the page they originally wanted
      const redirectTo = location.state?.from || "/account";

      navigate(redirectTo, {
        replace: true,
      });
    } catch (error) {
      // User needs email verification
      if (
        error.status === 403 &&
        error.emailVerified === false
      ) {
        sessionStorage.setItem(
          "shophub_verification_email",
          form.email.trim()
        );

        showToast(
          "Please verify your email first",
          "error"
        );

        navigate("/verify-email");

        return;
      }

      setErrors({
        general:
          error.message ||
          "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>

        <p>
          Sign in to continue to your account
        </p>

        {errors.general && (
          <p className="form-error">
            {errors.general}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>

            <input
              className={`form-control ${
                errors.email ? "has-error" : ""
              }`}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />

            {errors.email && (
              <p className="form-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                className={`form-control ${
                  errors.password ? "has-error" : ""
                }`}
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  paddingRight: "45px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="form-error">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember + Forgot Password */}
          <div className="auth-options-row">
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />

              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-link"
              style={{
                fontSize: "0.85rem",
              }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}