import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return setError("Email is required");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError("Enter a valid email");
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send reset link"
        );
      }

      setSent(true);
    } catch (error) {
      setError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {sent ? (
          <div className="text-center">
            <MailCheck
              size={44}
              color="var(--color-success)"
              style={{ margin: "0 auto 16px" }}
            />

            <h1>Check Your Email</h1>

            <p>
              If an account exists for{" "}
              <strong>{email}</strong>, a password reset
              link has been sent.
            </p>

            <Link
              to="/login"
              className="btn btn-outline btn-block mt-24"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1>Forgot Password</h1>

            <p>
              Enter your email and we'll send you a link to
              reset your password.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>

                <input
                  className={`form-control ${
                    error ? "has-error" : ""
                  }`}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                />

                {error && (
                  <p className="form-error">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="auth-footer-text">
              Remember your password?{" "}
              <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}