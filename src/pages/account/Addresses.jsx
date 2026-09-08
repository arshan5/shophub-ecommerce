import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import Modal from "../../components/Modal";
import { useToast } from "../../context/ToastContext";
import "./Account.css";

const API_URL = import.meta.env.VITE_API_URL;

const emptyForm = {
  label: "",
  name: "",
  line1: "",
  city: "",
  country: "",
  postalCode: "",
  phone: "",
};

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const getToken = () => {
    return localStorage.getItem("shophub_token");
  };

  // =========================
  // LOAD ADDRESSES
  // =========================
  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(`${API_URL}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load addresses.");
      }

      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch addresses error:", error);
      showToast(error.message || "Failed to load addresses.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // =========================
  // ADD ADDRESS
  // =========================
  const openAddModal = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setModalOpen(true);
  };

  // =========================
  // EDIT ADDRESS
  // =========================
  const openEditModal = (address) => {
    setForm({
      label: address.label || "",
      name: address.name || "",
      line1: address.line1 || "",
      city: address.city || "",
      country: address.country || "",
      postalCode: address.postalCode || "",
      phone: address.phone || "",
    });

    setEditingId(address._id || address.id);
    setModalOpen(true);
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SAVE ADDRESS
  // =========================
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const token = getToken();

      const url = editingId
        ? `${API_URL}/api/addresses/${editingId}`
        : `${API_URL}/api/addresses`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          default: editingId
            ? addresses.find(
                (address) =>
                  (address._id || address.id) === editingId
              )?.default || false
            : false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save address."
        );
      }

      showToast(
        editingId
          ? "Address updated successfully."
          : "Address added successfully.",
        "success"
      );

      setModalOpen(false);
      setForm({ ...emptyForm });
      setEditingId(null);

      await fetchAddresses();
    } catch (error) {
      console.error("Save address error:", error);

      showToast(
        error.message || "Failed to save address.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE ADDRESS
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/addresses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete address."
        );
      }

      showToast(
        "Address deleted successfully.",
        "info"
      );

      await fetchAddresses();
    } catch (error) {
      console.error("Delete address error:", error);

      showToast(
        error.message || "Failed to delete address.",
        "error"
      );
    }
  };

  // =========================
  // SET DEFAULT ADDRESS
  // =========================
  const handleSetDefault = async (address) => {
    const id = address._id || address.id;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/addresses/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            label: address.label,
            name: address.name,
            line1: address.line1,
            city: address.city,
            country: address.country,
            postalCode: address.postalCode,
            phone: address.phone,
            default: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to set default address."
        );
      }

      showToast(
        "Default address updated.",
        "success"
      );

      await fetchAddresses();
    } catch (error) {
      console.error(
        "Set default address error:",
        error
      );

      showToast(
        error.message ||
          "Failed to set default address.",
        "error"
      );
    }
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="flex-between account-page-title">
        <div>
          <h2>Saved Addresses</h2>
          <p>Manage your shipping addresses</p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={openAddModal}
        >
          <Plus size={14} />
          Add Address
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="card">
          <p>Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="card">
          <p>
            You don't have any saved addresses yet.
          </p>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((address) => {
            const addressId =
              address._id || address.id;

            return (
              <div
                key={addressId}
                className="card address-card"
              >
                {/* DEFAULT BADGE */}
                {address.default && (
                  <span className="badge badge-success">
                    Default
                  </span>
                )}

                <h4>{address.label}</h4>

                <p>
                  {address.name}
                  <br />
                  {address.line1}
                  <br />
                  {address.city},{" "}
                  {address.country}{" "}
                  {address.postalCode}
                  <br />
                  {address.phone}
                </p>

                <div className="address-card-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      openEditModal(address)
                    }
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      handleDelete(addressId)
                    }
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>

                  {!address.default && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        handleSetDefault(address)
                      }
                    >
                      <Check size={13} />
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingId
            ? "Edit Address"
            : "Add Address"
        }
      >
        <form onSubmit={handleSave}>
          {/* LABEL */}
          <div className="form-group">
            <label className="form-label">
              Label (e.g. Home, Office)
            </label>

            <input
              className="form-control"
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="Home"
              required
            />
          </div>

          {/* FULL NAME */}
          <div className="form-group">
            <label className="form-label">
              Full Name
            </label>

            <input
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          {/* STREET */}
          <div className="form-group">
            <label className="form-label">
              Street Address
            </label>

            <input
              className="form-control"
              name="line1"
              value={form.line1}
              onChange={handleChange}
              placeholder="Street address"
              required
            />
          </div>

          {/* CITY / COUNTRY */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                City
              </label>

              <input
                className="form-control"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Country
              </label>

              <input
                className="form-control"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Country"
                required
              />
            </div>
          </div>

          {/* POSTAL / PHONE */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Postal Code
              </label>

              <input
                className="form-control"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="54000"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone
              </label>

              <input
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                required
              />
            </div>
          </div>

          {/* SAVE */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Address"}
          </button>
        </form>
      </Modal>
    </div>
  );
}