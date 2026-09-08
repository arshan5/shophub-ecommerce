import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./Account.css";

const API_URL = "http://localhost:5000";

export default function Profile() {
  const { user } = useAuth();

  const getAvatarUrl = () => {
    if (!user?.avatar) {
      return "https://i.pravatar.cc/100";
    }

    if (user.avatar.startsWith("http")) {
      return user.avatar;
    }

    return `${API_URL}${
      user.avatar.startsWith("/")
        ? user.avatar
        : `/${user.avatar}`
    }`;
  };

  const fullName =
    `${user?.firstName || ""} ${
      user?.lastName || ""
    }`.trim() || "Guest User";

  return (
    <div>
      {/* Page Header */}
      <div className="flex-between account-page-title">
        <div>
          <h2>My Profile</h2>

          <p>
            Manage your personal information
          </p>
        </div>

        <Link
          to="/account/profile/edit"
          className="btn btn-primary btn-sm"
        >
          <Pencil size={14} />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <div className="card card-pad">
        <div className="profile-header">
          <img
            src={getAvatarUrl()}
            alt="Profile"
            onError={(e) => {
              e.currentTarget.src =
                "https://i.pravatar.cc/100";
            }}
          />

          <div>
            <h3>{fullName}</h3>

            <p className="text-muted">
              {user?.email || "-"}
            </p>
          </div>
        </div>

        {/* First Name */}
        <div className="profile-field-row">
          <span>First Name</span>

          <span>
            {user?.firstName || "-"}
          </span>
        </div>

        {/* Last Name */}
        <div className="profile-field-row">
          <span>Last Name</span>

          <span>
            {user?.lastName || "-"}
          </span>
        </div>

        {/* Email */}
        <div className="profile-field-row">
          <span>Email Address</span>

          <span>
            {user?.email || "-"}
          </span>
        </div>

        {/* Phone */}
        <div className="profile-field-row">
          <span>Phone Number</span>

          <span>
            {user?.phone || "Not set"}
          </span>
        </div>
      </div>
    </div>
  );
}