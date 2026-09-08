import { useEffect, useState } from "react";
import { Mail, Trash2, Users } from "lucide-react";
import "./Admin.css";

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("shophub_token");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/newsletter/subscribers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (response.status === 403) {
        window.location.href = "/account";
        return;
      }

      const data = await response.json();

      setSubscribers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Newsletter error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subscriber?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/newsletter/subscribers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete subscriber.");
        return;
      }

      setSubscribers((current) =>
        current.filter((subscriber) => subscriber._id !== id)
      );
    } catch (error) {
      console.error("Delete subscriber error:", error);
      alert("Unable to delete subscriber.");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "-";
    }

    return formattedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1>Newsletter Subscribers</h1>
            <p>Manage customers subscribed to your newsletter</p>
          </div>
        </div>

        <div className="chart-placeholder">
          Loading subscribers...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Newsletter Subscribers</h1>
          <p>Manage customers subscribed to your newsletter</p>
        </div>
      </div>

      {/* Subscriber Stats */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <Users size={20} />
          </div>

          <div>
            <div className="stat-card-value">
              {subscribers.length}
            </div>

            <div className="stat-card-label">
              Total Subscribers
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green">
            <Mail size={20} />
          </div>

          <div>
            <div className="stat-card-value">
              Active
            </div>

            <div className="stat-card-label">
              Newsletter Status
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="chart-placeholder">
        <div
          className="flex-between"
          style={{ marginBottom: 16 }}
        >
          <h3 style={{ fontSize: "1rem" }}>
            Subscriber List
          </h3>

          <span
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.85rem",
            }}
          >
            {subscribers.length} subscriber
            {subscribers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {subscribers.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
              color: "var(--color-text-muted)",
            }}
          >
            <Mail
              size={40}
              style={{
                marginBottom: 12,
                opacity: 0.5,
              }}
            />

            <p style={{ margin: 0 }}>
              No newsletter subscribers yet.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Subscribed Date</th>
                  <th style={{ textAlign: "right" }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {subscribers.map(
                  (subscriber, index) => (
                    <tr key={subscriber._id}>
                      <td>{index + 1}</td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Mail size={15} />

                          <span>
                            {subscriber.email}
                          </span>
                        </div>
                      </td>

                      <td>
                        {formatDate(
                          subscriber.subscribedAt ||
                            subscriber.createdAt
                        )}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              subscriber._id
                            )
                          }
                          title="Delete subscriber"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 34,
                            height: 34,
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            background:
                              "rgba(220, 38, 38, 0.1)",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}