import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./Auth.css";

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================
  // PASSWORD STRENGTH
  // =========================

  const getPasswordStrength = (password) => {
    if (!password) {
      return {
        label: "",
        className: "",
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak password",
        className: "weak",
      };
    }

    if (score <= 4) {
      return {
        label: "Medium password",
        className: "medium",
      };
    }

    return {
      label: "Strong password",
      className: "strong",
    };
  };

  const passwordStrength = getPasswordStrength(
    form.password
  );

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    // Remove error while user types
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    const errs = {};

    if (!form.firstName.trim()) {
      errs.firstName =
        "First name is required";
    }

    if (!form.lastName.trim()) {
      errs.lastName =
        "Last name is required";
    }

    if (!form.email.trim()) {
      errs.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      errs.email =
        "Enter a valid email";
    }

    if (!form.password) {
      errs.password =
        "Password is required";
    } else if (form.password.length < 6) {
      errs.password =
        "Password must be at least 6 characters";
    }

    if (
      form.password &&
      passwordStrength.label === "Weak password"
    ) {
      errs.password =
        "Please choose a stronger password";
    }

    if (
      form.confirmPassword !==
      form.password
    ) {
      errs.confirmPassword =
        "Passwords do not match";
    }

    if (!form.terms) {
      errs.terms =
        "You must accept the terms to continue";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

      showToast(
        "Account created. Please check your email for the verification code.",
        "success"
      );

      // Save email temporarily so VerifyEmail
      // knows which account is being verified.
      sessionStorage.setItem(
        "shophub_verification_email",
        form.email
      );

      navigate("/verify-email");
    } catch (error) {
      showToast(
        error.message ||
          "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Create an Account</h1>

        <p>
          Join us and start shopping today
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
        >

          {/* FIRST + LAST NAME */}

          <div className="form-row">

            <div className="form-group">

              <label className="form-label">
                First Name
              </label>

              <input
                className={`form-control ${
                  errors.firstName
                    ? "has-error"
                    : ""
                }`}
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />

              {errors.firstName && (
                <p className="form-error">
                  {errors.firstName}
                </p>
              )}

            </div>

            <div className="form-group">

              <label className="form-label">
                Last Name
              </label>

              <input
                className={`form-control ${
                  errors.lastName
                    ? "has-error"
                    : ""
                }`}
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />

              {errors.lastName && (
                <p className="form-error">
                  {errors.lastName}
                </p>
              )}

            </div>

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label className="form-label">
              Email Address
            </label>

            <input
              className={`form-control ${
                errors.email
                  ? "has-error"
                  : ""
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

          {/* PASSWORD */}

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
                  errors.password
                    ? "has-error"
                    : ""
                }`}
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                style={{
                  paddingRight: "45px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

            {/* PASSWORD STRENGTH */}

            {form.password && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <span
                  style={{
                    color:
                      passwordStrength.className ===
                      "weak"
                        ? "#dc2626"
                        : passwordStrength.className ===
                          "medium"
                        ? "#d97706"
                        : "#16a34a",
                  }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}

            {errors.password && (
              <p className="form-error">
                {errors.password}
              </p>
            )}

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="form-group">

            <label className="form-label">
              Confirm Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >

              <input
                className={`form-control ${
                  errors.confirmPassword
                    ? "has-error"
                    : ""
                }`}
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.confirmPassword
                }
                onChange={handleChange}
                placeholder="Re-enter password"
                style={{
                  paddingRight: "45px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                {showConfirmPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

            {errors.confirmPassword && (
              <p className="form-error">
                {errors.confirmPassword}
              </p>
            )}

          </div>

          {/* TERMS */}

          <div className="form-group">

            <label className="checkbox-row">

              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
              />

              I agree to the Terms of Service
              and Privacy Policy

            </label>

            {errors.terms && (
              <p className="form-error">
                {errors.terms}
              </p>
            )}

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-footer-text">

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>

      </div>
    </div>
  );
}