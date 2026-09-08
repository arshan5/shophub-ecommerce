import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

import "./Account.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ChangePassword() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const togglePassword = (field) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const validate = () => {
    const errs = {};

    if (!form.currentPassword) {
      errs.currentPassword =
        "Current password is required";
    }

    if (!form.newPassword) {
      errs.newPassword =
        "New password is required";
    } else if (form.newPassword.length < 6) {
      errs.newPassword =
        "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword =
        "Please confirm your new password";
    } else if (
      form.confirmPassword !== form.newPassword
    ) {
      errs.confirmPassword =
        "Passwords do not match";
    }

    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      errs.newPassword =
        "New password must be different from current password";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const token =
      localStorage.getItem("shophub_token");

    if (!token) {
      showToast(
        "Your session has expired. Please login again.",
        "error"
      );
      return;
    }

    if (!user) {
      showToast(
        "User information not found.",
        "error"
      );
      return;
    }

    const userId =
      user.id || user._id;

    if (!userId) {
      showToast(
        "User ID not found.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            userId,
            currentPassword:
              form.currentPassword,
            newPassword:
              form.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      showToast(
        "Password changed successfully.",
        "success"
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setErrors({});
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      showToast(
        error.message ||
          "Unable to change password.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (
    label,
    name,
    field,
    error
  ) => {
    return (
      <div className="form-group">
        <label className="form-label">
          {label}
        </label>

        <div style={{ position: "relative" }}>
          <input
            className={`form-control ${
              error ? "has-error" : ""
            }`}
            name={name}
            type={
              showPassword[field]
                ? "text"
                : "password"
            }
            value={form[name]}
            onChange={handleChange}
            style={{
              paddingRight: 45,
            }}
            disabled={loading}
          />

          <button
            type="button"
            onClick={() =>
              togglePassword(field)
            }
            disabled={loading}
            aria-label={
              showPassword[field]
                ? `Hide ${label}`
                : `Show ${label}`
            }
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform:
                "translateY(-50%)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 5,
              color: "#6b7280",
            }}
          >
            {showPassword[field] ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="account-page-title">
        <h2>Change Password</h2>

        <p>
          Update your account password
        </p>
      </div>

      <form
        className="card card-pad"
        style={{
          maxWidth: 480,
        }}
        onSubmit={handleSubmit}
        noValidate
      >
        {renderPasswordField(
          "Current Password",
          "currentPassword",
          "current",
          errors.currentPassword
        )}

        {renderPasswordField(
          "New Password",
          "newPassword",
          "new",
          errors.newPassword
        )}

        {renderPasswordField(
          "Confirm New Password",
          "confirmPassword",
          "confirm",
          errors.confirmPassword
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Password"}
        </button>
      </form>
    </div>
  );
}