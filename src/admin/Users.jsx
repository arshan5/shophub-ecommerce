import { useEffect, useState } from "react";
import { Eye, Ban, Trash2 } from "lucide-react";

import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import "./Admin.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  // =========================
  // GET USERS
  // =========================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token =
          localStorage.getItem("shophub_token");

        if (!token) {
          showToast(
            "Please login as admin.",
            "error"
          );

          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem(
            "shophub_token"
          );

          localStorage.removeItem(
            "shophub_auth_user"
          );

          window.location.href = "/login";

          return;
        }

        if (response.status === 403) {
          showToast(
            "Admin access required.",
            "error"
          );

          window.location.href = "/account";

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to fetch users"
          );
        }

        const data =
          await response.json();

        setUsers(data);
      } catch (error) {
        console.error(
          "Failed to fetch users:",
          error
        );

        showToast(
          "Failed to load users.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showToast]);

  // =========================
  // BLOCK / UNBLOCK USER
  // =========================

  const handleToggleStatus = async (user) => {
    const newStatus =
      user.status === "Blocked"
        ? "Active"
        : "Blocked";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "Blocked"
          ? "block"
          : "unblock"
      } this user?`
    );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem(
          "shophub_token"
        );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/users/${user._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update user status."
        );
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === user._id
            ? {
                ...u,
                status: newStatus,
              }
            : u
        )
      );

      // Update modal user if open
      if (
        selectedUser &&
        selectedUser._id === user._id
      ) {
        setSelectedUser((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }

      showToast(
        `User ${
          newStatus === "Blocked"
            ? "blocked"
            : "unblocked"
        } successfully.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      showToast(
        error.message ||
          "Failed to update user status.",
        "error"
      );
    }
  };

  // =========================
  // DELETE USER
  // =========================

  const handleDeleteUser = async (
    userId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this user?"
    );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem(
          "shophub_token"
        );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete user."
        );
      }

      setUsers((prevUsers) =>
        prevUsers.filter(
          (user) =>
            user._id !== userId
        )
      );

      setSelectedUser(null);

      showToast(
        "User deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      showToast(
        error.message ||
          "Failed to delete user.",
        "error"
      );
    }
  };

  // =========================
  // FILTER USERS
  // =========================

  const filtered = users.filter((u) => {
    const name =
      `${u.firstName || ""} ${
        u.lastName || ""
      }`.trim();

    const email =
      u.email || "";

    const searchValue =
      search.toLowerCase();

    const matchesSearch =
      name
        .toLowerCase()
        .includes(searchValue) ||
      email
        .toLowerCase()
        .includes(searchValue);

    const userStatus =
      u.status || "Active";

    const matchesStatus =
      !statusFilter ||
      userStatus === statusFilter;

    return (
      matchesSearch &&
      matchesStatus
    );
  });

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1>Users</h1>

            <p>
              View and manage customer
              accounts
            </p>
          </div>
        </div>

        <p>Loading users...</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Users</h1>

          <p>
            View and manage customer
            accounts
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
        />

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option value="">
            All Statuses
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Blocked">
            Blocked
          </option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((u) => {
                const name =
                  `${u.firstName || ""} ${
                    u.lastName || ""
                  }`.trim();

                const isAdmin =
                  u.role === "admin";

                const isBlocked =
                  u.status === "Blocked";

                return (
                  <tr key={u._id}>
                    <td>
                      <div
                        className="flex"
                        style={{
                          gap: 10,
                          alignItems:
                            "center",
                        }}
                      >
                        <img
                          src={
                            u.avatar
                              ? `${import.meta.env.VITE_API_URL}${u.avatar}`
                              : "/placeholder.png"
                          }
                          alt={name}
                          className="table-thumb"
                          style={{
                            borderRadius:
                              "50%",
                          }}
                        />

                        <span>
                          {name ||
                            "Unnamed User"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {u.email}
                    </td>

                    <td>
                      {u.ordersCount ||
                        0}
                    </td>

                    <td>
                      $
                      {Number(
                        u.totalSpent ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={`status-pill status-${(
                          u.status ||
                          "Active"
                        ).toLowerCase()}`}
                      >
                        {u.status ||
                          "Active"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        {/* VIEW */}
                        <button
                          type="button"
                          title="View"
                          onClick={() =>
                            setSelectedUser(
                              u
                            )
                          }
                        >
                          <Eye
                            size={14}
                          />
                        </button>

                        {/* BLOCK / UNBLOCK */}
                        {!isAdmin && (
                          <button
                            type="button"
                            title={
                              isBlocked
                                ? "Unblock"
                                : "Block"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                u
                              )
                            }
                          >
                            <Ban
                              size={14}
                            />
                          </button>
                        )}

                        {/* DELETE */}
                        {!isAdmin && (
                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              handleDeleteUser(
                                u._id
                              )
                            }
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign:
                      "center",
                    padding: "40px",
                  }}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================
          USER DETAILS MODAL
      ========================= */}

      <Modal
        open={!!selectedUser}
        onClose={() =>
          setSelectedUser(null)
        }
        title="User Details"
      >
        {selectedUser && (
          <div>
            {(() => {
              const name =
                `${selectedUser.firstName || ""} ${
                  selectedUser.lastName ||
                  ""
                }`.trim();

              const isAdmin =
                selectedUser.role ===
                "admin";

              const isBlocked =
                selectedUser.status ===
                "Blocked";

              return (
                <>
                  <div
                    className="flex"
                    style={{
                      gap: 14,
                      alignItems:
                        "center",
                      marginBottom: 20,
                    }}
                  >
                    <img
                      src={
                        selectedUser.avatar
                          ? `${import.meta.env.VITE_API_URL}${selectedUser.avatar}`
                          : "/placeholder.png"
                      }
                      alt={name}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius:
                          "50%",
                        objectFit:
                          "cover",
                      }}
                    />

                    <div>
                      <strong>
                        {name ||
                          "Unnamed User"}
                      </strong>

                      <p
                        className="text-muted"
                        style={{
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        {
                          selectedUser.email
                        }
                      </p>
                    </div>
                  </div>

                  <div className="profile-field-row">
                    <span>
                      Total Orders
                    </span>

                    <span>
                      {selectedUser.ordersCount ||
                        0}
                    </span>
                  </div>

                  <div className="profile-field-row">
                    <span>
                      Total Spent
                    </span>

                    <span>
                      $
                      {Number(
                        selectedUser.totalSpent ||
                          0
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="profile-field-row">
                    <span>
                      Status
                    </span>

                    <span
                      className={`status-pill status-${(
                        selectedUser.status ||
                        "Active"
                      ).toLowerCase()}`}
                    >
                      {selectedUser.status ||
                        "Active"}
                    </span>
                  </div>

                  <div className="profile-field-row">
                    <span>
                      Role
                    </span>

                    <span>
                      {selectedUser.role ||
                        "customer"}
                    </span>
                  </div>

                  <div className="profile-field-row">
                    <span>
                      Phone
                    </span>

                    <span>
                      {selectedUser.phone ||
                        "-"}
                    </span>
                  </div>

                  {/* MODAL ACTIONS */}
                  {!isAdmin && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 24,
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() =>
                          handleToggleStatus(
                            selectedUser
                          )
                        }
                      >
                        <Ban
                          size={14}
                        />

                        {isBlocked
                          ? "Unblock User"
                          : "Block User"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() =>
                          handleDeleteUser(
                            selectedUser._id
                          )
                        }
                      >
                        <Trash2
                          size={14}
                        />

                        Delete User
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}