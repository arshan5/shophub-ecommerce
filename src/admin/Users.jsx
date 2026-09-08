import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import "./Admin.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");
  const [selectedUser, setSelectedUser] =
    useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  // =========================
  // GET USERS
  // =========================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token =
          localStorage.getItem(
            "shophub_token"
          );

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

          window.location.href =
            "/account";

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
                        <button
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
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}