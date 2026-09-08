import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import "./Admin.css";

export default function Settings() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    storeName: "",
    storeEmail: "",
    currency: "USD",
    lowStockAlert: 10,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem(
    "shophub_token"
  );

  // =========================
  // GET SETTINGS
  // =========================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/settings`,
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

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load settings."
          );
        }

        setForm({
          storeName:
            data.storeName || "ShopHub",

          storeEmail:
            data.storeEmail ||
            "support@shophub.com",

          currency:
            data.currency || "USD",

          lowStockAlert:
            data.lowStockAlert ?? 10,
        });
      } catch (error) {
        console.error(
          "Settings error:",
          error
        );

        showToast(
          "Failed to load settings.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token, showToast]);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  // =========================
  // SAVE SETTINGS
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            storeName:
              form.storeName,

            storeEmail:
              form.storeEmail,

            currency:
              form.currency,

            lowStockAlert:
              Number(
                form.lowStockAlert
              ),
          }),
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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save settings."
        );
      }

      showToast(
        "Settings saved",
        "success"
      );
    } catch (error) {
      console.error(
        "Save settings error:",
        error
      );

      showToast(
        error.message ||
          "Failed to save settings.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1>Settings</h1>
            <p>
              Configure your store
              preferences
            </p>
          </div>
        </div>

        <div className="admin-form-card">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Settings</h1>

          <p>
            Configure your store
            preferences
          </p>
        </div>
      </div>

      <form
        className="admin-form-card"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label className="form-label">
            Store Name
          </label>

          <input
            className="form-control"
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Store Contact Email
          </label>

          <input
            className="form-control"
            name="storeEmail"
            type="email"
            value={form.storeEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Currency
            </label>

            <select
              className="form-control"
              name="currency"
              value={form.currency}
              onChange={handleChange}
            >
              <option value="USD">
                USD ($)
              </option>

              <option value="EUR">
                EUR (€)
              </option>

              <option value="PKR">
                PKR (₨)
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Low Stock Alert Threshold
            </label>

            <input
              className="form-control"
              name="lowStockAlert"
              type="number"
              min="0"
              value={form.lowStockAlert}
              onChange={handleChange}
            />
          </div>
        </div>

        <p className="form-hint mb-16">
          These settings are stored
          securely in the database and
          can be updated by an admin.
        </p>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Settings"}
        </button>
      </form>
    </div>
  );
}