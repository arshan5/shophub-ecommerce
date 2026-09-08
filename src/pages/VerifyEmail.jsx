import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

import "./Auth.css";

export default function VerifyEmail() {
  const {
    verifyEmail,
    resendVerificationCode,
  } = useAuth();

  const { showToast } =
    useToast();

  const navigate =
    useNavigate();

  const [code, setCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const email =
    sessionStorage.getItem(
      "shophub_verification_email"
    );

  /* =========================
     VERIFY
  ========================= */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!email) {
      showToast(
        "Verification email not found. Please register again.",
        "error"
      );

      navigate("/register");

      return;
    }

    if (code.length !== 6) {
      showToast(
        "Please enter the 6-digit verification code.",
        "error"
      );

      return;
    }

    setLoading(true);

    try {
      await verifyEmail({
        email,
        code,
      });

      sessionStorage.removeItem(
        "shophub_verification_email"
      );

      showToast(
        "Email verified successfully. You can now login.",
        "success"
      );

      navigate("/login");
    } catch (error) {
      showToast(
        error.message ||
          "Verification failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESEND
  ========================= */

  const handleResend =
    async () => {
      if (!email) {
        showToast(
          "Verification email not found.",
          "error"
        );

        return;
      }

      setResending(true);

      try {
        await resendVerificationCode(
          email
        );

        showToast(
          "A new verification code has been sent.",
          "success"
        );

        setCode("");
      } catch (error) {
        showToast(
          error.message ||
            "Failed to resend code",
          "error"
        );
      } finally {
        setResending(false);
      }
    };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>
          Verify Your Email
        </h1>

        <p>
          We sent a 6-digit
          verification code to:
        </p>

        <p
          style={{
            fontWeight: "600",
            color: "#4f46e5",
            marginBottom: "25px",
          }}
        >
          {email ||
            "your email"}
        </p>

        <form
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <div className="form-group">

            <label className="form-label">
              Verification Code
            </label>

            <input
              className="form-control"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="Enter 6-digit code"
              style={{
                textAlign:
                  "center",
                fontSize:
                  "24px",
                letterSpacing:
                  "8px",
                fontWeight:
                  "600",
              }}
            />

          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>
        </form>

        <div
          style={{
            textAlign:
              "center",
            marginTop:
              "20px",
          }}
        >
          <p
            style={{
              marginBottom:
                "8px",
              color: "#777",
              fontSize:
                "14px",
            }}
          >
            Didn't receive
            the code?
          </p>

          <button
            type="button"
            onClick={
              handleResend
            }
            disabled={
              resending
            }
            style={{
              border:
                "none",
              background:
                "none",
              color:
                "#4f46e5",
              fontWeight:
                "600",
              cursor:
                "pointer",
              fontSize:
                "14px",
            }}
          >
            {resending
              ? "Sending..."
              : "Resend Code"}
          </button>
        </div>

      </div>
    </div>
  );
}