import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import "./Account.css";

export default function EditProfile() {
  const {
    user,
    updateProfile,
  } = useAuth();

  const { showToast } =
    useToast();

  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      firstName:
        user?.firstName || "",
      lastName:
        user?.lastName || "",
      email:
        user?.email || "",
      phone:
        user?.phone || "",
    });

  const [avatar, setAvatar] =
    useState(null);

  const [preview, setPreview] =
    useState(
      user?.avatar
        ? `${import.meta.env.VITE_API_URL}${user.avatar}`
        : "https://i.pravatar.cc/100"
    );

  const [errors, setErrors] =
    useState({});

  const [saving, setSaving] =
    useState(false);

  /*
  =========================
  HANDLE INPUT
  =========================
  */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  =========================
  HANDLE AVATAR
  =========================
  */

  const handleAvatarChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      showToast(
        "Please select an image file.",
        "error"
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      showToast(
        "Image must be less than 5MB.",
        "error"
      );

      return;
    }

    setAvatar(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  /*
  =========================
  VALIDATE
  =========================
  */

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
    }

    setErrors(errs);

    return (
      Object.keys(errs).length === 0
    );
  };

  /*
  =========================
  SUBMIT
  =========================
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        phone:
          form.phone.trim(),

        avatar,
      });

      showToast(
        "Profile updated successfully.",
        "success"
      );

      navigate(
        "/account/profile"
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      showToast(
        error.message ||
          "Failed to update profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="account-page-title">
        <h2>Edit Profile</h2>

        <p>
          Update your personal information
        </p>
      </div>

      <form
        className="card card-pad"
        style={{
          maxWidth: 560,
        }}
        onSubmit={handleSubmit}
      >
        {/* PROFILE IMAGE */}

        <div
          className="form-group"
          style={{
            marginBottom: 24,
          }}
        >
          <label className="form-label">
            Profile Picture
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <img
              src={preview}
              alt="Profile preview"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                objectFit: "cover",
                border:
                  "1px solid #e5e7eb",
              }}
            />

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={
                  handleAvatarChange
                }
              />

              <p className="form-hint">
                JPG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>
        </div>

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
              value={
                form.firstName
              }
              onChange={
                handleChange
              }
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
              value={
                form.lastName
              }
              onChange={
                handleChange
              }
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
            className="form-control"
            type="email"
            value={
              form.email
            }
            disabled
          />

          <p className="form-hint">
            Email address cannot be changed.
          </p>
        </div>

        {/* PHONE */}

        <div className="form-group">
          <label className="form-label">
            Phone Number
          </label>

          <input
            className="form-control"
            name="phone"
            value={
              form.phone
            }
            onChange={
              handleChange
            }
            placeholder="Enter phone number"
          />
        </div>

        {/* BUTTONS */}

        <div className="flex gap-12">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              navigate(
                "/account/profile"
              )
            }
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}