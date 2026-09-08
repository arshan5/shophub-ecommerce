import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import "./Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Get reset token from email link
  const token = new URLSearchParams(
    window.location.search
  ).get("token");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Remove error while typing
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    const errs = {};

    if (!form.password) {
      errs.password = "New password is required";
    } else if (form.password.length < 6) {
      errs.password =
        "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword =
        "Please confirm your new password";
    } else if (
      form.confirmPassword !== form.password
    ) {
      errs.confirmPassword =
        "Passwords do not match";
    }

    if (!token) {
      errs.general =
        "Invalid or missing password reset link";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to reset password"
        );
      }

      showToast(
        "Password reset successfully",
        "success"
      );

      navigate("/login");
    } catch (error) {
      setErrors({
        general:
          error.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset Password</h1>

        <p>
          Choose a new password for your account.
        </p>

        {errors.general && (
          <p className="form-error">
            {errors.general}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              New Password
            </label>

            <input
              className={`form-control ${
                errors.password ? "has-error" : ""
              }`}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />

            {errors.password && (
              <p className="form-error">
                {errors.password}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Confirm New Password
            </label>

            <input
              className={`form-control ${
                errors.confirmPassword
                  ? "has-error"
                  : ""
              }`}
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
            />

            {errors.confirmPassword && (
              <p className="form-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}