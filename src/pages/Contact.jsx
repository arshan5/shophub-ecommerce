import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

import Breadcrumb from "../components/Breadcrumb";
import { useToast } from "../context/ToastContext";
import "./StaticPages.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Contact() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = "Name is required";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      errs.email = "Enter a valid email";
    }

    if (!form.message.trim()) {
      errs.message = "Message is required";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/contact`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to send message."
        );
      }

      showToast(
        "Your message has been sent successfully.",
        "success"
      );

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setErrors({});
    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      showToast(
        error.message ||
          "Failed to send your message.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              {
                label: "Home",
                to: "/",
              },
              {
                label: "Contact",
              },
            ]}
          />

          <h1>Contact Us</h1>
        </div>
      </div>

      <div className="container section contact-layout">
        <div className="contact-info">
          <h2>Get in Touch</h2>

          <p className="text-muted mb-16">
            Have a question about an order or a
            product? Our team is happy to help.
          </p>

          <div className="contact-info-item">
            <MapPin size={18} />

            <span>
              221 Maple Street, Lahore, Pakistan
            </span>
          </div>

          <div className="contact-info-item">
            <Phone size={18} />

            <span>
              +92 300 1234567
            </span>
          </div>

          <div className="contact-info-item">
            <Mail size={18} />

            <span>
              support@shophub.com
            </span>
          </div>

          <div className="contact-info-item">
            <Clock size={18} />

            <span>
              Mon - Fri: 9am - 6pm
            </span>
          </div>
        </div>

        <form
          className="card card-pad contact-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Your Name
              </label>

              <input
                className={`form-control ${
                  errors.name
                    ? "has-error"
                    : ""
                }`}
                name="name"
                value={form.name}
                onChange={handleChange}
              />

              {errors.name && (
                <p className="form-error">
                  {errors.name}
                </p>
              )}
            </div>

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
              />

              {errors.email && (
                <p className="form-error">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Subject
            </label>

            <input
              className="form-control"
              name="subject"
              value={form.subject}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Message
            </label>

            <textarea
              className={`form-control ${
                errors.message
                  ? "has-error"
                  : ""
              }`}
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
            />

            {errors.message && (
              <p className="form-error">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}